'use strict';

const STATE_ID=process.env.SUPABASE_STATE_ID||'current-session';

function supabaseAdapter(){
 const base=String(process.env.SUPABASE_URL||'').replace(/\/$/,'');
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SERVICE_KEY||'';
 if(!base||!key)throw Error('Supabase belum disambungkan. Tetapkan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.');
 const endpoint=`${base}/rest/v1/care_state`;
 const headers={'apikey':key,'Authorization':`Bearer ${key}`,'Content-Type':'application/json','Accept':'application/json'};
 async function responseError(response){
  let detail='';try{detail=await response.text();}catch{}
  const error=new Error(`Supabase ${response.status}: ${detail.slice(0,300)}`);error.status=response.status;return error;
 }
 async function read(){
  const response=await fetch(`${endpoint}?id=eq.${encodeURIComponent(STATE_ID)}&select=id,version,snapshot&limit=1`,{headers:{...headers,'Cache-Control':'no-cache'}});
  if(!response.ok)throw await responseError(response);
  const rows=await response.json();
  if(!rows.length)return {snapshot:null,etag:null};
  return {snapshot:rows[0].snapshot,etag:String(rows[0].version)};
 }
 return {
  async readSnapshot(){return read();},
  async read(){return read();},
  async write(snapshot,etag){
   if(etag===null||etag===undefined){
    const response=await fetch(endpoint,{method:'POST',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({id:STATE_ID,version:1,snapshot,updated_at:new Date().toISOString()})});
    if(!response.ok)throw await responseError(response);
    return;
   }
   const expected=Number(etag);if(!Number.isSafeInteger(expected))throw Error('Supabase state version tidak sah.');
   const response=await fetch(`${endpoint}?id=eq.${encodeURIComponent(STATE_ID)}&version=eq.${expected}`,{method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify({version:expected+1,snapshot,updated_at:new Date().toISOString()})});
   if(!response.ok)throw await responseError(response);
   const rows=await response.json();
   if(!Array.isArray(rows)||rows.length!==1){const error=Error('Supabase state conflict.');error.status=409;throw error;}
  }
 };
}

module.exports={supabaseAdapter};
