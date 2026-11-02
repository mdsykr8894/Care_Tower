'use strict';
const http=require('node:http');
const fs=require('node:fs');const path=require('node:path');const os=require('node:os');
const crypto=require('node:crypto');const {spawnSync}=require('node:child_process');
const {GameState}=require('./game-state');
const game=new GameState();
const PORT=Number(process.env.PORT||3000);
const HOST='0.0.0.0';const PIN=process.env.HOST_PIN||crypto.randomBytes(4).toString('hex');
const PUBLIC=path.resolve(__dirname,'../public');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json; charset=utf-8'};
const connections=new Set();
function localLinks(){const addresses=[];for(const entries of Object.values(os.networkInterfaces()))for(const i of entries||[])if(i.family==='IPv4'&&!i.internal)addresses.push(i.address);return addresses.sort((a,b)=>{const rank=x=>x.startsWith('192.168.')?0:x.startsWith('10.')?1:x.startsWith('172.')?2:3;return rank(a)-rank(b);}).map(a=>`http://${a}:${PORT}/`);}
function qrSvg(url){for(const python of process.platform==='win32'?['py','python','python3']:['python3','python']){const args=python==='py'?['-3',path.join(__dirname,'../tools/make_qr.py'),url]:[path.join(__dirname,'../tools/make_qr.py'),url];const r=spawnSync(python,args,{encoding:'utf8',timeout:4000,maxBuffer:1000000});if(r.status===0&&r.stdout.includes('<svg'))return r.stdout;}return null;}

function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));}
function fail(res,err){let code=400;if(/tidak sah|Sesi pemain/.test(err.message))code=401;json(res,code,{error:err.message});}
async function body(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>12000)throw new Error('Permintaan terlalu besar.');}try{return JSON.parse(raw||'{}')}catch{throw new Error('JSON tidak sah.')}}
function admin(req){const supplied=String(req.headers['x-host-pin']||'');const a=Buffer.from(supplied),b=Buffer.from(PIN);return a.length===b.length&&crypto.timingSafeEqual(a,b);}
function token(req){return req.headers['x-player-token'];}
function broadcast(){const data=`data: ${JSON.stringify(game.publicState())}\n\n`;for(const res of connections){try{res.write(data);}catch{connections.delete(res);}}}
function staticFile(req,res,pathname){let file=pathname==='/'?'/index.html':pathname;if(file==='/presenter'||file.startsWith('/presenter/'))file='/presenter.html';if(file==='/demo-answers.js'){json(res,404,{error:'Not found'});return;}const full=path.resolve(PUBLIC,`.${file}`);if(full!==PUBLIC&&!full.startsWith(PUBLIC+path.sep)){json(res,403,{error:'Forbidden'});return;}fs.stat(full,(err,stat)=>{if(err||!stat.isFile()){json(res,404,{error:'Not found'});return;}res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});fs.createReadStream(full).pipe(res);});}
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');const pathname=url.pathname;
 if(req.method==='GET'&&pathname==='/api/links')return json(res,200,{links:localLinks(),recommended:localLinks()[0]||`http://localhost:${PORT}/`});
 if(req.method==='GET'&&pathname==='/api/qr.svg'){
 const target=url.searchParams.get('url')||'';if(!localLinks().includes(target))return json(res,400,{error:'QR URL tidak sah'});
 const svg=qrSvg(target);if(!svg)return json(res,503,{error:'Python 3 tidak tersedia untuk QR'});
 res.writeHead(200,{'Content-Type':'image/svg+xml','Cache-Control':'no-store'});return res.end(svg);
 }
 if(req.method==='GET'&&pathname==='/api/config')return json(res,200,{cloud:false});
 if(req.method==='GET'&&pathname==='/api/health')return json(res,200,{ok:true,version:'1.3.0',status:game.status});
 if(req.method==='GET'&&pathname==='/api/state'){game.tick();return json(res,200,game.publicState());}
 if(req.method==='GET'&&pathname==='/api/me')return json(res,200,game.playerState(token(req)));
 if(req.method==='GET'&&pathname==='/api/events'){
 res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store','Connection':'keep-alive','X-Accel-Buffering':'no'});res.write(`retry: 1500\ndata: ${JSON.stringify(game.publicState())}\n\n`);connections.add(res);req.on('close',()=>connections.delete(res));return;}
 if(req.method==='POST'&&pathname==='/api/join'){const {nickname}=await body(req);const p=game.register(nickname);broadcast();return json(res,200,{token:p.token,player:game.playerState(p.token)});}
 if(req.method==='POST'&&pathname==='/api/answer'){const b=await body(req);const result=game.answer(token(req),b.choice,Date.now(),b.actionId);broadcast();return json(res,200,{...result,player:game.playerState(token(req))});}
 if(req.method==='POST'&&pathname==='/api/drop'){const b=await body(req);const result=game.drop(token(req),Number(b.elapsed),Date.now(),b.actionId,Number(b.tapAt));broadcast();return json(res,200,{...result,player:game.playerState(token(req))});}
 if(req.method==='POST'&&pathname==='/api/ping'){game.touch(token(req));return json(res,200,{ok:true});}
 if(req.method==='GET'&&pathname==='/api/host/auth'){if(!admin(req))return json(res,403,{error:'PIN presenter tidak sah.'});return json(res,200,{ok:true});}
 if(req.method==='GET'&&pathname==='/api/host/review'){if(!admin(req))return json(res,403,{error:'Presenter tidak dibenarkan.'});return json(res,200,game.review());}
 if(req.method==='POST'&&pathname.startsWith('/api/host/')){if(!admin(req))return json(res,403,{error:'PIN presenter tidak sah.'});let action=pathname.slice('/api/host/'.length);if(action==='start')game.start();else if(action==='pause')game.pause();else if(action==='reset')game.reset();else if(action==='end')game.end();else return json(res,404,{error:'Unknown action'});broadcast();return json(res,200,game.publicState());}
 if(req.method==='GET')return staticFile(req,res,pathname);
 json(res,405,{error:'Method not allowed'});
 }catch(err){fail(res,err);}});
const tick=setInterval(()=>{game.tick();broadcast();},1000);tick.unref?.();
if(require.main===module){server.listen(PORT,HOST,()=>{let urls=[];for(const entries of Object.values(os.networkInterfaces()))for(const i of entries||[])if(i.family==='IPv4'&&!i.internal)urls.push(`http://${i.address}:${PORT}`);console.log('\n CARE TOWER — Cozy classroom game\n');console.log(` Presenter PIN: ${PIN}`);console.log(` Presenter: http://localhost:${PORT}/presenter`);console.log(` Game local: http://localhost:${PORT}/`);for(const u of urls)console.log(` Player URL: ${u}/`);console.log(' Ujian sendiri: http://localhost:'+PORT+'/?demo=1\n');});}
module.exports={server,game};
