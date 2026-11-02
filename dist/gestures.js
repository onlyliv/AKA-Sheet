/* One page turn per wheel gesture; momentum and rebound cannot reverse it. */
class WheelPageGesture {
 constructor(){this.last=-Infinity;this.sign=0;this.amount=0;this.consumed=false}
 sample(delta,edge,blocked,now=Date.now()){
  if(!Number.isFinite(delta)||delta===0)return 0;
  if(now-this.last>320){this.sign=Math.sign(delta);this.amount=0;this.consumed=false}
  this.last=now;
  if(blocked){this.consumed=true;return 0}
  if(this.consumed||Math.sign(delta)!==this.sign)return 0;
  if(!edge){this.amount=0;return 0}
  this.amount+=Math.abs(delta);
  if(this.amount<90)return 0;
  this.consumed=true;return this.sign;
 }
}
function swipePageStep(dx,dy,duration,direction){
 if(duration>1200||Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.4)return 0;
 return (dx<0?1:-1)*(direction==='rtl'?-1:1);
}
