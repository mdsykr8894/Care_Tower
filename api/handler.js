'use strict';
const {randomBytes,timingSafeEqual}=require('node:crypto');
const {storageAdapter,query,transaction}=require('../server/blob-store');
const {exportCsv}=require('../server/export-data');
const version=require('../server/version');
let adapter;
const getAdapter=()=>adapter||(adapter=storageAdapter());
const hostFailures=new Map(),HOST_WINDOW_MS=60000,HOST_MAX_FAILURES=8,HOST_BLOCK_MS=300000;
function send(res,code,obj){res.statusCode=code;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(obj));}
function hostAttemptKey(req){return String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim().slice(0,100);}
function hostAttemptAllowed(key,now=Date.now()){const entry=hostFailures.get(key);if(!entry)return true;if(entry.blockedUntil>now)return false;if(now-entry.windowStart>=HOST_WINDOW_MS){hostFailures.delete(key);return true;}return true;}
function recordHostFailure(key,now=Date.now()){const entry=hostFailures.get(key);if(!entry||now-entry.windowStart>=HOST_WINDOW_MS){hostFailures.set(key,{windowStart:now,failures:1,blockedUntil:0});return;}entry.failures++;if(entry.failures>=HOST_MAX_FAILURES)entry.blockedUntil=now+HOST_BLOCK_MS;}
function validHost(req){const key=hostAttemptKey(req);if(!hostAttemptAllowed(key))return false;const pin=process.env.HOST_PIN||process.env.PRESENTER_SECRET;if(!pin||pin.length<8){recordHostFailure(key);return false;}const a=Buffer.from(String(req.headers['x-host-pin']||'')),b=Buffer.from(pin);const ok=a.length===b.length&&timingSafeEqual(a,b);if(ok)hostFailures.delete(key);else recordHostFailure(key);return ok;}
function requireHost(req){if(!validHost(req)){const e=new Error('Kata laluan presenter tidak sah.');e.status=403;throw e;}}
function origin(req){const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim();const proto=String(req.headers['x-forwarded-proto']||'https').split(',')[0].trim();return `${proto==='http'?'http':'https'}://${host}/`;}
async function jsonBody(req){if(typeof req.body==='object'&&req.body!==null)return req.body;let raw='';for await(const part of req){raw+=part;if(raw.length>12000)throw Error('Permintaan terlalu besar.');}try{return JSON.parse(raw||'{}');}catch{throw Error('JSON tidak sah.');}}
function supabaseConfigured(){return Boolean(process.env.SUPABASE_URL&&(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SERVICE_KEY));}
function storageConfigured(){const requested=String(process.env.CARE_STORAGE||'').toLowerCase();if(requested==='supabase')return supabaseConfigured();if(requested==='blob')return Boolean(process.env.BLOB_READ_WRITE_TOKEN||process.env.BLOB_STORE_ID||process.env.VERCEL_OIDC_TOKEN);return supabaseConfigured()||Boolean(process.env.BLOB_READ_WRITE_TOKEN||process.env.BLOB_STORE_ID||process.env.VERCEL_OIDC_TOKEN);}
function pathname(req){const route=req.query?.route;if(typeof route==='string'&&route)return '/api/'+route.replace(/^\/+/, '');if(Array.isArray(route)&&route.length)return '/api/'+route.join('/');return new URL(req.url,'https://example.test').pathname;}
module.exports=async function handler(req,res){
 let activeRoute='unknown';
 try{
  const route=pathname(req),method=req.method;activeRoute=route;
  if(route==='/api/config'&&method==='GET')return send(res,200,{cloud:true});
  if(route==='/api/links'&&method==='GET')return send(res,200,{links:[origin(req)],recommended:origin(req)});
  if(route==='/api/health'&&method==='GET'){
   const requested=String(process.env.CARE_STORAGE||'').toLowerCase();
   const useSupabase=requested==='supabase'||(!requested&&supabaseConfigured());
   if(useSupabase&&!process.env.SUPABASE_URL) return send(res,503,{ok:false,error:'Supabase URL belum disambungkan.'});
   if(useSupabase&&!supabaseConfigured()) return send(res,503,{ok:false,error:'Supabase secret key belum disambungkan.'});
   if(!useSupabase&&!process.env.BLOB_READ_WRITE_TOKEN&&!process.env.BLOB_STORE_ID&&!process.env.VERCEL_OIDC_TOKEN) return send(res,503,{ok:false,error:'Storage belum disambungkan.'});
   return send(res,200,{ok:true,version,storage:useSupabase?'supabase-postgres':'private-vercel-blob'});
  }
  if(route==='/api/qr.svg'&&method==='GET'){
    const target=new URL(req.url,'https://example.test').searchParams.get('url')||req.query?.url||origin(req);
    if(target!==origin(req)){return send(res,400,{error:'QR URL tidak sepadan dengan website ini.'});}
    const qrcode=require('qrcode');const svg=await qrcode.toString(target,{type:'svg',margin:2,width:240,errorCorrectionLevel:'M',color:{dark:'#765E83',light:'#FFFFFF'}});
    res.statusCode=200;res.setHeader('Content-Type','image/svg+xml; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(svg);return;
  }
  if(!storageConfigured())return send(res,503,{error:'Storage belum disambungkan. Tetapkan Supabase atau Private Vercel Blob.'});
  const store=getAdapter();const token=String(req.headers['x-player-token']||'');
  if(route==='/api/state'&&method==='GET')return send(res,200,await query(store,g=>g.publicState()));
  if(route==='/api/me'&&method==='GET')return send(res,200,await query(store,g=>g.playerState(token)));
  if(route==='/api/join'&&method==='POST'){
    const b=await jsonBody(req);const result=await transaction(store,g=>{const p=g.register(b.nickname);return {token:p.token,player:g.playerState(p.token)};});return send(res,200,result);
  }
  if(route==='/api/drop'&&method==='POST'){
    const b=await jsonBody(req);const result=await transaction(store,g=>({...g.drop(token,b.elapsed,Date.now(),b.actionId,Number(b.tapAt)),player:g.playerState(token)}));return send(res,200,result);
  }
  if(route==='/api/answer'&&method==='POST'){
    const b=await jsonBody(req);const result=await transaction(store,g=>({...g.answer(token,b.choice,Date.now(),b.actionId),player:g.playerState(token)}));return send(res,200,result);
  }
  if(route==='/api/ping'&&method==='POST'){await transaction(store,g=>g.touch(token));return send(res,200,{ok:true});}
  if(route==='/api/host/auth'&&method==='GET'){requireHost(req);return send(res,200,{ok:true});}
  if(route==='/api/host/review'&&method==='GET'){requireHost(req);return send(res,200,await query(store,g=>g.review()));}
  if(route==='/api/host/export'&&method==='GET'){
   requireHost(req);
   const csv=await query(store,g=>exportCsv(g.exportRows()));
   res.statusCode=200;res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition','attachment; filename="care-tower-results.csv"');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end('\uFEFF'+csv);return;
  }
  if(route.startsWith('/api/host/')&&method==='POST'){
    requireHost(req);const action=route.substring('/api/host/'.length);
    if(!['start','pause','end','reset'].includes(action))return send(res,404,{error:'Action tidak wujud.'});
    const data=await transaction(store,g=>{g[action]();return g.publicState();});return send(res,200,data);
  }
  return send(res,404,{error:'Endpoint tidak wujud.'});
  }catch(e){
   console.error('[Care Tower API]',activeRoute,e?.name||'Error',e?.status??e?.statusCode??'',e?.message||e);
   const known=/(Penyertaan|Had peserta|Masukkan nama|Permainan sudah|Belum ada pemain|Hanya boleh|Tiada permainan|Statistik hanya|Eksport hanya|actionId tidak sah|Sekarang bukan masa|Soalan ini|Pilihan tidak sah|Permintaan terlalu besar|JSON tidak sah)/i;const status=e.status||e.statusCode||(/Sesi pemain tidak sah/.test(e.message)?401:known.test(e.message)?400:503);return send(res,status,{error:status>=500?'Storan atau sambungan server bermasalah. Cuba sebentar lagi.':e.message});}
};
