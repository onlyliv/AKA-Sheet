/* Display-only sharpening. Never alter raw pixels, book URLs, OCR or saved annotations. */
(function(root){
 const t=s=>root.I18n?.t(s)??s,NS='http://www.w3.org/2000/svg';
 let enabled=AppSettings.read().imageSharpen;
 function install(doc){if(doc.getElementById('aka-readability-defs'))return;
  const svg=doc.createElementNS(NS,'svg');svg.id='aka-readability-defs';svg.setAttribute('aria-hidden','true');svg.style.cssText='position:absolute;width:0;height:0;pointer-events:none';
  svg.innerHTML='<defs><filter id="aka-reading-sharp" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%"><feConvolveMatrix order="3" kernelMatrix="0 -0.12 0 -0.12 1.48 -0.12 0 -0.12 0" divisor="1" edgeMode="duplicate" preserveAlpha="true"/><feComponentTransfer><feFuncR type="linear" slope="1.04" intercept="-0.02"/><feFuncG type="linear" slope="1.04" intercept="-0.02"/><feFuncB type="linear" slope="1.04" intercept="-0.02"/></feComponentTransfer></filter></defs>';
  const style=doc.createElement('style');style.textContent='.aka-reading-sharpen{filter:url("#aka-reading-sharp") !important}';doc.head.append(style);doc.body.append(svg);
 }
 function applyBook(book){const doc=book?.frame?.contentDocument;if(!doc?.body)return;install(doc);for(const im of book.images||[])im.element.classList.toggle('aka-reading-sharpen',enabled)}
 function refresh(){document.getElementById('page')?.classList.toggle('aka-reading-sharpen',enabled);for(const id of ['imageSharpenMenu','imageSharpenSetting']){const e=document.getElementById(id);if(e){if(e.type==='checkbox')e.checked=enabled;else e.setAttribute('aria-pressed',String(enabled))}}if(typeof epub!=='undefined'){applyBook(epub);applyBook(epubSecond)}}
 function set(value){try{const s=AppSettings.read();s.imageSharpen=!!value;AppSettings.write(s);enabled=!!value;refresh()}catch{SettingsUI.toast(t('화면 설정을 저장하지 못했습니다. 현재 화면에는 적용했습니다.'))}}
 install(document);document.getElementById('imageSharpenMenu').onclick=()=>set(!enabled);document.getElementById('imageSharpenSetting').onchange=e=>set(e.target.checked);
 root.ImageReadability={refresh,applyBook,enabled:()=>enabled};refresh();
})(globalThis);
