'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
test('optimistic stack animation begins before server awaits the action',()=>{
 const js=source('public/app.js'),drop=js.slice(js.indexOf('async function drop(){'),js.indexOf('el.drop.onclick=drop;'));
 assert.ok(drop.indexOf('graphics.land({grade,points,finalX})')<drop.indexOf("await sendAction('drop'"));
 assert.match(drop,/graphics\.confirmLanding\(response\)/);
 assert.match(drop,/tapAt/);
});
test('iPhone audio is opt-in and tests sound in a user gesture',()=>{
 const js=source('public/app.js');
 assert.match(js,/unmuted:false/);
 assert.match(js,/el\.sound\.onclick=async/);
 assert.match(js,/audioCtx\.resume\(\)/);
 assert.match(js,/createBufferSource\(\)/);
 assert.match(js,/new AC\(\)/);
 assert.match(js,/event==='drop'\?\.070:\.058/);
 assert.match(js,/audioCtx\.state!=='running'/);
 assert.match(js,/pageshow/);
 assert.match(source('public/index.html'),/id="soundLabel"/);
});
test('cloud leaderboard uses recent player snapshot and public results',()=>{
 const js=source('public/app.js');
 assert.match(js,/s\.leaderboard\?\.length\?s\.leaderboard:current\.public\?\.leaderboard/);
 assert.match(js,/s\.revision<current\.lastRevision/);
 assert.match(js,/syncPromise/);
});
test('finished-product bilingual UI uses consistent labels and vector icons',()=>{
 assert.match(source('public/icons.js'),/Identify the Problem/);
 assert.match(source('public/app.js'),/CareLabels\.theme/);
 assert.match(source('public/presenter.js'),/CareLabels\.theme/);
 assert.match(source('public/index.html'),/QUIZ MEETS ARCADE/);
 assert.match(source('public/index.html'),/DROP THE BLOCK/);
 assert.match(source('public/presenter.html'),/Live <em>Leaderboard<\/em>/);
 assert.doesNotMatch(source('public/index.html'),/Mula demo|Demo offline|Prototype/);
 assert.doesNotMatch(source('public/presenter.html'),/Mula demo|Demo offline|Prototype/);
});
test('presenter refresh uses a loading card before showing PIN or lobby state',()=>{
 const html=source('public/presenter.html'),js=source('public/presenter.js');
 assert.match(html,/id="bootCard"/);assert.match(html,/id="authCard" class="auth-card hidden"/);
 assert.match(js,/showBootCard\(\);await links\(\)/);assert.match(js,/els\.auth\.classList\.add\('hidden'\)/);
});
test('cloud bundle does not contain offline answer key',()=>{
 const out=path.resolve(__dirname,'../dist');
 if(fs.existsSync(out))assert.ok(!fs.existsSync(path.join(out,'demo-answers.js')));
 assert.equal(source('public/questions.js').includes('"answer":'),false);
});
