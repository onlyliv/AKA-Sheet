/* Page-relative ink geometry. EPUB ink is tied to a verified content layout. */
(function(root){
 function surface(view){
  const box=view.box;
  if(view.kind!=='epub')return {view,page:view.page,box,width:box.right-box.left,height:box.bottom-box.top,kind:'page'};
  const scroll=view.v.book.frame.contentDocument.scrollingElement;
  const width=Math.max(scroll.clientWidth,scroll.scrollWidth),height=Math.max(scroll.clientHeight,scroll.scrollHeight);
  return {view,page:view.page,kind:'epub',width,height,scroll,box:{left:box.left-scroll.scrollLeft,top:box.top-scroll.scrollTop,right:box.left-scroll.scrollLeft+width,bottom:box.top-scroll.scrollTop+height}};
 }
 function validSize(size){return !!size&&['page','epub'].includes(size.kind)&&['width','height'].every(k=>Number.isFinite(size[k])&&size[k]>0&&size[k]<=10000000)}
 function compatible(record,s){return record.layout==='page'&&record.anchors?.[0]?.page===s.page&&validSize(record.pageSize)&&record.pageSize.kind===s.kind&&(s.kind!=='epub'||Math.abs(s.width-record.pageSize.width)<=2&&Math.abs(s.height-record.pageSize.height)<=Math.max(3,record.pageSize.height*.002))}
 function placement(record,views){const view=views.find(v=>v.page===record.anchors?.[0]?.page);if(!view)return null;const s=surface(view);return compatible(record,s)?{surface:view,box:s.box,left:s.box.left,top:s.box.top,width:s.width,height:s.height,scale:s.width}:null}
 // Navigate to ink itself, rather than the center of a potentially very tall page.
 function focus(record,placement,hide=()=>false){const stroke=record.strokes.find(s=>!hide(s.color)&&s.points.length),point=stroke?.points[0]||[.5,.5];return {x:placement.left+point[0]*placement.width,y:placement.top+point[1]*placement.height}}
 function create(book,s){return {id:crypto.randomUUID(),book,type:'drawing',layout:'page',schema:4,anchors:[s.kind==='epub'?{kind:'epub-region',page:s.page,path:[],rect:{x:0,y:0,w:1,h:1},ratio:s.width/s.height,indices:[]}:{kind:'page',page:s.page,rect:{x:0,y:0,w:1,h:1}}],pageSize:{kind:s.kind,width:s.width,height:s.height},width:1,height:1,dx:0,dy:0,text:'',color:'black',background:'transparent',font:'default',strokes:[],createdAt:Date.now(),updatedAt:Date.now()}}
 function point(x,y,s){return [Math.max(0,Math.min(1,(x-s.box.left)/s.width)),Math.max(0,Math.min(1,(y-s.box.top)/s.height))]}
 function paint(canvas,strokes,bounds,clip,hide=()=>false,clear=true){
  const x=canvas.getContext('2d'),width=clip.right-clip.left,height=clip.bottom-clip.top;
  if(clear)x.clearRect(0,0,canvas.width,canvas.height);if(width<=0||height<=0||bounds.right<=clip.left||bounds.left>=clip.right||bounds.bottom<=clip.top||bounds.top>=clip.bottom)return;
  x.save();x.scale(canvas.width/width,canvas.height/height);x.beginPath();x.rect(Math.max(0,bounds.left-clip.left),Math.max(0,bounds.top-clip.top),Math.min(bounds.right,clip.right)-Math.max(bounds.left,clip.left),Math.min(bounds.bottom,clip.bottom)-Math.max(bounds.top,clip.top));x.clip();x.translate(bounds.left-clip.left,bounds.top-clip.top);
  const colors={black:'#202020',red:'#c93631',green:'#257342',blue:'#245ebc'},w=bounds.right-bounds.left,h=bounds.bottom-bounds.top;
  x.lineCap=x.lineJoin='round';for(const s of strokes){if(hide(s.color))continue;x.strokeStyle=x.fillStyle=colors[s.color];x.lineWidth=Math.max(.5,s.size*w);x.beginPath();if(s.points.length===1){x.arc(s.points[0][0]*w,s.points[0][1]*h,x.lineWidth/2,0,Math.PI*2);x.fill()}else{for(const [i,p]of s.points.entries())x[i?'lineTo':'moveTo'](p[0]*w,p[1]*h);x.stroke()}}x.restore();
 }
 root.PageInk={surface,validSize,compatible,placement,focus,create,point,paint};
})(globalThis);
