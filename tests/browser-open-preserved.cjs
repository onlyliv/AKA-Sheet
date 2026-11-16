const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const app=fs.readFileSync('public/app.js','utf8'),book=fs.readFileSync('public/book-open.js','utf8');
// Instantiate actual top-level function declarations as classic scripts do in a browser.
const nativeOpen=function(url){return {popup:true,url}},c={open:nativeOpen};vm.createContext(c);
for(const line of app.split('\n').filter(l=>/^(async )?function \w+\(/.test(l))){const name=line.match(/function (\w+)\(/)[1];if(name==='openBookFile')vm.runInContext(line,c)}
assert.equal(c.open,nativeOpen,'book opener must not replace browser popup API');assert.equal(typeof c.openBookFile,'function');assert.equal(c.open('https://accounts.google.com/').popup,true);
assert(!/(?:^|\n)(?:async )?function open\(/.test(app));assert(book.includes('await openBookFile(file)'));assert(!book.includes('await open(file)'));
console.log('browser-open-preserved: native popup function survives app declarations and book menu uses dedicated opener');
