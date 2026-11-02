'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs');
const {GameState,questions,motionX,gradeForOffset,STACK_MS,ANSWER_MS,GAME_MS}=require('../server/game-state');
const {exportCsv}=require('../server/export-data');
const randomId=i=>'action-'+String(i).padStart(6,'0');
function bestDrop(round,topX){const w=144-Math.floor(round/3)*3,prev=round===0?144:144-Math.floor((round-1)/3)*3,target=topX+(prev-w)/2;let elapsed=1,best=Infinity;for(let t=1;t<STACK_MS;t++){const d=Math.abs(motionX(round,t)-target);if(d<best){best=d;elapsed=t;}}return {elapsed,best};}
test('ten question keys are preserved in server and withheld from public file',()=>{
 assert.equal(questions.length,10);assert.deepEqual(questions.map(x=>x.answer),[0,1,1,3,0,2,0,1,2,3]);const publicFile=fs.readFileSync(require('node:path').join(__dirname,'../public/questions.js'),'utf8');assert.doesNotMatch(publicFile,/\"answer\"\s*:/);assert.doesNotMatch(publicFile,/\"explain\"\s*:/);
});
test('single global lobby supports 40 independent players with duplicate nickname handling',()=>{const g=new GameState(),tokens=[];for(let i=0;i<40;i++)tokens.push(g.register(i<2?'Same':'Student '+i,100));assert.equal(new Set(tokens.map(x=>x.token)).size,40);assert.equal(g.players.size,40);assert.equal(tokens[1].name,'Same 2');g.start(1000);assert.equal(g.getPlayer(tokens[0].token).phase,'stack');assert.equal(g.publicState(1001).players,40);assert.throws(()=>g.register('Late'),/Penyertaan ditutup/);});
test('Stack → Quiz flow for 10 rounds yields max 1000 (300 stack / 700 quiz)',()=>{const g=new GameState(),token=g.register('Care Champion').token;let t=100000;g.start(t);for(let round=0;round<10;round++){
 const p=g.getPlayer(token);assert.equal(p.phase,'stack',`stack round ${round}`);const {elapsed,best}=bestDrop(round,p.topX);assert.ok(best<=8,`offset ${best}`);const r=g.drop(token,0,p.phaseStart+elapsed,randomId(2*round));assert.equal(r.grade,'Perfect');assert.equal(p.stackScore,(round+1)*30);
 g.tick(p.phaseEnd);assert.equal(p.phase,'question');const q=g.answer(token,questions[round].answer,p.phaseStart+200,randomId(2*round+1));assert.equal(q.correct,true);assert.equal(p.quizScore,(round+1)*70);g.tick(p.phaseEnd);t=p.phaseStart;
 }const p=g.getPlayer(token);assert.equal(p.phase,'complete');assert.equal(p.score,1000);assert.equal(p.correct,10);assert.equal(p.perfect,10);});
test('grade points and quiz points are independent',()=>{assert.deepEqual(gradeForOffset(0),['Perfect',30]);assert.deepEqual(gradeForOffset(20),['Great',24]);assert.deepEqual(gradeForOffset(30),['Good',15]);assert.deepEqual(gradeForOffset(400),['Saved',5]);const g=new GameState(),p=g.register('New Learner');g.start(1000);g.drop(p.token,4000,1350,randomId(1));assert.equal(p.quizScore,0);assert.ok(p.stackScore>=5);g.tick(p.phaseEnd);const r=g.answer(p.token,3,p.phaseStart+200,randomId(2));assert.equal(r.correct,false);assert.equal(p.quizScore,0);});
test('action idempotency prevents a duplicate or delayed HTTP retry from scoring twice',()=>{const g=new GameState(),p=g.register('Retry Me');g.start(20000);const first=g.drop(p.token,3900,21000,randomId(1)),score=p.score;const second=g.drop(p.token,3900,29000,randomId(1));assert.deepEqual(second,first);assert.equal(p.score,score);g.tick(p.phaseEnd);const choice=questions[0].answer;const a=g.answer(p.token,choice,p.phaseStart+200,randomId(2));const b=g.answer(p.token,choice,p.phaseStart+9000,randomId(2));assert.deepEqual(a,b);assert.equal(p.quizScore,70);assert.throws(()=>g.answer(p.token,choice,p.phaseStart+200,randomId(3)),/tidak lagi/);});
test('server-authoritative stacking ignores manipulated elapsed',()=>{const a=new GameState(),b=new GameState(),x=a.register('One'),y=b.register('Two');a.start(1000);b.start(1000);const ra=a.drop(x.token,0,1700,randomId(1)),rb=b.drop(y.token,3999,1700,randomId(1));assert.equal(ra.grade,rb.grade);assert.equal(ra.points,rb.points);assert.equal(ra.x,rb.x);});
test('pause freezes the quiz and moving block deadlines and preserves timer',()=>{const g=new GameState(),p=g.register('Pause Test');g.start(1000);g.pause(1800);const frozen=g.playerState(p.token,30000);assert.equal(frozen.status,'paused');assert.equal(g.getPlayer(p.token).phase,'stack');assert.equal(frozen.remainingMs,GAME_MS-800);g.pause(11800);assert.equal(g.getPlayer(p.token).phaseEnd,15000);assert.equal(g.endsAt,251000);g.tick(14000);assert.equal(p.phase,'stack');g.tick(15000);assert.equal(p.phase,'question');});
test('timeout moves from stack to question then progresses to next stack',()=>{const g=new GameState(),p=g.register('Slow');g.start(1000);g.tick(5001);assert.equal(p.phase,'question');assert.equal(p.pendingStack.grade,'Missed');g.tick(23010);assert.equal(p.phase,'quiz_feedback');g.tick(25000);assert.equal(p.round,1);assert.equal(p.phase,'stack');assert.equal(p.score,0);});
test('review statistics count unanswered separately and cannot be accessed early',()=>{const g=new GameState(),a=g.register('Alpha'),b=g.register('Beta');g.start(1000);assert.throws(()=>g.review(),/hanya tersedia/);g.drop(a.token,100,1300,randomId(1));g.tick(a.phaseEnd);g.answer(a.token,questions[0].answer,a.phaseStart+100,randomId(2));g.end(4500);const stats=g.review();assert.equal(stats.players,2);assert.equal(stats.questions[0].answered,1);assert.equal(stats.questions[0].unanswered,1);assert.equal(stats.questions[0].correct,1);});
test('finished game exports participant answers without session tokens',()=>{const g=new GameState(),p=g.register('Export Me');g.start(1000);g.drop(p.token,100,1300,randomId(1));g.tick(p.phaseEnd);g.answer(p.token,questions[0].answer,p.phaseStart+100,randomId(2));g.end(4500);const rows=g.exportRows(),csv=exportCsv(rows);assert.equal(rows.length,10);assert.equal(rows[0]['Nama'],'Export Me');assert.equal(rows[0]['Jawapan Dipilih'],'ABCD'[questions[0].answer]);assert.equal(rows[0]['Betul'],'Ya');assert.match(csv,/"Nama".*"Jawapan Dipilih"/);assert.doesNotMatch(csv,new RegExp(p.token));});
test('resume token persists until session reset; stale tokens are rejected',()=>{const g=new GameState(),p=g.register('Returner');g.start(1000);g.drop(p.token,111,1500,randomId(1));assert.equal(g.playerState(p.token,1600).player.stackScore,p.stackScore);g.reset(2000);assert.throws(()=>g.playerState(p.token),/Sesi pemain tidak sah/);assert.equal(g.status,'waiting');});
test('presence expires after 55 seconds while player rank and score persist',()=>{const g=new GameState(),p=g.register('Offline',1000);assert.equal(g.publicState(2000).connected,1);assert.equal(g.publicState(57001).connected,0);assert.equal(g.players.size,1);g.touch(p.token,34000);assert.equal(g.publicState(35000).connected,1);});
test('server compensates for at most 450ms of plausible latency and rejects impossible timestamps',()=>{
 const mk=()=>{const g=new GameState(),p=g.register('Latency tester',1000);g.start(1000);return {g,p};};
 const a=mk(),b=mk(),c=mk();
 const received=2000;
 const uncorrected=a.g.drop(a.p.token,0,received,'drop-latency-0001');
 const compensated=b.g.drop(b.p.token,0,received,'drop-latency-0001',received-80);
 const forged=c.g.drop(c.p.token,0,received,'drop-latency-0001',received-1000);
 assert.equal(compensated.compensatedMs,80);
 assert.equal(forged.compensatedMs,0);
 assert.equal(forged.x,uncorrected.x);
});
test('recent tap timestamp prevents a delayed response from shifting a centered landing',()=>{
 const g=new GameState(),p=g.register('Network tester',1000);g.start(1000);
 const result=g.drop(p.token,0,1350,'drop-network-0001',1000);
 assert.equal(result.compensatedMs,350);
 assert.equal(result.finalX,p.topX);
});
test('revision is monotonic across scoring, reset and serialized snapshot',()=>{
 const g=new GameState(),a=g.register('Revision tester',1000);const before=g.revision;
 g.start(2000);assert.ok(g.revision>before);
 g.drop(a.token,0,2500,'drop-revision-0001');
 const roundtrip=GameState.fromSnapshot(g.toSnapshot());
 assert.equal(roundtrip.revision,g.revision);
 g.reset(3000);assert.ok(g.revision>roundtrip.revision);
});
