function initializeMenuHelp(){
 let serial=0;
 function closeAll(){for(const b of document.querySelectorAll('.help-button')){b.setAttribute('aria-expanded','false');b.dataset.pinned='false';const id=b.getAttribute('aria-describedby');if(id)document.getElementById(id).hidden=true}}
 for(const button of document.querySelectorAll('button[data-help]')){
  const wrap=document.createElement('span');wrap.className='help-wrap';button.before(wrap);wrap.append(button);const tip=document.createElement('span');tip.className='help-tooltip';tip.id='menu-help-'+(++serial);tip.role='tooltip';tip.textContent=button.dataset.help;tip.hidden=true;wrap.append(tip);button.setAttribute('aria-describedby',tip.id);button.setAttribute('aria-expanded','false');
  const show=()=>{tip.hidden=false;button.setAttribute('aria-expanded','true');const r=button.getBoundingClientRect();tip.style.left=Math.max(8,Math.min(innerWidth-280,r.left))+'px';tip.style.top=Math.min(innerHeight-130,r.bottom+6)+'px'};
  const hide=()=>{if(button.dataset.pinned!=='true'){tip.hidden=true;button.setAttribute('aria-expanded','false')}};
  button.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')show()});wrap.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')hide()});button.addEventListener('focus',show);button.addEventListener('blur',hide);button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const pinned=button.dataset.pinned!=='true';closeAll();if(pinned){button.dataset.pinned='true';show()}});
 }
 document.addEventListener('click',e=>{if(!e.target.closest('.help-wrap'))closeAll()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&[...document.querySelectorAll('.help-button')].some(b=>b.getAttribute('aria-expanded')==='true')){e.preventDefault();e.stopImmediatePropagation();closeAll()}},true);
}
initializeMenuHelp();
