/* Settings contain preferences only; books, source text and model consent stay separate. */
(function(root){
 const KEY='akai.settings.v1',colors=['red','green','blue'];
 const binding=(code)=>({code,ctrl:false,alt:false,shift:false,meta:false});
 const defaultKeys={toggle:binding('Space'),quick:binding('KeyT'),highlight:binding('KeyH'),selection:binding('KeyS')};
 function legacy(k){try{return localStorage.getItem(k)}catch{return null}}
 function bounded(v,fallback,min,max){const n=Number(v);return v==null||!Number.isFinite(n)?fallback:Math.max(min,Math.min(max,n))}
 function keyId(k){return k?[k.ctrl?'C':'',k.alt?'A':'',k.shift?'S':'',k.meta?'M':'',k.code].join(':'):''}
 function validateKey(k){if(!k)return '';if(!/^(Key[A-Z]|Digit[0-9]|Space|F[2-9])$/.test(k.code))return '문자·숫자·Space 또는 F2~F9 키를 사용하세요.';
  if(['F5','F6'].includes(k.code)||k.code==='Space'&&(k.alt||k.ctrl||k.meta))return '브라우저나 운영체제에서 사용하는 키입니다.';
  if((k.ctrl||k.meta)&&/^(Key[ACDFLNOPQRSTVWXYZ]|Digit[0-9])$/.test(k.code))return '복사·검색·탭 이동 등 기본 단축키는 사용할 수 없습니다.';
  if(k.alt&&['F4','KeyF','KeyD'].includes(k.code))return '브라우저나 운영체제에서 사용하는 키입니다.';return '';
 }
 function normalizeKey(k,fallback){if(k===null)return null;if(!k||typeof k.code!=='string')return fallback;const result={code:k.code,ctrl:!!k.ctrl,alt:!!k.alt,shift:!!k.shift,meta:!!k.meta};return validateKey(result)?fallback:result}
 function base(){let savedColors;try{savedColors=JSON.parse(legacy('sheetColors'))}catch{}const color=colors.includes(legacy('sheetColor'))?legacy('sheetColor'):'red';return {highlightPageSize:15,menus:{sheet:true,selection:true,translation:true},width:20,height:20,sheet:{color,colors:Array.isArray(savedColors)?colors.filter(c=>savedColors.includes(c)):[color],mode:legacy('sheetMode')==='all'?'all':'highlight',reveal:false,sensitivity:Object.fromEntries(colors.map(c=>[c,bounded(legacy('sensitivity:'+c)??legacy('sensitivity'),60,0,100)]))},translation:null,shortcuts:structuredClone(defaultKeys)}}
 function normalize(value){const b=base(),v=value&&typeof value==='object'?value:{};b.highlightPageSize=Math.round(bounded(v.highlightPageSize,15,5,100));const sheet=v.sheet||{},menus=v.menus||{};for(const k of ['sheet','selection','translation'])if(typeof menus[k]==='boolean')b.menus[k]=menus[k];b.width=bounded(v.width,20,15,45);b.height=bounded(v.height,20,15,55);if(colors.includes(sheet.color))b.sheet.color=sheet.color;if(Array.isArray(sheet.colors))b.sheet.colors=colors.filter(c=>sheet.colors.includes(c));else if(colors.includes(sheet.color))b.sheet.colors=[b.sheet.color];b.sheet.color=b.sheet.colors[0]||b.sheet.color;if(['all','highlight'].includes(sheet.mode))b.sheet.mode=sheet.mode;else if(Object.keys(sheet).length)b.sheet.mode=legacy('sheetMode')==='highlight'?'highlight':'all';if(typeof sheet.reveal==='boolean')b.sheet.reveal=sheet.reveal;for(const c of colors)b.sheet.sensitivity[c]=bounded(sheet.sensitivity?.[c],b.sheet.sensitivity[c],0,100);
  const o=v.ocr;if(o&&['auto','horizontal','vertical','english','korean'].includes(o.writing)&&['fast','best','paddle'].includes(o.ocr))b.ocr={writing:o.writing,ocr:o.ocr==='paddle'?'paddle':'best'};
  const t=v.translation;if(t&&['auto','browser','m2m','nllb'].includes(t.engine)&&['auto','horizontal','vertical','english','korean'].includes(t.writing)&&['ko','en','ja'].includes(t.target)&&['fast','best','paddle'].includes(t.ocr))b.translation={engine:t.engine,writing:t.writing,target:t.target,ocr:t.ocr==='paddle'?'paddle':'best'};
  const used=new Set();for(const action of Object.keys(defaultKeys)){let k=normalizeKey(v.shortcuts?.[action],b.shortcuts[action]);if(k&&used.has(keyId(k)))k=null;b.shortcuts[action]=k;if(k)used.add(keyId(k))}return b;
 }
 function read(){try{return normalize(JSON.parse(localStorage.getItem(KEY)))}catch{return base()}}
 function write(value){const settings=normalize(value);localStorage.setItem(KEY,JSON.stringify(settings));return settings}
 function eventKey(e){return {code:e.code,ctrl:!!e.ctrlKey,alt:!!e.altKey,shift:!!e.shiftKey,meta:!!e.metaKey}}
 function matches(e,k){return !!k&&keyId(eventKey(e))===keyId(k)}
 function label(k){if(!k)return '지정 안 함';return [k.ctrl?'Ctrl':'',k.alt?'Alt':'',k.shift?'Shift':'',k.meta?'⌘':'',k.code==='Space'?'Space':k.code.replace(/^(Key|Digit)/,'')].filter(Boolean).join(' + ')}
 root.AppSettings={read,write,normalize,validateKey,keyId,eventKey,matches,label,defaultKeys};
})(globalThis);
