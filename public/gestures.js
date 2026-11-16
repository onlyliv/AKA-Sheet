/* Bounded repeats for mouse wheels and trackpads, without requiring a pause. */
class WheelPageGesture {
 constructor(){this.last=-Infinity;this.sign=0;this.amount=0;this.lastTurn=-Infinity;this.reverseAmount=0}
 sample(delta,edge,blocked,now=Date.now()){
  if(!Number.isFinite(delta)||delta===0)return 0;
  const gap=now-this.last;this.last=now;
  // Loading must not poison the rest of a continuous wheel sequence.
  if(blocked||!edge){this.amount=0;this.reverseAmount=0;return 0}
  if(now-this.lastTurn<650)return 0;
  const sign=Math.sign(delta);
  if(gap>450||!this.sign){this.sign=sign;this.amount=0}
  if(sign!==this.sign){
   // Reject quick opposite momentum; a deliberate new gesture can reverse.
   if(gap<160){this.reverseAmount+=Math.abs(delta);if(this.reverseAmount<120){this.amount=0;return 0}}
   this.sign=sign;this.amount=0;
  }
  this.reverseAmount=0;this.amount+=Math.abs(delta);
  if(this.amount<60)return 0;
  this.amount=0;this.lastTurn=now;return this.sign;
 }
}
function swipePageStep(dx,dy,duration,direction){
 if(duration>1200||Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.4)return 0;
 return (dx<0?1:-1)*(direction==='rtl'?-1:1);
}
function tapPageStep(x,left,width,direction){
 if(!Number.isFinite(x)||!Number.isFinite(width)||width<=0||x<left||x>left+width)return 0;
 const step=x<left+width/2?-1:1;
 return direction==='rtl'?-step:step;
}
