(function(root){
 function matches(r,g,b,color='red',level=60){if(Array.isArray(color))return color.some(c=>matches(r,g,b,c,typeof level==='object'?level[c]:level));const limit=35-level*.3;if(color==='green')return g>95&&g-r>limit&&g-b>limit*.65;if(color==='blue')return b>95&&b-r>limit&&b-g>limit*.65;return r>95&&r-g>limit&&r-b>limit*.65}
 function css(color,sheet,level){const v=String(color).match(/[\d.]+/g);return !!(v&&v.length>=3&&matches(+v[0],+v[1],+v[2],sheet,level))}
 function mask(data,level,color){const p=data.data;for(let i=0;i<p.length;i+=4)if(matches(p[i],p[i+1],p[i+2],color,level))p[i]=p[i+1]=p[i+2]=255;return data}
 function background(data,box){if(!data?.data||!data.width||!data.height)return '#ffffff';const counts=new Map();for(let i=0;i<20;i++){const t=i/19;for(const [x,y]of [[box.left+t*(box.right-box.left),box.top-3],[box.left+t*(box.right-box.left),box.bottom+3],[box.left-3,box.top+t*(box.bottom-box.top)],[box.right+3,box.top+t*(box.bottom-box.top)]]){if(x<0||y<0||x>=data.width||y>=data.height)continue;const k=(Math.floor(y)*data.width+Math.floor(x))*4,[r,g,b,a]=data.data.slice(k,k+4);if(a<128||Math.max(r,g,b)-Math.min(r,g,b)>70)continue;const key=[r,g,b].map(c=>Math.round(c/12)).join(':');const entry=counts.get(key)||{count:0,r:0,g:0,b:0};entry.count++;entry.r+=r;entry.g+=g;entry.b+=b;counts.set(key,entry)}}const best=[...counts.values()].sort((a,b)=>b.count-a.count)[0];return best?'rgb('+[best.r,best.g,best.b].map(v=>Math.round(v/best.count)).join(',')+')':'#ffffff'}
 function theme(colors){const key=['red','green','blue'].filter(c=>colors.includes(c)).join('+');const palette={
 '': ['none','#69716d','#ffffff','#e9ece9','#69716d'],
 red:['red','#a83c35','#ffffff','#f6e8e4','#a83c35'],
 green:['green','#357552','#ffffff','#e4f0e7','#357552'],
 blue:['blue','#356fad','#ffffff','#e6edf8','#356fad'],
 'red+green':['yellow','#f3d85b','#30372e','#fbf5d5','#78651a'],
 'red+blue':['magenta','#ab397e','#ffffff','#f6e4f0','#ab397e'],
 'green+blue':['cyan','#76d5dc','#243d40','#e0f5f6','#28666c'],
 'red+green+blue':['white','#ffffff','#30372e','#f0f1ee','#596156']};const [name,color,ink,soft,accent]=palette[key];return {name,color,ink,soft,accent,border:name==='white'?'#aab1a5':color}}
 root.SheetColors={matches,css,mask,background,theme};
})(globalThis);
