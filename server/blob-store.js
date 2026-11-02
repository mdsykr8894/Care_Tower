'use strict';
// Single-session optimistic storage. Works in separate serverless instances.
const {GameState}=require('./game-state');
const PATH=process.env.CARE_STATE_PATH||'care-tower/current-session.json';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function conflict(e){return e?.status===409||e?.status===412||/precondition|already.exists|conflict/i.test(e?.name||'')||/precondition|already exists|conflict/i.test(e?.message||'');}
function blobAdapter(){
 const {get,put}=require('@vercel/blob');
 return {
  async read(){const r=await get(PATH,{access:'private',useCache:false});if(!r)return {snapshot:null,etag:null};const text=await new Response(r.stream).text();return {snapshot:JSON.parse(text),etag:r.blob.etag};},
  async write(snapshot,etag){await put(PATH,JSON.stringify(snapshot),{access:'private',contentType:'application/json',cacheControlMaxAge:60,...(etag?{allowOverwrite:true,ifMatch:etag}:{allowOverwrite:false})});}
 };
}
async function query(adapter,fn){const {snapshot}=await adapter.read();const game=GameState.fromSnapshot(snapshot);game.tick(Date.now());return fn(game);}
async function transaction(adapter,fn,{retries=24}={}){
 for(let n=0;n<retries;n++){
  const {snapshot,etag}=await adapter.read();const game=GameState.fromSnapshot(snapshot);
  game.tick(Date.now());const result=await fn(game);
  try{await adapter.write(game.toSnapshot(),etag);return result;}
  catch(e){if(!conflict(e))throw e;if(n===retries-1)break;await pause(Math.min(15+n*12,190)+Math.floor(Math.random()*26));}
 }
 const e=new Error('Ramai pemain sedang menyertai serentak. Sila cuba lagi.');e.status=503;throw e;
}
module.exports={blobAdapter,query,transaction,conflict};
