/* Shared reader layout. Move existing controls; never clone IDs, book state or input. */
(function(root){
 'use strict';
 const E=id=>document.getElementById(id),t=(key,values)=>root.I18n?.t(key,values)??key;
 const groups={sheet:['studySheet'],area:['highlightMenu','textSelectionMenu'],notes:['noteMenu','vocabularyMenu','quickTranslation'],book:[]};
 const homes=new Map(),media=matchMedia('(max-width:600px)');let mode='pc',tab='sheet',initialized=false,switching=false,lastMobile=false;
 const mobile=()=>mode==='mobile';
 function move(node,parent,before=null){if(!node||!parent)return;if(!homes.has(node)){const marker=document.createComment('layout-home:'+node.id);node.parentNode.insertBefore(marker,node);homes.set(node,marker)}parent.insertBefore(node,before)}
 function restore(node){const marker=homes.get(node);if(marker?.parentNode)marker.parentNode.insertBefore(node,marker.nextSibling)}
 function buttons(){for(const value of ['pc','mobile'])E('layout-'+value)?.setAttribute('aria-pressed',String(mode===value))}
 function visibility(settings){for(const key of Object.keys(groups)){const available=key==='book'||groups[key].some(id=>!E(id).hidden);E('mobileTab-'+key).hidden=!available;E('mobilePanel-'+key).hidden=!mobile()||tab!==key||!available}if(E('mobileTab-'+tab).hidden){tab=Object.keys(groups).find(key=>!E('mobileTab-'+key).hidden)||'book';visibility(settings)}for(const key of Object.keys(groups)){const b=E('mobileTab-'+key);b.setAttribute('aria-selected',String(tab===key));b.tabIndex=tab===key?0:-1}E('mobileCounters').hidden=!mobile();E('mobileCounterHighlight').hidden=!settings.menuVisibility.highlight;E('mobileCounterNote').hidden=!settings.menuVisibility.note}
 function arrange(settings=AppSettings.read()){
  if(!initialized)return;
  const toolbar=document.querySelector('aside .toolbar')||E('mobilePanel-book').querySelector('.toolbar');
  if(mobile()){
   for(const [key,ids]of Object.entries(groups))for(const id of ids){move(E(id),E('mobilePanel-'+key));E(id).open=true}
   move(toolbar,E('mobilePanel-book'));
   const layoutRow=toolbar.querySelector('.layout-row');move(toolbar.querySelector('.zoom'),layoutRow);
   move(E('highlightCount'),E('mobileCounterHighlight'));move(E('noteCount'),E('mobileCounterNote'));
   move(E('openSettings'),document.querySelector('.brand-row'));
   move(document.querySelector('.book-open'),document.querySelector('.brand-row'));
  }else{
   // Restore nested controls before returning their containers to the sidebar.
   for(const node of homes.keys())if(node!==toolbar)restore(node);restore(toolbar);
   for(const [key,ids]of Object.entries(groups))for(const id of ids)E(id).open=settings.menus[{studySheet:'sheet',highlightMenu:'highlight',textSelectionMenu:'selection',noteMenu:'note',vocabularyMenu:'vocabulary',quickTranslation:'translation'}[id]];
   const aside=E('appMenu');for(const key of settings.menuOrder){const id={sheet:'studySheet',highlight:'highlightMenu',selection:'textSelectionMenu',note:'noteMenu',vocabulary:'vocabularyMenu',translation:'quickTranslation'}[key];aside.insertBefore(E(id),toolbar)}
   document.querySelector('.app-menu').append(E('openSettings'));
  }
  visibility(settings);buttons();sheetState();
 }
 function select(key,persist=true){if(!groups[key])return;const v=E('viewport'),ratio=v.scrollTop/Math.max(1,v.scrollHeight-v.clientHeight);tab=key;visibility(AppSettings.read());if(persist){try{const s=AppSettings.read();s.mobileTab=key;AppSettings.write(s)}catch{SettingsUI.toast(t('화면 설정을 저장하지 못했습니다. 현재 화면에는 적용했습니다.'))}}size();requestAnimationFrame(()=>{v.scrollTop=ratio*Math.max(0,v.scrollHeight-v.clientHeight);root.Notes?.draw();root.DrawingMode?.render()})}
 function sheetState(){const brand=document.querySelector('.brand');if(!brand)return;const on=typeof hidden!=='undefined'&&hidden,theme=typeof sheetColors!=='undefined'?SheetColors.theme(sheetColors):null;document.body.dataset.sheetActive=String(on);if(theme)document.body.style.setProperty('--brand-indicator',theme.accent);brand.setAttribute('aria-label','AKA Sheet · '+t(on?'학습 시트 켜짐':'학습 시트 꺼짐'));E('mobileTab-notes')?.setAttribute('data-drawing',String(!!root.DrawingMode?.active()));}
 async function setMode(value,persist=true){
  if(!['pc','mobile'].includes(value)||switching)return false;
  if(value===mode){if(persist){const s=AppSettings.read();s.uiLayout=value;AppSettings.write(s)}buttons();return true}
  if(busy||root.BetaTranslation?.isRunning()||root.ReaderSelection?.isPreparing()||root.Notes?.isChoosing()||root.DrawingMode?.penDown()){SettingsUI.toast(t('현재 작업을 완료한 뒤 화면 모드를 전환하세요.'));return false}
  switching=true;try{
   if(root.DrawingMode&&await DrawingMode.flush()===false)return false;
   const s=AppSettings.read();if(persist)s.uiLayout=value;
   mode=value;document.body.dataset.uiLayout=mode;arrange(s);
   SettingsUI.refreshLayout(true);root.Notes?.draw();root.DrawingMode?.render();
   if(persist)try{AppSettings.write(s)}catch{SettingsUI.toast(t('화면 설정을 저장하지 못했습니다. 현재 화면에는 적용했습니다.'))}
   buttons();return true;
  }finally{switching=false}
 }
 function init(){
  const s=AppSettings.read();tab=s.mobileTab||'sheet';mode=s.uiLayout==='auto'?(media.matches?'mobile':'pc'):s.uiLayout;document.body.dataset.uiLayout=mode;initialized=true;lastMobile=media.matches;
  const tabKeys=Object.keys(groups);for(const key of tabKeys){const b=E('mobileTab-'+key);b.onclick=()=>select(key);b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const visible=tabKeys.filter(k=>!E('mobileTab-'+k).hidden),i=visible.indexOf(key),next=e.key==='Home'?visible[0]:e.key==='End'?visible.at(-1):visible[(i+(e.key==='ArrowRight'?1:visible.length-1))%visible.length];select(next);E('mobileTab-'+next).focus()}}
  for(const key of ['pc','mobile'])E('layout-'+key).onclick=()=>setMode(key);
  E('mobileDevLog').onclick=()=>E('openDevLog').click();
  media.addEventListener?.('change',()=>{const next=media.matches;if(next===lastMobile)return;lastMobile=next;if(AppSettings.read().uiLayout==='auto')setMode(next?'mobile':'pc',false)});
  document.addEventListener('pointerdown',e=>{if(mobile()&&!E('appMenu').hidden&&e.target.closest?.('#appMenu'))tapSuppressedUntil=Date.now()+400},{passive:true});
  arrange(s);SettingsUI.refreshLayout(true);
 }
 root.AppLayout={mobile,arrange,select,setMode,sheetState,init};init();
})(globalThis);
