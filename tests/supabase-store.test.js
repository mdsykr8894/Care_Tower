'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {supabaseAdapter}=require('../server/supabase-store');

test('Supabase adapter reads and atomically updates the versioned snapshot',async()=>{
 const oldFetch=global.fetch,oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY,oldSecret=process.env.SUPABASE_SECRET_KEY;
 const calls=[];
 process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='service-key';
 global.fetch=async(url,options={})=>{
  calls.push({url,options});
  if(options.method==='PATCH')return {ok:true,status:200,json:async()=>[{id:'current-session',version:8,snapshot:{revision:7}}]};
  return {ok:true,status:200,json:async()=>[{id:'current-session',version:7,snapshot:{revision:6}}]};
 };
 try{
  const adapter=supabaseAdapter();const first=await adapter.read();assert.equal(first.etag,'7');assert.equal(first.snapshot.revision,6);
  await adapter.write({revision:7},first.etag);assert.match(calls[1].url,/version=eq\.7/);assert.match(calls[1].url,/select=id,version/);assert.equal(JSON.parse(calls[1].options.body).version,8);
 }finally{
  global.fetch=oldFetch;
  if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl;
  if(oldKey===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;
  if(oldSecret===undefined)delete process.env.SUPABASE_SECRET_KEY;else process.env.SUPABASE_SECRET_KEY=oldSecret;
 }
});

test('Supabase adapter accepts the preferred secret key name',async()=>{
 const oldUrl=process.env.SUPABASE_URL,oldRole=process.env.SUPABASE_SERVICE_ROLE_KEY,oldSecret=process.env.SUPABASE_SECRET_KEY;
 process.env.SUPABASE_URL='https://example.supabase.co';
 delete process.env.SUPABASE_SERVICE_ROLE_KEY;
 process.env.SUPABASE_SECRET_KEY='secret-key';
 try{
  const adapter=supabaseAdapter();
  const oldFetch=global.fetch;
  global.fetch=async(_url,options)=>({ok:true,status:200,json:async()=>[{id:'current-session',version:1,snapshot:{}}],headers:options});
  try{await adapter.read();}finally{global.fetch=oldFetch;}
 }finally{
  if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl;
  if(oldRole===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=oldRole;
  if(oldSecret===undefined)delete process.env.SUPABASE_SECRET_KEY;else process.env.SUPABASE_SECRET_KEY=oldSecret;
 }
});
