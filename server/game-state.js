'use strict';
const {randomBytes}=require('node:crypto');
const questions=require('./private-questions.json');
const GAME_MS=240000,ANSWER_MS=18000,STACK_MS=4000,STACK_FEEDBACK_MS=620,QUIZ_FEEDBACK_MS=720,MAX_PLAYERS=60,WORLD_WIDTH=460, PRESENCE_MS=55000, MAX_TAP_COMPENSATION_MS=450;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function motionX(round,elapsed){const width=144-Math.floor(round/3)*3,lo=8,hi=WORLD_WIDTH-width-8,run=hi-lo;const dist=Math.max(0,elapsed)/1000*(160+round*17),p=dist%(2*run);return round%2===0?lo+(p<=run?p:2*run-p):hi-(p<=run?p:2*run-p);}
function gradeForOffset(offset){return offset<=8?['Perfect',30]:offset<=22?['Great',24]:offset<=40?['Good',15]:['Saved',5];}
class GameState {
 constructor(){this.players=new Map();this.session=1;this.status='waiting';this.startedAt=0;this.endsAt=0;this.pauseAt=0;this.lastChanged=0;this.revision=0;}
 clock(now=Date.now()){return this.status==='paused'?this.pauseAt:now;}
 stamp(now=Date.now()){this.lastChanged=now;this.revision++;}
 register(name,now=Date.now()){
  if(this.status!=='waiting')throw Error('Penyertaan ditutup setelah permainan bermula.');
  if(this.players.size>=MAX_PLAYERS)throw Error('Had peserta telah dicapai.');
  name=String(name||'').replace(/[<>\u0000-\u001f]/g,'').replace(/\s+/g,' ').trim().slice(0,18);
  if(name.length<2)throw Error('Masukkan nama panggilan 2–18 aksara.');
  const names=new Set([...this.players.values()].map(p=>p.name.toLowerCase()));const base=name;let n=2;
  while(names.has(name.toLowerCase()))name=base.slice(0,14)+' '+n++;
  const token=randomBytes(24).toString('hex');const p={id:randomBytes(8).toString('hex'),token,name,round:0,phase:'waiting',phaseStart:0,phaseEnd:0,score:0,quizScore:0,stackScore:0,correct:0,perfect:0,answerTimeTotal:0,topX:158,history:[],pendingStack:null,lastSeen:now,joinedAt:now,actions:new Map()};
  this.players.set(token,p);this.stamp(now);return p;
 }
 getPlayer(token){const p=this.players.get(String(token||''));if(!p)throw Error('Sesi pemain tidak sah.');return p;}
 touch(token,now=Date.now()){const p=this.getPlayer(token);p.lastSeen=now;return p;}
 start(now=Date.now()){if(this.status!=='waiting')throw Error('Permainan sudah bermula.');if(!this.players.size)throw Error('Belum ada pemain.');this.status='playing';this.startedAt=now;this.endsAt=now+GAME_MS;for(const p of this.players.values()){p.round=0;p.phase='stack';p.phaseStart=now;p.phaseEnd=now+STACK_MS;}this.stamp(now);}
 pause(now=Date.now()){if(this.status==='playing'){this.status='paused';this.pauseAt=now;this.stamp(now);return;}if(this.status!=='paused')throw Error('Hanya boleh pause semasa permainan.');const delta=now-this.pauseAt;this.startedAt+=delta;this.endsAt+=delta;for(const p of this.players.values()){p.phaseStart+=delta;p.phaseEnd+=delta;}this.status='playing';this.pauseAt=0;this.stamp(now);}
 end(now=Date.now()){if(!['playing','paused'].includes(this.status))throw Error('Tiada permainan sedang berlangsung.');this.tick(this.status==='paused'?this.pauseAt:now);this.status='finished';this.endsAt=now;for(const p of this.players.values()){p.phase='complete';p.phaseEnd=0;}this.stamp(now);}
 reset(now=Date.now()){this.session++;this.players.clear();this.status='waiting';this.startedAt=0;this.endsAt=0;this.pauseAt=0;this.stamp(now);}
 setPhase(p,phase,start,duration){p.phase=phase;p.phaseStart=start;p.phaseEnd=start+duration;}
 finishStack(p,at,grade='Missed',points=0,x=p.topX){p.pendingStack={grade,points,finalX:x,round:p.round};this.setPhase(p,'stack_feedback',at,grade==='Missed'?0:STACK_FEEDBACK_MS);}
 beginQuestion(p,at){this.setPhase(p,'question',at,ANSWER_MS);}
 endQuestion(p,at,choice=null){const q=questions[p.round];const ok=choice!==null&&choice===q.answer;const ms=choice===null?null:Math.max(0,at-p.phaseStart);if(ok){p.quizScore+=70;p.correct++;p.answerTimeTotal+=ms;}p.score=p.quizScore+p.stackScore;p.history.push({round:p.round,choice,correct:ok,grade:p.pendingStack?.grade||'Missed',points:p.pendingStack?.points||0,finalX:p.pendingStack?.finalX??p.topX,quizPoints:ok?70:0});this.setPhase(p,'quiz_feedback',at,QUIZ_FEEDBACK_MS);return {correct:ok,correctChoice:q.answer,explain:q.explain,points:ok?70:0};}
 advance(p,at){p.round++;p.pendingStack=null;if(p.round>=questions.length){p.phase='complete';p.phaseEnd=0;return;}this.setPhase(p,'stack',at,STACK_MS);}
 tick(now=Date.now()){
  if(this.status!=='playing')return;
  if(now>=this.endsAt){for(const p of this.players.values()){if(p.phase==='stack')this.finishStack(p,this.endsAt);if(p.phase==='question')this.endQuestion(p,this.endsAt);p.phase='complete';p.phaseEnd=0;}this.status='finished';this.stamp(now);return;}
  let changed=false;
  for(const p of this.players.values()){let guard=0;while(guard++<30&&p.phaseEnd&&now>=p.phaseEnd){const t=p.phaseEnd;if(p.phase==='stack'){this.finishStack(p,t);changed=true;}else if(p.phase==='stack_feedback'){this.beginQuestion(p,t);changed=true;}else if(p.phase==='question'){this.endQuestion(p,t);changed=true;}else if(p.phase==='quiz_feedback'){this.advance(p,t);changed=true;}else break;}}
  if(changed)this.stamp(now);
 }
 idempotent(p,kind,actionId,handler){if(typeof actionId!=='string'||!/^[-\w]{8,80}$/.test(actionId))throw Error('actionId tidak sah.');const key=kind+':'+actionId;if(p.actions.has(key))return p.actions.get(key);const value=handler();p.actions.set(key,value);if(p.actions.size>30)p.actions.delete(p.actions.keys().next().value);return value;}
 drop(token,_reportedElapsed,now=Date.now(),actionId,tapAt){const p=this.getPlayer(token);p.lastSeen=now;return this.idempotent(p,'drop',actionId,()=>{
  this.tick(now);if(this.status!=='playing'||p.phase!=='stack')throw Error('Sekarang bukan masa menjatuhkan blok.');
  // Use a recent client tap timestamp to keep the visual landing and server result aligned.
  // Old/future timestamps are still ignored; elapsed, x and grade from the browser remain untrusted.
  const validTap=Number.isFinite(tapAt)&&tapAt<=now&&now-tapAt<=MAX_TAP_COMPENSATION_MS&&tapAt>=p.phaseStart-120;const effectiveAt=validTap?tapAt:now;
  const elapsed=clamp(effectiveAt-p.phaseStart,0,STACK_MS);const x=motionX(p.round,elapsed),width=144-Math.floor(p.round/3)*3,previous=p.round===0?144:144-Math.floor((p.round-1)/3)*3;const target=p.topX+(previous-width)/2,offset=Math.abs(x-target);const [grade,points]=gradeForOffset(offset);const finalX=grade==='Perfect'?target:target+Math.sign(x-target)*Math.min(offset,85)*.43;
  p.topX=finalX;p.stackScore+=points;p.score=p.quizScore+p.stackScore;if(grade==='Perfect')p.perfect++;
  this.finishStack(p,now,grade,points,finalX);this.stamp(now);return {grade,points,score:p.score,x,finalX,offset,compensatedMs:now-effectiveAt};
 });}
 answer(token,choice,now=Date.now(),actionId){const p=this.getPlayer(token);p.lastSeen=now;return this.idempotent(p,'answer',actionId,()=>{this.tick(now);if(this.status!=='playing'||p.phase!=='question')throw Error('Soalan ini tidak lagi menerima jawapan.');if(!Number.isInteger(choice)||choice<0||choice>3)throw Error('Pilihan tidak sah.');const result=this.endQuestion(p,now,choice);this.stamp(now);return result;});}
 leaderboard(){return [...this.players.values()].sort((a,b)=>b.score-a.score||b.correct-a.correct||b.perfect-a.perfect||a.answerTimeTotal-b.answerTimeTotal||a.joinedAt-b.joinedAt).map((p,i)=>({rank:i+1,name:p.name,score:p.score,correct:p.correct,perfect:p.perfect,finished:p.phase==='complete'}));}
 publicState(now=Date.now()){this.tick(now);return {session:this.session,revision:this.revision,status:this.status,serverNow:now,startedAt:this.startedAt,endsAt:this.endsAt,pauseAt:this.pauseAt,remainingMs:this.startedAt?Math.max(0,this.endsAt-this.clock(now)):GAME_MS,players:this.players.size,connected:[...this.players.values()].filter(p=>now-p.lastSeen<PRESENCE_MS).length,completed:[...this.players.values()].filter(p=>p.round>=questions.length).length,leaderboard:this.leaderboard(),lobbyPlayers:[...this.players.values()].map(p=>({name:p.name,connected:now-p.lastSeen<PRESENCE_MS})),maxPlayers:MAX_PLAYERS};}
 playerState(token,now=Date.now()){this.tick(now);const p=this.touch(token,now),rank=this.leaderboard().find(r=>r.name===p.name)?.rank||0;return {session:this.session,revision:this.revision,status:this.status,serverNow:now,startedAt:this.startedAt,endsAt:this.endsAt,pauseAt:this.pauseAt,remainingMs:this.startedAt?Math.max(0,this.endsAt-this.clock(now)):GAME_MS,player:{name:p.name,round:p.round,phase:p.phase,phaseStart:p.phaseStart,phaseEnd:p.phaseEnd,score:p.score,quizScore:p.quizScore,stackScore:p.stackScore,correct:p.correct,perfect:p.perfect,topX:p.topX,history:p.history,rank,pendingStack:p.pendingStack},leaderboard:this.leaderboard().slice(0,5)};}
 review(now=Date.now()){if(this.status!=='finished')throw Error('Statistik hanya tersedia setelah permainan tamat.');const denom=this.players.size,participants=[...this.players.values()];return {players:denom,completed:participants.filter(p=>p.round>=10).length,averageAccuracy:denom?Math.round(participants.reduce((s,p)=>s+p.correct,0)/denom/10*1000)/10:0,questions:questions.map((q,i)=>{const choices=[0,0,0,0];let unanswered=0;for(const p of participants){const h=p.history.find(x=>x.round===i);if(h&&h.choice!==null)choices[h.choice]++;else unanswered++;}const answered=choices.reduce((a,b)=>a+b,0);return {round:i+1,theme:q.theme,question:q.question,choices:q.choices,answer:q.answer,explain:q.explain,counts:choices,answered,unanswered,correct:choices[q.answer]};})};}
}
GameState.prototype.toSnapshot=function(){return {
 session:this.session,revision:this.revision,status:this.status,startedAt:this.startedAt,endsAt:this.endsAt,pauseAt:this.pauseAt,lastChanged:this.lastChanged,
 players:[...this.players.values()].map(p=>({...p,actions:[...p.actions.entries()]}))
};};
GameState.fromSnapshot=function(s){const g=new GameState();if(!s)return g;
 for(const k of ['session','revision','status','startedAt','endsAt','pauseAt','lastChanged'])if(s[k]!==undefined)g[k]=s[k];
 g.players=new Map((s.players||[]).map(p=>{p.actions=new Map(p.actions||[]);return [p.token,p];}));return g;
};
GameState.prototype.exportRows=function(){
 if(this.status!=='finished')throw Error('Eksport hanya tersedia selepas permainan tamat.');
 const rows=[];
 for(const p of this.players.values()){
  let score=0;
  for(let i=0;i<questions.length;i++){
   const h=p.history.find(x=>x.round===i);
   const stackPoints=h?.points||0,quizPoints=h?.quizPoints||0;
   score+=stackPoints+quizPoints;
   rows.push({'Nama':p.name,'Round':i+1,'Soalan':questions[i].question,'Jawapan Dipilih':h&&Number.isInteger(h.choice)?'ABCD'[h.choice]:'','Betul':h?(h.correct?'Ya':'Tidak'):'','Grade Stacking':h?.grade||'','Mata Stacking':h?stackPoints:'','Mata Quiz':h?quizPoints:'','Skor Selepas Round':h?score:''});
  }
 }
 return rows;
};
module.exports={GameState,questions,GAME_MS,ANSWER_MS,STACK_MS,STACK_FEEDBACK_MS,QUIZ_FEEDBACK_MS,motionX,gradeForOffset};
