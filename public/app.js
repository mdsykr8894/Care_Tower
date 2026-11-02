(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const Q=window.CARE_QUESTIONS; const {TowerView,motionX,gradeOffset}=window.CareTowerGraphics;
const el={frame:$('.game-frame'),intro:$('#intro'),waiting:$('#waiting'),question:$('#questionScreen'),stack:$('#playBottom'),hud:$('#playHud'),result:$('#result'),time:$('#globalTime'),score:$('#scoreText'),level:$('#levelText'),combo:$('#comboIndicator'),name:$('#nickname'),start:$('#startBtn'),startLabel:$('#startLabel'),error:$('#introError'),mode:$('#introMode'),waitingName:$('#waitingName'),count:$('#playerCount'),number:$('#questionNumber'),theme:$('#questionTheme'),prompt:$('#questionPrompt'),choices:$('#answerOptions'),progress:$('#quizProgress'),questionTime:$('#questionTime'),stackTime:$('#stackTime'),drop:$('#dropBtn'),callout:$('#callout'),resultScore:$('#finalScore'),correct:$('#correctCount'),perfect:$('#perfectCount'),rank:$('#rankCount'),leaders:$('#miniLeaderboard'),review:$('#reviewPanel'),reviewButton:$('#reviewBtn'),finishNote:$('#finishNote'),sound:$('#soundToggle')};
const current={cloud:false,demo:location.protocol==='file:',token:null,session:null,clockSkew:0,game:null,public:null,lastKey:'',lastHistory:-1,lastRound:-1,dropping:false,answering:false,unmuted:false,finished:false,resultShown:false,calloutTimer:null,local:null,lastSync:0,connected:true,pending:null,demoReady:false,syncPromise:null,lastRevision:-1,connectionFailures:0};
const perf={requests:[],drops:[]};
function timing(type,entry){const list=perf[type];if(!list)return;list.push(entry);if(list.length>60)list.shift();if(new URLSearchParams(location.search).has('debug'))console.debug('[Care Tower]',type,entry);}
const show=(name)=>{el.intro.classList.toggle('hidden',name!=='intro');el.waiting.classList.toggle('hidden',name!=='waiting');el.question.classList.toggle('hidden',name!=='question');el.stack.classList.toggle('hidden',name!=='stack');el.result.classList.toggle('hidden',name!=='result');el.hud.classList.toggle('hidden',!['question','stack'].includes(name));};
const now=()=>current.game?.status==='paused'?current.game.pauseAt:Date.now()+current.clockSkew;
const graphics=new TowerView($('#towerCanvas'),el.frame,()=>drop());
const fmt=(ms)=>{const sec=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function emit(text,detail=''){el.callout.replaceChildren();el.callout.append(document.createTextNode(text));if(detail){const span=document.createElement('span');span.textContent=detail;el.callout.append(span);}el.callout.classList.remove('hidden');el.callout.style.animation='none';void el.callout.offsetWidth;el.callout.style.animation='';clearTimeout(current.calloutTimer);current.calloutTimer=setTimeout(()=>el.callout.classList.add('hidden'),850);}
let audioCtx=null,loop=null,loopIndex=0;
async function audio(){
 const AC=window.AudioContext||window.webkitAudioContext;
 if(!AC)return false;
 try{
  if(!audioCtx||audioCtx.state==='closed')audioCtx=new AC({latencyHint:'interactive'});
  if(audioCtx.state!=='running')await audioCtx.resume();
  return audioCtx.state==='running';
 }catch{return false;}
}
function tone(hz,t,dur,vol=.035,type='sine'){
 if(!current.unmuted||audioCtx?.state!=='running')return;
 const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=hz;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g).connect(audioCtx.destination);o.start(t);o.stop(t+dur+.02);
}
function sfx(event){
 if(!current.unmuted||audioCtx?.state!=='running')return;
 const t=audioCtx.currentTime+.01;
 const notes={click:[[440,.12]],right:[[523,.14],[659,.22]],wrong:[[329,.12],[293,.17]],drop:[[176,.12],[130,.1]],perfect:[[588,.2],[740,.26],[880,.28]],finish:[[392,.23],[523,.26],[659,.28],[784,.35]]}[event]||[];
 notes.forEach(([hz,d],i)=>tone(hz,t+i*.095,d,event==='drop'?.047:.04,i===0?'triangle':'sine'));
}
function music(){
 if(loop||!current.unmuted||audioCtx?.state!=='running')return;
 const notes=[261.63,329.63,392,329.63,293.66,349.23,440,349.23,261.63,329.63,392,493.88,293.66,349.23,440,392];
 const play=()=>{if(!current.unmuted||document.hidden||audioCtx?.state!=='running')return;
  const t=audioCtx.currentTime+.01;tone(notes[loopIndex%16],t,.4,.009);if(loopIndex%4===0)tone(notes[loopIndex%16]/2,t,.7,.006,'triangle');loopIndex++;};
 play();loop=setInterval(play,510);
}
function stopMusic(){clearInterval(loop);loop=null;}
function soundLabel(){const on=current.unmuted;el.sound.classList.toggle('active',on);el.sound.setAttribute('aria-label',on?'Mute sound':'Turn on sound & test audio');el.sound.title=on?'Sound on · tap to mute':'Sound off · tap to test';const tag=$('#soundLabel');if(tag)tag.textContent=on?'On':'Off';}
el.sound.onclick=async()=>{
 if(current.unmuted){current.unmuted=false;stopMusic();soundLabel();return;}
 current.unmuted=true;const ok=await audio();if(!ok){current.unmuted=false;soundLabel();emit('Sound unavailable','Cuba tap ikon sound sekali lagi');return;}
 soundLabel();sfx('perfect');music();
};
async function restoreSound(){if(!current.unmuted)return;const ok=await audio();if(ok)music();else{stopMusic();el.sound.title='Tap untuk hidupkan semula sound';}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMusic();else restoreSound();});
window.addEventListener('pageshow',()=>{if(current.unmuted)restoreSound();});
document.addEventListener('pointerdown',()=>{if(current.unmuted&&audioCtx?.state!=='running')restoreSound();},{passive:true});
const pausedOverlay=$('#pausedOverlay'),connectionNotice=$('#connectionNotice');
function connection(ok){current.connected=ok;connectionNotice?.classList.toggle('hidden',ok);}
function actionId(){return (crypto.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now().toString(36));}
async function request(route,options={}){
 const headers={'Content-Type':'application/json'};
 if(current.token)headers['x-player-token']=current.token;
 const started=performance.now();let r;
 try{r=await fetch('/api/'+route,{...options,headers:{...headers,...options.headers},cache:'no-store'});}
 catch{connection(false);throw Error('Connection lost. Sedang cuba sambung semula.');}
 let data;
 try{data=await r.json();}catch{connection(false);throw Error('Sambungan terganggu. Cuba lagi sebentar.');}
 if(!r.ok){if(r.status>=500||r.status===429)connection(false);throw Error(data.error||'Permintaan gagal ('+r.status+').');}
 connection(true);timing('requests',{route,ms:Math.round(performance.now()-started),status:r.status});return data;
}
async function sendAction(route,payload){
 const pending={route,payload:{...payload,actionId:actionId()}};
 current.pending=pending;localStorage.setItem('care-pending',JSON.stringify(pending));
 const out=await request(route,{method:'POST',body:JSON.stringify(pending.payload)});
 localStorage.removeItem('care-pending');current.pending=null;return out;
}
async function replayPending(){
 if(current.demo||!current.token)return;
 let action=current.pending;
 try{if(!action)action=JSON.parse(localStorage.getItem('care-pending')||'null');}
 catch{localStorage.removeItem('care-pending');}
 if(!action)return;
 try{await request(action.route,{method:'POST',body:JSON.stringify(action.payload)});current.pending=null;localStorage.removeItem('care-pending');}
 catch(err){if(!err.message.includes('Sambungan terputus')&&!err.message.includes('Respons server')&&!err.message.includes('Permintaan gagal')&&!err.message.includes('Ralat storan')){current.pending=null;localStorage.removeItem('care-pending');}}
}
function clockSync(snapshot,first,last){
 if(Number.isFinite(snapshot.serverNow)){
  const estimate=snapshot.serverNow-(first+last)/2;
  // Do not visibly jerk the moving block on a single high-latency sample.
  current.clockSkew=current.lastRevision<0?estimate:current.clockSkew*.7+estimate*.3;
 }
}
function acceptState(s){
 if(!s||!Number.isFinite(s.revision))return true;
 if(s.session===current.session&&s.revision<current.lastRevision)return false;
 current.lastRevision=Math.max(current.lastRevision,s.revision);return true;
}
function applyFresh(s){if(!acceptState(s))return;apply(s);}
async function sync(force=false){
 if(current.demo||!current.token)return;
 if(current.syncPromise)return current.syncPromise;
 if(!force&&Date.now()-current.lastSync<1100)return;
 current.lastSync=Date.now();
 current.syncPromise=(async()=>{
  const t=Date.now();
  try{
   await replayPending();const snapshot=await request('me');clockSync(snapshot,t,Date.now());applyFresh(snapshot);
  }catch(err){
   if(err.message.includes('Sesi pemain tidak sah')){
    current.token=null;localStorage.removeItem('care-player');localStorage.removeItem('care-pending');
    graphics.reset();current.game=null;current.lastKey='';current.lastRevision=-1;
    show('intro');el.error.textContent='Game baharu sudah tersedia. Masukkan nickname untuk join semula.';
   }else if(!current.connected){connection(false);}
  }
 })();
 try{return await current.syncPromise;}finally{current.syncPromise=null;}
}
function publicState(s){const old=current.public;if(old?.session===s.session&&Number.isFinite(s.revision)&&s.revision<old.revision)return;current.public=s;if(el.count)el.count.textContent=s.players||1;if(current.session!==null&&s.session!==current.session&&!current.demo){current.session=s.session;current.lastRevision=-1;localStorage.removeItem('care-player');localStorage.removeItem('care-pending');current.token=null;current.game=null;current.lastKey='';current.lastRevision=-1;current.finished=false;current.resultShown=false;graphics.reset();show('intro');el.error.textContent='Sesi baharu bermula! Masukkan nickname untuk join semula.';return;}if(current.token&&(old?.status!==s.status||(s.status==='finished'&&old?.revision!==s.revision)))sync(true);if(current.game?.player?.phase==='complete'&&s.status==='finished'&&current.game){result({...current.game,leaderboard:s.leaderboard});}}
function renderQuestion(round){const q=Q[round];if(!q)return;el.number.textContent=`${round+1}/10`;el.theme.textContent=window.CareLabels.theme(q.theme);el.prompt.textContent=q.question;el.progress.replaceChildren();for(let i=0;i<10;i++){const bar=document.createElement('span');if(i<round)bar.className='done';if(i===round)bar.className='current';el.progress.append(bar);}el.choices.replaceChildren();q.choices.forEach((label,i)=>{const b=document.createElement('button');b.className='answer-button';b.type='button';const badge=document.createElement('b');badge.textContent='ABCD'[i];const txt=document.createElement('span');txt.textContent=label;b.append(badge,txt);b.onclick=()=>answer(i,b);el.choices.append(b);});}
function rankings(items,name){el.leaders.replaceChildren();if(!items?.length){const p=document.createElement('div');p.className='leader-row';p.textContent='Leaderboard akan muncul sebaik pemain mendapat skor.';el.leaders.append(p);return;}for(const item of items.slice(0,5)){const row=document.createElement('div');row.className='leader-row'+(item.name===name?' me':'');const rank=document.createElement('span');rank.className='leader-rank';rank.textContent=`#${item.rank}`;const nick=document.createElement('span');nick.textContent=item.name;nick.style.flex='1';const points=document.createElement('span');points.className='leader-score';points.textContent=item.score.toLocaleString('ms-MY');row.append(rank,nick,points);el.leaders.append(row);}}
function result(s){const p=s.player;if(!current.resultShown){current.resultShown=true;graphics.setIdle();show('result');sfx('finish');}current.finished=s.status==='finished';el.resultScore.textContent=p.score;el.correct.textContent=p.correct;el.perfect.textContent=p.perfect;el.rank.textContent=(current.public?.leaderboard?.find(x=>x.name===p.name)?.rank)||p.rank||'—';el.finishNote.textContent=current.demo?'Solo Play · Nice run!':s.status==='finished'?'Final score · Thanks for playing!':'All done! Ranking akhir akan dikemas kini apabila masa tamat.';rankings(current.demo?[{rank:1,name:p.name,score:p.score}]:(s.leaderboard?.length?s.leaderboard:current.public?.leaderboard)||[],p.name);el.review.replaceChildren();p.history.forEach(h=>{const q=Q[h.round],wrap=document.createElement('div');wrap.className='review-item';const title=document.createElement('strong');let right=current.demo?window.CARE_DEMO_ANSWERS[h.round]:null;title.textContent=`#${h.round+1} · ${h.correct?'✓ Correct':'Keep Learning'}`;const copy=document.createElement('div');copy.textContent=right?.explain||'Semak jawapan bersama presenter selepas game tamat.';wrap.append(title,copy);el.review.append(wrap);});}
el.reviewButton.onclick=()=>{const hidden=el.review.classList.toggle('hidden');el.reviewButton.textContent=hidden?'Round Recap ↓':'Close Recap ↑';};
function apply(s){const p=s.player;current.game=s;if(current.session===null)current.session=s.session;if(!current.demo&&s.session!==current.session)return;el.score.textContent=p.score;el.level.textContent=Math.min(p.round+1,10)+' / 10';pausedOverlay.classList.toggle('hidden',s.status!=='paused');graphics.paused=s.status==='paused';
 if(s.status==='waiting'){el.waitingName.textContent=p.name;show('waiting');graphics.setIdle();return;}
 if(s.status==='finished'||p.phase==='complete'){result(s);return;}
 const key=`${p.round}:${p.phase}:${p.phaseStart}`;
 if(p.phase==='stack'){
  if(current.lastKey!==key){graphics.rebuild(p.history);graphics.begin(p.round,p.topX,p.phaseStart,now);el.combo.textContent='✦ Time your drop!';current.dropping=false;el.drop.disabled=false;show('stack');current.lastKey=key;}
 }else if(p.phase==='stack_feedback'){
  if(current.lastKey!==key){if(!current.dropping||graphics.phase!=='falling'){graphics.rebuild([...p.history,{round:p.round,finalX:p.pendingStack?.finalX??p.topX}]);graphics.setIdle();}show('stack');el.drop.disabled=true;current.lastKey=key;}
 }else if(p.phase==='question'){
  if(current.lastKey!==key){current.dropping=false;current.answering=false;graphics.rebuild(p.history);graphics.setIdle();renderQuestion(p.round);show('question');current.lastKey=key;}
 }else if(p.phase==='quiz_feedback'){
  if(current.lastKey!==key){graphics.rebuild(p.history);graphics.setIdle();show('question');$$('.answer-button').forEach(x=>x.disabled=true);current.lastKey=key;}
 }
 if(s.status==='paused')el.drop.disabled=true;
}
async function answer(index,button){const s=current.game;if(!s||s.status==='paused'||s.player.phase!=='question'||current.answering)return;current.answering=true;button.classList.add('chosen');$$('.answer-button').forEach(x=>x.disabled=true);sfx('click');try{let response;if(current.demo)response=demoAnswer(index);else response=await sendAction('answer',{choice:index});sfx(response.correct?'right':'wrong');emit(response.correct?'Correct!':'Good try!',response.correct?'+70 points':'0 quiz points');applyFresh(current.demo?localSnapshot():response.player);}catch(err){current.answering=false;emit('Reconnect needed','Sedang periksa sambungan');sync(true);}}
async function drop(){
 const s=current.game;
 if(!s||s.status==='paused'||s.player.phase!=='stack'||current.dropping)return;
 const tickStart=performance.now(),tapAt=now();const elapsed=graphics.freeze();if(elapsed===null)return;
 current.dropping=true;el.drop.disabled=true;sfx('click');
 const round=s.player.round,width=144-Math.floor(round/3)*3,prev=round===0?144:144-Math.floor((round-1)/3)*3;
 const target=s.player.topX+(prev-width)/2,x=motionX(round,elapsed),offset=Math.abs(x-target);
 const [grade,points]=gradeOffset(offset);
 const finalX=grade==='Perfect'?target:target+Math.sign(x-target)*Math.min(offset,85)*.43;
 graphics.land({grade,points,finalX});const visualMs=Math.round(performance.now()-tickStart);sfx('drop'); // start visual fall before network response
 try{
  const response=current.demo?demoDrop(elapsed):await sendAction('drop',{elapsed,tapAt});
  graphics.confirmLanding(response);timing('drops',{visualMs,confirmationMs:Math.round(performance.now()-tickStart),compensatedMs:response.compensatedMs||0});
  emit(response.grade==='Perfect'?'Perfect!':response.grade==='Great'?'Great!':response.grade==='Good'?'Good!':'Nice save!',`+${response.points} points`);
  if(response.grade==='Perfect')setTimeout(()=>sfx('perfect'),100);
  applyFresh(current.demo?localSnapshot():response.player);
 }catch(err){
  emit('Connection check','Sedang pulihkan game');sync(true);
 }
}
el.drop.onclick=drop;window.addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='Enter')&&current.game?.status!=='paused'&&current.game?.player.phase==='stack'&&!e.repeat){e.preventDefault();drop();}});
// Offline demo: keys loaded from a separate file ONLY with file://; HTTP server blocks demo-answers.js.
function demoBegin(name){const t=Date.now();current.local={session:1,status:'playing',startedAt:t,endsAt:t+240000,p:{name,round:0,phase:'stack',phaseStart:t,phaseEnd:t+4000,score:0,quizScore:0,stackScore:0,correct:0,perfect:0,rank:1,topX:158,history:[],pendingStack:null}};current.lastKey='';current.lastRevision=-1;current.finished=false;current.resultShown=false;graphics.reset();applyFresh(localSnapshot());}
function localSnapshot(){const g=current.local;return {session:1,status:g.status,serverNow:Date.now(),startedAt:g.startedAt,endsAt:g.endsAt,remainingMs:Math.max(0,g.endsAt-Date.now()),player:structuredClone(g.p),leaderboard:[{rank:1,name:g.p.name,score:g.p.score}]};}
function demoDrop(elapsed){const p=current.local.p,r=p.round,width=144-Math.floor(r/3)*3,prev=r===0?144:144-Math.floor((r-1)/3)*3,target=p.topX+(prev-width)/2,x=motionX(r,elapsed),offset=Math.abs(x-target),[grade,points]=gradeOffset(offset),finalX=grade==='Perfect'?target:target+Math.sign(x-target)*Math.min(offset,85)*.43;p.stackScore+=points;p.score=p.quizScore+p.stackScore;p.perfect+=grade==='Perfect'?1:0;p.topX=finalX;p.pendingStack={grade,points,finalX};p.phase='stack_feedback';p.phaseStart=Date.now();p.phaseEnd=p.phaseStart+620;return {grade,points,finalX};}
function demoAnswer(choice){const p=current.local.p,r=p.round,qa=window.CARE_DEMO_ANSWERS[r],correct=choice===qa.answer;p.quizScore+=correct?70:0;p.correct+=correct?1:0;p.score=p.quizScore+p.stackScore;p.history.push({round:r,choice,correct,grade:p.pendingStack?.grade||'Missed',points:p.pendingStack?.points||0,finalX:p.pendingStack?.finalX??p.topX});p.phase='quiz_feedback';p.phaseStart=Date.now();p.phaseEnd=p.phaseStart+720;return {correct};}
function demoTick(){if(!current.local||current.finished)return;const g=current.local,p=g.p,t=Date.now();if(t>=g.endsAt){g.status='finished';p.phase='complete';applyFresh(localSnapshot());return;}let moved=false,guard=0;while(guard++<25&&t>=p.phaseEnd&&p.phase!=='complete'){
 const at=p.phaseEnd;if(p.phase==='stack'){p.pendingStack={grade:'Missed',points:0,finalX:p.topX};p.phase='stack_feedback';p.phaseStart=at;p.phaseEnd=at;moved=true;}
 else if(p.phase==='stack_feedback'){p.phase='question';p.phaseStart=at;p.phaseEnd=at+18000;moved=true;}
 else if(p.phase==='question'){const r=p.round;p.history.push({round:r,choice:null,correct:false,grade:p.pendingStack?.grade||'Missed',points:p.pendingStack?.points||0,finalX:p.topX});p.phase='quiz_feedback';p.phaseStart=at;p.phaseEnd=at+720;moved=true;}
 else if(p.phase==='quiz_feedback'){p.round++;p.pendingStack=null;if(p.round>=10){p.phase='complete';}else{p.phase='stack';p.phaseStart=at;p.phaseEnd=at+4000;}moved=true;}
 else break;
 }if(moved)applyFresh(localSnapshot());}
