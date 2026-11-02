'use strict';
// Single-session optimistic storage. Works in separate serverless instances.
const {GameState}=require('./game-state');
const {supabaseAdapter}=require('./supabase-store');
const PATH=process.env.CARE_STATE_PATH||'care-tower/current-session.json';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let writeTail=Promise.resolve();
function conflict(e){return e?.status===409||e?.status===412||e?.statusCode===409||e?.statusCode===412||/precondition|already.exists|conflict/i.test(e?.name||'')||/precondition|already exists|conflict/i.test(e?.message||'');}
function blobAdapter(){
 const {get,head,put}=require('@vercel/blob');
 const readSnapshot=async()=>{
  const r=await get(PATH,{access:'private',useCache:false});
  if(!r)return {snapshot:null,etag:null};
  const text=await new Response(r.stream).text();
  return {snapshot:JSON.parse(text),etag:r.blob.etag};
 };
 return {
  async readSnapshot(){return readSnapshot();},
  async read(){
   const result=await readSnapshot();
   if(!result.snapshot)return result;
   // get() returns the document, while head() asks Blob for current metadata.
   // Keeping the ETag from a separate metadata request avoids retrying forever
   // when a private-blob CDN response contains an older ETag than the object.
   const metadata=await head(PATH,{access:'private'});
   return {...result,etag:metadata.etag};
  },
  async write(snapshot,etag){await put(PATH,JSON.stringify(snapshot),{access:'private',contentType:'application/json',cacheControlMaxAge:60,...(etag?{allowOverwrite:true,ifMatch:etag}:{allowOverwrite:false})});}
 };
}
async function query(adapter,fn){const reader=typeof adapter.readSnapshot==='function'?adapter.readSnapshot():adapter.read();const {snapshot}=await reader;const game=GameState.fromSnapshot(snapshot);game.tick(Date.now());return fn(game);}
async function transactionUnlocked(adapter,fn,{retries=24}={}){
 for(let n=0;n<retries;n++){
  const {snapshot,etag}=await adapter.read();const game=GameState.fromSnapshot(snapshot);
  game.tick(Date.now());const result=await fn(game);
  try{await adapter.write(game.toSnapshot(),etag);return result;}
  catch(e){if(!conflict(e))throw e;if(n===retries-1)break;await pause(Math.min(15+n*12,190)+Math.floor(Math.random()*26));}
 }
 const e=new Error('Ramai pemain sedang menyertai serentak. Sila cuba lagi.');e.status=503;throw e;
}
function transaction(adapter,fn,options){
 // Keep writes from the same warm function in order. Other Vercel instances
 // are still protected by the Blob ETag retry loop above.
 const run=writeTail.then(()=>transactionUnlocked(adapter,fn,options),()=>transactionUnlocked(adapter,fn,options));
 writeTail=run.catch(()=>undefined);
 return run;
}
function storageAdapter(){
 const requested=String(process.env.CARE_STORAGE||'').toLowerCase();
 const useSupabase=requested==='supabase'||(!requested&&process.env.SUPABASE_URL&&(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SERVICE_KEY));
 return useSupabase?supabaseAdapter():blobAdapter();
}
module.exports={blobAdapter,supabaseAdapter,storageAdapter,query,transaction,conflict};
