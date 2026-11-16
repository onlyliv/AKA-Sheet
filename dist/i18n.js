/* UI language is device-local. User text and book content never pass through this catalog. */
(function(root){
 'use strict';
 const supported=['ko','en','ja'],key='aka.ui.language';
 function resolve(choice,languages){if(supported.includes(choice))return choice;for(const value of languages||[]){const code=String(value).toLowerCase().split(/[-_]/)[0];if(supported.includes(code))return code}return 'en'}
 let preference='system';try{const saved=localStorage.getItem(key);if(saved==='system'||supported.includes(saved))preference=saved}catch{}
 let workerLanguage;try{if(!root.document)workerLanguage=new URL(root.location.href).searchParams.get('uiLang')}catch{}
 const locale=resolve(supported.includes(workerLanguage)?workerLanguage:preference,root.navigator?.languages||[root.navigator?.language||'en']);
 const catalog=root.AKA_UI_MESSAGES||{},keys=Object.keys(catalog).filter(k=>k.length>3&&/[가-힣]/.test(k)).sort((a,b)=>b.length-a.length);
 function t(source,values){const row=catalog[source],text=locale==='ko'?source:row?.[locale]??source;return values?String(text).replace(/\{(\w+)\}/g,(all,k)=>Object.hasOwn(values,k)?String(values[k]):all):text}
 function error(source){const text=String(source??'');if(locale==='ko'||!/[가-힣]/.test(text))return text;if(Object.hasOwn(catalog,text))return t(text);const prefix=keys.find(k=>text.startsWith(k));return prefix?t(prefix)+text.slice(prefix.length):text}
 function apply(host){if(!root.document)return;document.documentElement.lang=locale;for(const el of host.querySelectorAll('[data-i18n-text]'))el.textContent=t(el.getAttribute('data-i18n-text'));for(const name of ['aria-label','title','placeholder','alt','data-help'])for(const el of host.querySelectorAll('[data-i18n-'+name+']'))el.setAttribute(name,t(el.getAttribute('data-i18n-'+name)));}
 function init(){const select=document.getElementById('uiLanguage');if(!select)return;select.value=preference;select.onchange=()=>{const next=select.value;if(next!=='system'&&!supported.includes(next))return;try{localStorage.setItem(key,next);preference=next;document.getElementById('uiLanguageStatus').textContent=t('표시 언어를 저장했습니다. 다음 앱 실행부터 적용됩니다.')}catch{select.value=preference;document.getElementById('uiLanguageStatus').textContent=t('언어 설정을 저장하지 못했습니다. 저장 공간을 확인하세요.')}}}
 root.I18n={locale,t,error,apply,resolve,get preference(){return preference},init};
 if(root.document){document.documentElement.lang=locale;document.addEventListener('DOMContentLoaded',init,{once:true})}
})(globalThis);
