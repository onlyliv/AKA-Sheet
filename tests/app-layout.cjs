const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{
 constructor(id=''){this.id=id;this.children=[];this.parentNode=null;this.attrs={};this.hidden=false;this.open=false;this.style={setProperty(){}};this.scrollTop=100;this.scrollHeight=1000;this.clientHeight=500}
 get nextSibling(){const a=this.parentNode?.children;return a?.[a.indexOf(this)+1]||null}
 get parentElement(){return this.parentNode}
 insertBefore(n,b=null){if(n===b)return;n.parentNode?.remove(n);const i=b?this.children.indexOf(b):this.children.length;assert(i>=0);this.children.splice(i,0,n);n.parentNode=this}
 remove(n){this.children.splice(this.children.indexOf(n),1);n.parentNode=null}
 append(n){this.insertBefore(n)}
 setAttribute(k,v){this.attrs[k]=v}
 querySelector(s){return this.children.find(n=>s==='.'+n.className)||null}
 focus(){}
}
function setup({saved='auto',physical=false}={}){
 const nodes=new Map(),e=id=>{if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id)};
 const order=['sheet','highlight','note','vocabulary','selection','translation'],ids=['studySheet','highlightMenu','noteMenu','vocabularyMenu','textSelectionMenu','quickTranslation'];
 let prefs={uiLayout:saved,mobileTab:'sheet',menuOrder:order,menus:Object.fromEntries(order.map(k=>[k,k!=='note'])),menuVisibility:Object.fromEntries(order.map(k=>[k,k!=='selection']))},writes=0,flush=true,render=0,refresh=0;
 const aside=e('appMenu'),header=e('header'),brandrow=e('brand-row'),brand=e('brand'),nav=e('app-nav'),toolbar=e('toolbar'),layout=e('layout-row'),navigation=e('navigation-row'),zoom=e('zoom');toolbar.className='toolbar';layout.className='layout-row';zoom.className='zoom';
 aside.append(header);header.append(brandrow);brandrow.append(brand);brandrow.append(e('mobileCounters'));brandrow.append(e('hideMenu'));header.append(e('book-open'));nav.append(e('openSettings'));
 for(const id of ids){aside.append(e(id));e(id).hidden=!prefs.menuVisibility[order[ids.indexOf(id)]];e(id).open=prefs.menus[order[ids.indexOf(id)]]}
 e('highlightMenu').append(e('highlightCount'));e('noteMenu').append(e('noteCount'));toolbar.append(layout);toolbar.append(navigation);navigation.append(zoom);aside.append(toolbar);aside.append(nav);
 const media={matches:physical,addEventListener(_,fn){this.change=fn}},body=e('body');body.dataset={};
 const c={console,Map,Date,AppSettings:{read:()=>structuredClone(prefs),write:s=>{prefs=structuredClone(s);writes++}},matchMedia:()=>media,document:{getElementById:e,createComment:()=>new Element(),body,addEventListener(){},querySelector:s=>s==='aside .toolbar'?(toolbar.parentNode===aside?toolbar:null):s==='.book-open'?e('book-open'):s==='.brand-row'?brandrow:s==='.brand'?brand:s==='.app-menu'?nav:null},SettingsUI:{refreshLayout(v){assert.equal(v,true);refresh++},toast(){}},busy:false,hidden:false,sheetColors:['red'],SheetColors:{theme:()=>({accent:'#a83c35'})},DrawingMode:{flush:async()=>flush,render(){render++},active:()=>false,penDown:()=>false},BetaTranslation:{isRunning:()=>false},ReaderSelection:{isPreparing:()=>false},Notes:{draw(){},isChoosing:()=>false},size(){},requestAnimationFrame:fn=>fn()};
 vm.createContext(c);vm.runInContext(fs.readFileSync('public/app-layout.js','utf8'),c);
 return{c,e,aside,toolbar,nav,brandrow,zoom,layout,navigation,media,prefs:()=>prefs,writes:()=>writes,flush:v=>flush=v,refresh:()=>refresh};
}
(async()=>{
 let a=setup();assert.equal(a.c.AppLayout.mobile(),false);const originalCount=a.e('noteCount'),originalBook=a.e('book-open');
 assert(await a.c.AppLayout.setMode('mobile'));assert.equal(a.prefs().uiLayout,'mobile');assert.equal(originalCount.parentNode,a.e('mobileCounterNote'));assert.equal(a.toolbar.parentNode,a.e('mobilePanel-book'));assert.equal(originalBook.parentNode,a.brandrow);assert.equal(a.e('noteMenu').open,true);
 a.c.AppLayout.select('notes');assert.equal(a.e('mobilePanel-notes').hidden,false);assert.equal(a.e('mobilePanel-sheet').hidden,true);assert.equal(a.prefs().mobileTab,'notes');
 assert(await a.c.AppLayout.setMode('pc'));assert.equal(a.e('noteCount'),originalCount);assert.equal(originalCount.parentNode,a.e('noteMenu'));assert.equal(a.e('noteMenu').open,false);assert.equal(a.zoom.parentNode,a.navigation);assert.equal(a.e('openSettings').parentNode,a.nav);assert.equal(a.toolbar.parentNode,a.aside);
 // Repeated transitions preserve node identity, sibling order and listeners.
 originalCount.onclick=()=>42;for(let i=0;i<3;i++){await a.c.AppLayout.setMode('mobile');await a.c.AppLayout.setMode('pc')}assert.equal(originalCount.onclick(),42);assert.equal(a.aside.children.filter(n=>n.id==='noteMenu').length,1);
 a.c.busy=true;assert.equal(await a.c.AppLayout.setMode('mobile'),false);a.c.busy=false;a.flush(false);assert.equal(await a.c.AppLayout.setMode('mobile'),false);assert.equal(a.c.AppLayout.mobile(),false);
 // Saved explicit choice overrides physical size; auto follows it without persisting override.
 a=setup({saved:'pc',physical:true});assert.equal(a.c.AppLayout.mobile(),false);a.media.matches=false;a.media.change();assert.equal(a.c.AppLayout.mobile(),false);
 a=setup({physical:true});assert.equal(a.c.AppLayout.mobile(),true);a.media.matches=false;a.media.change();await new Promise(setImmediate);assert.equal(a.c.AppLayout.mobile(),false);assert.equal(a.prefs().uiLayout,'auto');
 // Hidden sections do not leak their controls or dead tabs into the mobile layout.
 const s=a.prefs();s.menuVisibility.sheet=false;a.e('studySheet').hidden=true;await a.c.AppLayout.setMode('mobile');a.c.AppLayout.arrange(s);assert.equal(a.e('mobileTab-sheet').hidden,true);assert.equal(a.e('mobilePanel-sheet').hidden,true);
 console.log('Layout identity, persistence, tabs, responsive choice, save guards and restoration passed');
})().catch(e=>{console.error(e);process.exitCode=1});
