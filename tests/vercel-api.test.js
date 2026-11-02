'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http'),Module=require('node:module');
const original=Module._load;let entry=null,count=0;
const fakeBlob={
 async get(){if(!entry)return null;return {blob:{etag:entry.tag},stream:new Response(entry.data).body};},
 async head(){if(!entry){const e=new Error('not found');e.status=404;throw e;}return {etag:entry.tag};},
 async put(_path,data,opt){if(!entry&&opt.allowOverwrite){const e=new Error('precondition');e.status=412;throw e;}
 if(entry&&(!opt.allowOverwrite||opt.ifMatch!==entry.tag)){const e=new Error('precondition');e.status=412;throw e;}
 entry={data,tag:String(++count)};return {etag:entry.tag};}
};
Module._load=function(name,parent,isMain){if(name==='@vercel/blob')return fakeBlob;if(name==='qrcode')return {toString:async()=>'<svg xmlns="http://www.w3.org/2000/svg"/>'};return original.apply(this,arguments);};
const handler=require('../api/handler');
let server,base;
function wrap(){return (req,res)=>{const u=new URL(req.url,'http://localhost');req.query=Object.fromEntries(u.searchParams);handler(req,res);};}
test.before(async()=>{process.env.HOST_PIN='cloud-test-secret';process.env.BLOB_READ_WRITE_TOKEN='test-token';server=http.createServer(wrap());await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;});
test.after(async()=>{await new Promise(r=>server.close(r));delete process.env.BLOB_READ_WRITE_TOKEN;Module._load=original;});
async function call(route,method='GET',body,token='',pin=''){
 const r=await fetch(base+'/api/handler?route='+route,{method,headers:{...(token?{'x-player-token':token}:{}),...(pin?{'x-host-pin':pin}:{}),'content-type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json()};
}
test('Vercel API handler performs one-session join/start/drop with private persisted state',async()=>{
 const a=await call('join','POST',{nickname:'Aisyah'});assert.equal(a.status,200);
 const b=await call('join','POST',{nickname:'Faz'});assert.equal(b.status,200);
 const lobby=await call('state');assert.equal(lobby.body.players,2);assert.deepEqual(lobby.body.lobbyPlayers.map(x=>x.name),['Aisyah','Faz']);
 assert.equal((await call('host/start','POST',null,'','wrong')).status,403);
 assert.equal((await call('host/start','POST',null,'','cloud-test-secret')).body.status,'playing');
 const d=await call('drop','POST',{elapsed:100,actionId:'cloud-drop-001'},a.body.token);assert.equal(d.status,200);
 const again=await call('drop','POST',{elapsed:300,actionId:'cloud-drop-001'},a.body.token);assert.equal(again.body.points,d.body.points);
 assert.equal((await call('state')).body.leaderboard.length,2);
});
