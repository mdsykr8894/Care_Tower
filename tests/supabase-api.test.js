'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {GameState}=require('../server/game-state');
const handler=require('../api/handler');

test('Supabase cloud API does not require Blob credentials',async()=>{
 const names=['CARE_STORAGE','SUPABASE_URL','SUPABASE_SECRET_KEY','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_SERVICE_KEY','BLOB_READ_WRITE_TOKEN','BLOB_STORE_ID','VERCEL_OIDC_TOKEN'];
 const saved=Object.fromEntries(names.map(name=>[name,process.env[name]]));
 const oldFetch=global.fetch;
 try{
  process.env.CARE_STORAGE='supabase';
  process.env.SUPABASE_URL='https://example.supabase.co';
  process.env.SUPABASE_SECRET_KEY='secret-key';
  for(const name of ['SUPABASE_SERVICE_ROLE_KEY','SUPABASE_SERVICE_KEY','BLOB_READ_WRITE_TOKEN','BLOB_STORE_ID','VERCEL_OIDC_TOKEN'])delete process.env[name];
  const snapshot=new GameState().toSnapshot();
  global.fetch=async()=>({ok:true,status:200,json:async()=>[{id:'current-session',version:1,snapshot}]});
  const req={method:'GET',url:'/api/state',query:{},headers:{},socket:{remoteAddress:'127.0.0.1'}};
  const res={statusCode:0,body:'',setHeader(){},end(value){this.body=String(value||'');}};
  await handler(req,res);
  assert.equal(res.statusCode,200);
  assert.equal(JSON.parse(res.body).status,'waiting');
 }finally{
  global.fetch=oldFetch;
  for(const name of names){if(saved[name]===undefined)delete process.env[name];else process.env[name]=saved[name];}
 }
});
