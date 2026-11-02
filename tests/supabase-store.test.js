'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {supabaseAdapter}=require('../server/supabase-store');

test('Supabase adapter reads and atomically updates the versioned snapshot',async()=>{
 const oldFetch=global.fetch,oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 const calls=[];
 process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='service-key';
 global.fetch=async(url,options={})=>{
  calls.push({url,options});
  if(options.method==='PATCH')return {ok:true,status:200,json:async()=>[{id:'current-session',version:8,snapshot:{revision:7}}]};
  return {ok:true,status:200,json:async()=>[{id:'current-session',version:7,snapshot:{revision:6}}]};
 };
 try{
  const adapter=supabaseAdapter();const first=await adapter.read();assert.equal(first.etag,'7');assert.equal(first.snapshot.revision,6);
  await adapter.write({revision:7},first.etag);assert.match(calls[1].url,/version=eq\.7/);assert.equal(JSON.parse(calls[1].options.body).version,8);
 }finally{
  global.fetch=oldFetch;
  if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl;
  if(oldKey===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;
 }
});
