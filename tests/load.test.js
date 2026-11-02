'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {GameState,questions}=require('../server/game-state');
test('40 simulated individual players can each score and appear on live leaderboard',()=>{
 const g=new GameState();const all=Array.from({length:40},(_,i)=>g.register('Tester '+(i+1),10000+i));g.start(20000);
 for(let i=0;i<40;i++){const p=all[i],at=20300+i*12;g.drop(p.token,9876,at,'load-drop-'+i.toString().padStart(6,'0'));g.tick(p.phaseEnd);g.answer(p.token,i%2===0?questions[0].answer:(questions[0].answer+1)%4,p.phaseStart+100,'load-answer-'+i.toString().padStart(6,'0'));}
 const board=g.leaderboard();assert.equal(board.length,40);assert.equal(new Set(board.map(x=>x.name)).size,40);assert.equal(g.publicState(33000).players,40);assert.equal(board.filter(x=>x.correct===1).length,20);assert.ok(board[0].score>=board[39].score);
});