async function join(){const name=el.name.value.trim();if(name.length<2){el.error.textContent='Nickname perlu ada sekurang-kurangnya 2 aksara.';return;}el.error.textContent='';el.start.disabled=true;sfx('click');try{if(current.demo){demoBegin(name);return;}const startAt=Date.now();const r=await request('join',{method:'POST',body:JSON.stringify({nickname:name})});clockSync(r.player,startAt,Date.now());current.token=r.token;localStorage.setItem('care-player',r.token);current.session=r.player.session;applyFresh(r.player);}catch(err){el.error.textContent=err.message;}finally{el.start.disabled=false;}}
el.start.onclick=join;el.name.addEventListener('keydown',e=>{if(e.key==='Enter')join();});
async function init(){if(current.demo){el.mode.textContent='Solo Play · Main ikut rentak sendiri';el.startLabel.textContent='Play Solo';el.start.disabled=true;const s=document.createElement('script');s.src='demo-answers.js';s.onload=()=>{current.demoReady=true;el.start.disabled=false;};s.onerror=()=>{el.error.textContent='Solo Play tidak dapat dimulakan. Cuba buka semula game.';};document.head.append(s);return;}
 el.mode.textContent='One game · One leaderboard · No account needed';current.token=localStorage.getItem('care-player');try{const response=await request('state');current.public=response;current.session=response.session;if(current.token){try{await replayPending();const me=await request('me');applyFresh(me);}catch(e){if(e.message.includes('Sesi pemain tidak sah')){localStorage.removeItem('care-player');current.token=null;}}}
 try{const cfg=await request('config');current.cloud=!!cfg.cloud;}catch{}
 if(!current.cloud){const events=new EventSource('/api/events');events.onmessage=e=>{connection(true);try{publicState(JSON.parse(e.data));}catch{}};events.onerror=()=>connection(false);}
 else{setInterval(()=>{if(!document.hidden)sync();},2400);}

 }catch{el.mode.textContent='Connection unavailable · Cuba lagi sebentar';el.start.disabled=true;el.error.textContent='Game belum dapat dihubungi. Cuba refresh atau hubungi presenter.';}}
function refresh(){if(current.demo)demoTick();const s=current.game;if(!s)return;const t=now(),rem=s.status==='waiting'?240000:s.status==='paused'?s.remainingMs:Math.max(0,s.endsAt-t);el.time.textContent=fmt(rem);el.time.classList.toggle('danger',rem<30000);if(s.player.phase==='question')el.questionTime.textContent=Math.max(0,Math.ceil((s.player.phaseEnd-t)/1000));if(s.player.phase==='stack')el.stackTime.textContent=(Math.max(0,(s.player.phaseEnd-t)/1000)).toFixed(1)+'s';if(!current.demo&&s.status==='playing'&&s.player.phaseEnd&&t>s.player.phaseEnd+150&&Date.now()-current.lastSync>1500)sync();}
setInterval(refresh,100);setInterval(async()=>{if(!current.demo&&current.token&&!document.hidden){try{await request('ping',{method:'POST',body:'{}'});}catch{connection(false);}sync();}},25000);
window.addEventListener('online',()=>sync(true));document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync(true);});init();
window.__careTower={getState:()=>current.game,graphics,drop,answer,localSnapshot,metrics:perf};
})();
