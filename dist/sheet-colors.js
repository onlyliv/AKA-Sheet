(function(root){
 function matches(r,g,b,color='red',level=60){const limit=35-level*.3;if(color==='green')return g>95&&g-r>limit&&g-b>limit*.65;if(color==='blue')return b>95&&b-r>limit&&b-g>limit*.65;return r>95&&r-g>limit&&r-b>limit*.65}
 function css(color,sheet,level){const v=String(color).match(/[\d.]+/g);return !!(v&&v.length>=3&&matches(+v[0],+v[1],+v[2],sheet,level))}
 function mask(data,level,color){const p=data.data;for(let i=0;i<p.length;i+=4)if(matches(p[i],p[i+1],p[i+2],color,level))p[i]=p[i+1]=p[i+2]=255;return data}
 root.SheetColors={matches,css,mask};
})(globalThis);
