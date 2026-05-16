// @ts-nocheck
import React, { useEffect, useRef } from "react";

export default function Cursor() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Label element
    const label = document.createElement("div");
    label.style.cssText = `position:fixed;pointer-events:none;z-index:1000000;font-family:'Share Tech Mono','Courier New',monospace;font-size:8px;color:rgba(0,245,255,.5);letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap;transition:opacity .2s;`;
    label.textContent = "SYS.TRACK";
    document.body.appendChild(label);

    const S = {
      mx:0,my:0, ox:0,oy:0, ix:0,iy:0, vx:0,vy:0,
      mode:"default", modeProgress:0,
      sparks:[], ringAngle:0, radarAngle:0,
      magnetX:0,magnetY:0, magnetTarget:null,
    };

    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize(); window.addEventListener("resize",resize,{passive:true});

    function detectMode(el) {
      if (!el) return "default";
      const tag = el.tagName?.toLowerCase()||"";
      let node = el;
      for (let i=0;i<4&&node;i++,node=node.parentElement) {
        const t=node.tagName?.toLowerCase()||"", c=node.className||"";
        if (t==="button"||(typeof c==="string"&&/btn|button/i.test(c))) return "button";
        if (t==="a") return "link";
        if (typeof c==="string"&&/card/i.test(c)) return "card";
      }
      if (["p","span","h1","h2","h3","h4","h5","h6","li","label","input","textarea"].includes(tag)) return "text";
      return "default";
    }

    let lastMag=0, cachedEls=[];
    function updateMagnet(mx,my) {
      const now = Date.now();
      if(now - lastMag > 500) { cachedEls = Array.from(document.querySelectorAll("button,a,[class*='btn'],[class*='card']")); lastMag = now; }
      let best=null,bestDist=90;
      cachedEls.forEach(el=>{
        const r=el.getBoundingClientRect();
        const cx=r.left+r.width/2, cy=r.top+r.height/2;
        const d=Math.hypot(mx-cx,my-cy);
        if(d<bestDist){bestDist=d;best={cx,cy,d};}
      });
      S.magnetTarget=best;
      S.magnetX=mx; S.magnetY=my; // Position always stays with real mouse for accuracy
    }

    function spawnRipple(x,y) {
      [{cls:"r1",color:"rgba(0,245,255,.8)",delay:"0s"},{cls:"r2",color:"rgba(138,46,255,.6)",delay:"0.08s"}].forEach(({color,delay})=>{
        const el=document.createElement("div");
        el.style.cssText=`position:fixed;border-radius:50%;pointer-events:none;z-index:999998;left:${x}px;top:${y}px;border:1.5px solid ${color};animation:imp-rpl .7s cubic-bezier(.4,0,.2,1) ${delay} forwards;width:0;height:0;transform:translate(-50%,-50%);`;
        document.body.appendChild(el); setTimeout(()=>el.remove(),1200);
      });
    }

    // Inject ripple keyframe once
    if (!document.getElementById("imp-rpl-kf")) {
      const s=document.createElement("style"); s.id="imp-rpl-kf";
      s.textContent=`@keyframes imp-rpl{from{width:0;height:0;opacity:.9;transform:translate(-50%,-50%)}to{width:130px;height:130px;opacity:0;transform:translate(-50%,-50%)}}`;
      document.head.appendChild(s);
    }

    const onMove = e => {
      S.vx=e.clientX-S.mx; S.vy=e.clientY-S.my;
      S.mx=e.clientX; S.my=e.clientY;
      updateMagnet(e.clientX,e.clientY);
      const mode=detectMode(document.elementFromPoint(e.clientX,e.clientY));
      if(mode!==S.mode){S.mode=mode;S.modeProgress=0;}
      const labels={default:"SYS.TRACK",button:"ACTIVATE",link:"NAVIGATE",card:"SCAN",text:"READ"};
      label.style.transform=`translate3d(${e.clientX+18}px,${e.clientY+14}px,0)`;
      label.textContent=labels[mode]||"SYS.TRACK";
      const spd=Math.hypot(S.vx,S.vy);
      if(spd>8){
        const count=Math.min(3,Math.floor(spd/7));
        for(let i=0;i<count;i++){
          const ang=Math.atan2(S.vy,S.vx)+(Math.random()-.5)*2;
          const v=1.5+Math.random()*3.5;
          S.sparks.push({x:e.clientX,y:e.clientY,vx:-Math.cos(ang)*v*.7+(Math.random()-.5)*2,vy:-Math.sin(ang)*v*.7+(Math.random()-.5)*2,life:1,maxLife:.25+Math.random()*.35,r:.8+Math.random()*2,col:Math.random()>.5?"0,245,255":"138,46,255"});
        }
      }
    };
    const onClick = e => {
      spawnRipple(e.clientX,e.clientY);
      for(let i=0;i<20;i++){
        const ang=(i/20)*Math.PI*2+Math.random()*.4, v=2.5+Math.random()*6;
        S.sparks.push({x:e.clientX,y:e.clientY,vx:Math.cos(ang)*v,vy:Math.sin(ang)*v,life:1,maxLife:.4+Math.random()*.4,r:1+Math.random()*2.5,col:["0,245,255","138,46,255","255,44,251"][i%3]});
      }
    };
    document.addEventListener("mousemove",onMove,{passive:true});
    document.addEventListener("click",onClick);

    let rafId;
    function frame(ts) {
      const t=ts/1000;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      S.ix+=(S.magnetX-S.ix)*.65; S.iy+=(S.magnetY-S.iy)*.65;
      S.ox+=(S.magnetX-S.ox)*.35; S.oy+=(S.magnetY-S.oy)*.35;
      const spd=Math.hypot(S.vx,S.vy);
      S.modeProgress=Math.min(1,S.modeProgress+.07);
      const outerR={default:26,button:38,link:20,card:44,text:18}[S.mode]??26;
      const coreR={default:5,button:7,link:3,card:8,text:2.5}[S.mode]??5;
      const accentCol=S.mode==="card"?"138,46,255":"0,245,255";
      S.ringAngle+=.016*(2.2+spd*.04+(S.mode==="button"?1.5:0));
      S.radarAngle+=.016*1.6;

      if(spd>5){
        const steps=Math.min(6,Math.floor(spd*.5));
        for(let i=steps;i>=1;i--){
          const tr=i/steps, tx=S.ox+(S.mx-S.ox)*(1-tr*.8), ty=S.oy+(S.my-S.oy)*(1-tr*.8);
          ctx.beginPath(); ctx.arc(tx,ty,coreR*(.4+tr*.5),0,Math.PI*2);
          ctx.fillStyle=`rgba(0,245,255,${.05*tr})`; ctx.fill();
        }
      }

      const glowR=outerR+28+Math.sin(t*2.2)*5;
      let gG=ctx.createRadialGradient(S.ox,S.oy,0,S.ox,S.oy,glowR);
      gG.addColorStop(0,`rgba(0,245,255,${.065+(spd>3?.03:0)})`); gG.addColorStop(.4,"rgba(0,119,255,.025)"); gG.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(S.ox,S.oy,glowR,0,Math.PI*2); ctx.fillStyle=gG; ctx.fill();
      let gG2=ctx.createRadialGradient(S.ox,S.oy,0,S.ox,S.oy,glowR*.7);
      gG2.addColorStop(0,"rgba(138,46,255,.03)"); gG2.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(S.ox,S.oy,glowR*.7,0,Math.PI*2); ctx.fillStyle=gG2; ctx.fill();

      ctx.save(); ctx.translate(S.ox,S.oy); ctx.rotate(S.ringAngle);
      const segCount=S.mode==="card"?6:4, segGap=S.mode==="card"?.32:.44;
      for(let i=0;i<segCount;i++){
        const sa=(i/segCount)*Math.PI*2, ea=sa+(Math.PI*2/segCount)*(1-segGap);
        ctx.beginPath(); ctx.arc(0,0,outerR,sa,ea);
        ctx.strokeStyle=`rgba(${accentCol},.85)`; ctx.lineWidth=S.mode==="button"?1.8:1.4;
        ctx.shadowColor=`rgba(${accentCol},1)`; ctx.shadowBlur=9; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(Math.cos(sa)*(outerR-4),Math.sin(sa)*(outerR-4)); ctx.lineTo(Math.cos(sa)*(outerR+5),Math.sin(sa)*(outerR+5));
        ctx.strokeStyle=`rgba(${accentCol},.4)`; ctx.lineWidth=1; ctx.shadowBlur=0; ctx.stroke();
      }
      ctx.restore();

      ctx.save(); ctx.translate(S.ox,S.oy); ctx.rotate(-S.ringAngle*.6);
      ctx.beginPath(); ctx.arc(0,0,outerR*.68,0,Math.PI*2);
      ctx.setLineDash([3,8]); ctx.strokeStyle=`rgba(${accentCol},.22)`; ctx.lineWidth=.8; ctx.shadowBlur=0; ctx.stroke();
      ctx.setLineDash([]); ctx.restore();

      ctx.save(); ctx.translate(S.ox,S.oy); ctx.rotate(S.radarAngle);
      const sweepR=outerR*.66;
      for(let i=0;i<16;i++){
        const a=-(i/16)*Math.PI*.85;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,sweepR-2,a,a+.07); ctx.closePath();
        ctx.fillStyle=`rgba(0,245,255,${(1-i/16)*.16})`; ctx.fill();
      }
      ctx.restore();

      ctx.save(); ctx.translate(S.ox,S.oy); ctx.rotate(S.ringAngle*1.25);
      const diam=outerR+8;
      ctx.beginPath(); ctx.moveTo(0,-diam-5); ctx.lineTo(3.5,-diam); ctx.lineTo(0,-diam+5); ctx.lineTo(-3.5,-diam); ctx.closePath();
      ctx.fillStyle="#00f5ff"; ctx.shadowColor="#00f5ff"; ctx.shadowBlur=14; ctx.fill();
      ctx.restore();

      ctx.save(); ctx.translate(S.ix,S.iy);
      const pulse=Math.abs(Math.sin(t*3.2));
      for(let i=3;i>=1;i--){
        const pr=coreR*(1+i*.65*pulse);
        const cG2=ctx.createRadialGradient(0,0,0,0,0,pr);
        cG2.addColorStop(0,`rgba(0,245,255,${.14/i})`); cG2.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(0,0,pr,0,Math.PI*2); ctx.fillStyle=cG2; ctx.fill();
      }
      const cG=ctx.createRadialGradient(-coreR*.3,-coreR*.3,0,0,0,coreR);
      cG.addColorStop(0,"#fff"); cG.addColorStop(.4,"#00f5ff"); cG.addColorStop(1,"#0077ff");
      ctx.beginPath(); ctx.arc(0,0,coreR,0,Math.PI*2);
      ctx.fillStyle=cG; ctx.shadowColor="#00f5ff"; ctx.shadowBlur=18; ctx.fill();

      if(S.mode==="button"||S.mode==="card"){
        const len=outerR-7;
        ctx.strokeStyle=`rgba(${accentCol},${S.modeProgress*.5})`; ctx.lineWidth=.7; ctx.shadowBlur=0;
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
          ctx.beginPath(); ctx.moveTo(dx*(coreR+3),dy*(coreR+3)); ctx.lineTo(dx*len,dy*len); ctx.stroke();
        });
      }
      if(S.mode==="text"){
        ctx.strokeStyle="rgba(0,245,255,.9)"; ctx.lineWidth=1.5; ctx.shadowColor="#00f5ff"; ctx.shadowBlur=10;
        [[0,-13,0,13],[-4,-13,4,-13],[-4,13,4,13]].forEach(([x1,y1,x2,y2])=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();});
      }
      if(S.mode==="link"){
        ctx.strokeStyle="rgba(255,44,251,.95)"; ctx.lineWidth=2; ctx.shadowColor="#ff2cfb"; ctx.shadowBlur=14;
        ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(8,0); ctx.lineTo(0,8); ctx.stroke();
      }
      ctx.restore();

      const dist=Math.hypot(S.ox-S.ix,S.oy-S.iy);
      if(dist>5){
        ctx.setLineDash([2,7]); ctx.strokeStyle="rgba(0,245,255,.16)"; ctx.lineWidth=.7; ctx.shadowBlur=0;
        ctx.beginPath(); ctx.moveTo(S.ox,S.oy); ctx.lineTo(S.ix,S.iy); ctx.stroke(); ctx.setLineDash([]);
      }

      if(S.mode==="button"&&S.magnetTarget){
        const {cx:bcx,cy:bcy}=S.magnetTarget, phase=(t*1.8)%1;
        const ba=phase<.5?phase*.14:(1-phase)*.14;
        const bG=ctx.createRadialGradient(bcx,bcy,0,bcx,bcy,58);
        bG.addColorStop(0,`rgba(0,245,255,${ba})`); bG.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(bcx,bcy,58,0,Math.PI*2); ctx.fillStyle=bG; ctx.fill();
      }

      for(let i=S.sparks.length-1;i>=0;i--){
        const sp=S.sparks[i];
        sp.x+=sp.vx; sp.y+=sp.vy; sp.vy+=.07; sp.life-=.016/sp.maxLife;
        if(sp.life<=0){S.sparks.splice(i,1);continue;}
        ctx.beginPath(); ctx.arc(sp.x,sp.y,sp.r*sp.life,0,Math.PI*2);
        ctx.fillStyle=`rgba(${sp.col},${sp.life*.9})`; ctx.shadowColor=`rgb(${sp.col})`; ctx.shadowBlur=6; ctx.fill();
      }
      ctx.shadowBlur=0;
      rafId=requestAnimationFrame(frame);
    }
    rafId=requestAnimationFrame(frame);

    return ()=>{
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove",onMove);
      document.removeEventListener("click",onClick);
      window.removeEventListener("resize",resize);
      label.remove();
    };
  },[]);

  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999999,width:"100%",height:"100%"}} />;
}
