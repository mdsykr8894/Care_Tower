'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {GameState}=require('../server/game-state');
const {transaction,query}=require('../server/blob-store');
function mockStore(){let saved=null,version=0;return {
 async read(){await Promise.resolve();return {snapshot:saved?structuredClone(saved):null,etag:saved?String(version):null};},
 async write(s,etag){await Promise.resolve();if(etag===null){if(saved){const e=new Error('BlobAlreadyExistsError');e.status=409;throw e;}}else if(etag!==String(version)){const e=new Error('BlobPreconditionFailedError');e.status=412;throw e;} saved=structuredClone(s);version++;},
 getSnapshot:()=>saved
};}
test('snapshot retains players, actions, pause and scores across separate instances',()=>{
 const g=new GameState();const p=g.register('Lily',1000);g.start(2000);g.drop(p.token,0,2300,'drop-0001');const snapshot=g.toSnapshot();const restored=GameState.fromSnapshot(structuredClone(snapshot));
 assert.equal(restored.players.size,1);assert.equal(restored.getPlayer(p.token).actions.size,1);
 assert.deepEqual(restored.drop(p.token,0,2600,'drop-0001').points,g.getPlayer(p.token).stackScore);
});
test('cloud CAS resolves 40 simultaneous joins without losing players',async()=>{
 const adapter=mockStore();const joins=await Promise.all(Array.from({length:40},(_,i)=>transaction(adapter,g=>g.register('Player '+i),{retries:80})));
 assert.equal(joins.length,40);assert.equal((await query(adapter,g=>g.publicState())).players,40);
 const names=(await query(adapter,g=>g.publicState())).lobbyPlayers.map(x=>x.name);
 assert.equal(new Set(names).size,40);
});
test('cloud writes preserve game state and allow idempotent retry',async()=>{
 const adapter=mockStore();const result=await transaction(adapter,g=>{const p=g.register('Aria');return p.token;});
 await transaction(adapter,g=>g.start());
 const one=await transaction(adapter,g=>g.drop(result,10,Date.now(),'drop-cloud-0001'));
 const two=await transaction(adapter,g=>g.drop(result,10,Date.now()+100,'drop-cloud-0001'));
 assert.equal(one.points,two.points);
 const s=await query(adapter,g=>g.playerState(result));assert.equal(s.player.stackScore,one.points);
});
