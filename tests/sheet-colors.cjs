const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');vm.runInThisContext(fs.readFileSync('dist/sheet-colors.js','utf8'));
const samples={red:[220,50,45],green:[40,170,65],blue:[45,75,210]};
for(const color of Object.keys(samples)){
 for(const [other,rgb]of Object.entries(samples))assert.equal(SheetColors.matches(...rgb,color,60),other===color);
 for(const rgb of [[0,0,0],[255,255,255],[120,120,120]])assert.equal(SheetColors.matches(...rgb,color,100),false);
 const rgb=samples[color];assert.equal(SheetColors.css('rgb('+rgb.join(', ')+')',color,60),true);
 const pixels={data:new Uint8ClampedArray([...rgb,255,30,30,30,255])};SheetColors.mask(pixels,60,color);assert.deepEqual([...pixels.data],[255,255,255,255,30,30,30,255]);
}
assert.equal(SheetColors.matches(130,110,110,'red',0),false);assert.equal(SheetColors.matches(130,110,110,'red',100),true);
console.log('색상별 픽셀·EPUB 색 판별, 다른 색·검정 보존, 감도 검사 통과');
