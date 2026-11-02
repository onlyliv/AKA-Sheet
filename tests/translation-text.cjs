const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');vm.runInThisContext(fs.readFileSync('dist/translation-text.js','utf8'));
assert.equal(TranslationText.normalize('部 首 名\nを 答え る 必要 は あり ませ ん。'),'部首名を答える必要はありません。');
assert.equal(TranslationText.normalize('ABC\nDEF'),'ABC DEF');
const long='漢字の学習を続けます。'.repeat(180)+'最後の一文です。';const parts=TranslationText.chunks(long);assert(parts.length>1);assert(parts.every(s=>Array.from(s).length<=140));assert.equal(parts.join(''),TranslationText.normalize(long));assert(parts.at(-1).includes('最後'));
const rare='𠮷'.repeat(400);assert.equal(TranslationText.chunks(rare).join(''),rare);
assert.equal(TranslationText.hitsLimit(Array(512).fill(3),2,512),true);assert.equal(TranslationText.hitsLimit([...Array(511).fill(3),2],2,512),false);
console.log('OCR 공백·줄바꿈, 장문 끝까지 보존, 유니코드 분할, 출력 한도 검사 통과');
