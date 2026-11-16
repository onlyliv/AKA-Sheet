/* Pure stroke geometry; no network, OCR, SVG strings, or executable user content. */
(function(root){
 const ink={black:'#202020',red:'#c93631',green:'#257342',blue:'#245ebc'};
 function valid(strokes){return Array.isArray(strokes)&&strokes.length<=2000&&strokes.reduce((n,s)=>n+(Array.isArray(s?.points)?s.points.length:100001),0)<=100000&&strokes.every(s=>s&&Object.hasOwn(ink,s.color)&&Number.isFinite(s.size)&&s.size>=.0001&&s.size<=.2&&Array.isArray(s.points)&&s.points.length>0&&s.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&n>=0&&n<=1)))}
 function paint(c,strokes,hide=()=>false){const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.lineCap=x.lineJoin='round';for(const s of strokes){if(hide(s.color))continue;x.strokeStyle=x.fillStyle=ink[s.color];x.lineWidth=Math.max(.5,s.size*c.width);x.beginPath();if(s.points.length===1){x.arc(s.points[0][0]*c.width,s.points[0][1]*c.height,x.lineWidth/2,0,Math.PI*2);x.fill()}else{for(let i=0;i<s.points.length;i++){const p=s.points[i];x[i?'lineTo':'moveTo'](p[0]*c.width,p[1]*c.height)}x.stroke()}}}
 function segment(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)}
 function hit(s,p,width,height){const convert=p=>[p[0]*width,p[1]*height],point=convert(p),r=12+s.size*width/2;return s.points.some((v,i)=>segment(point,convert(v),convert(s.points[Math.max(0,i-1)]))<=r)}
 root.NoteDrawing={valid,paint,hit};
})(globalThis);
