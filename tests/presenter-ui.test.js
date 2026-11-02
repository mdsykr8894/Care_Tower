'use strict';
const test=require('node:test'), assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
class Elem {
 constructor(){this.children=[];this.dataset={};this.classList={add(){},remove(){},toggle(){}};this.textContent='';this.style={};}
 append(...e){this.children.push(...e);}
 replaceChildren(...e){this.children=[...e];}
}
const code=fs.readFileSync(path.join(__dirname,'../public/presenter.js'),'utf8');
function runRender(){const d=new Map();const doc={querySelector(q){if(!d.has(q))d.set(q,new Elem());return d.get(q);},createElement(){return new Elem();}};
 const ctx={document:doc,window:{},setInterval(){},sessionStorage:{getItem(){return null}},Date,URL,console,fetch:async()=>({json:async()=>({})})};
 const injected=code.replace(/\}\)\(\);\s*$/,'globalThis.UI_TEST={drawRank,drawLobby,podium};})();');
 vm.runInNewContext(injected,ctx);return {ui:ctx.UI_TEST,doc};
}
test('presenter rank rendering produces rows and never references undefined pos',()=>{
 const {ui,doc}=runRender();const container=doc.querySelector('#liveRanks');
 ui.drawRank([{rank:1,name:'Aisyah',score:900},{rank:2,name:'Faz',score:700}],container,7);
 assert.equal(container.children.length,2);
 assert.equal(container.children[0].children[1].textContent,'Aisyah');
 assert.equal(container.children[0].children[2].textContent,'900');
});
test('lobby names appear and missing podium positions are not drawn',()=>{
 const {ui,doc}=runRender();ui.drawLobby([{name:'Aina',connected:true},{name:'Syakir',connected:false}]);
 assert.equal(doc.querySelector('#lobbyNames').children.length,2);
 assert.match(doc.querySelector('#lobbyNames').children[0].textContent,/Aina/);
 ui.podium([{name:'Aina',score:300}]);assert.equal(doc.querySelector('#podium').children.length,1);
});
test('production static bundle excludes offline demo answer file',()=>{
 const exec=require('node:child_process').execFileSync;exec('node',['scripts/build-vercel.js'],{cwd:path.join(__dirname,'..')});
 const root=path.join(__dirname,'../dist');assert.equal(fs.existsSync(path.join(root,'demo-answers.js')),false);
 assert.equal(fs.existsSync(path.join(root,'questions.js')),true);
});
