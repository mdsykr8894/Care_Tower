'use strict';
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),src=path.join(ROOT,'public'),out=path.join(ROOT,'dist');
fs.rmSync(out,{recursive:true,force:true});
fs.cpSync(src,out,{recursive:true,filter:p=>path.basename(p)!=='demo-answers.js'});
// Keep private quiz answers only under server/private-questions.json inside Functions.
if(fs.existsSync(path.join(out,'demo-answers.js')))throw Error('Private demo answer key accidentally published.');
console.log('Vercel public build ready; offline answer keys excluded.');
