// @ts-nocheck
import { useState, useEffect, useRef } from "react";

function Cursor() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `*, *::before, *::after { cursor: none !important; }
@keyframes imp-rpl{from{width:0;height:0;opacity:.9;transform:translate(-50%,-50%)}to{width:130px;height:130px;opacity:0;transform:translate(-50%,-50%)}}`;
    document.head.appendChild(style);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const label = document.createElement("div");
    label.style.cssText = `position:fixed;pointer-events:none;z-index:1000000;font-family:'Share Tech Mono','Courier New',monospace;font-size:8px;color:rgba(0,245,255,.5);letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap;transition:opacity .2s;`;
    label.textContent = "SYS.TRACK";
    document.body.appendChild(label);
    const S = { mx:0,my:0,ox:0,oy:0,ix:0,iy:0,vx:0,vy:0,mode:"default",modeProgress:0,sparks:[],ringAngle:0,radarAngle:0,magnetX:0,magnetY:0,magnetTarget:null };
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    resize();
    window.addEventListener("resize", resize, { passive:true });
    function detectMode(el) {
      if (!el) return "default";
      const tag = el.tagName?.toLowerCase()||"";
      let node = el;
      for (let i=0;i<4&&node;i++,node=node.parentElement) {
        const t=node.tagName?.toLowerCase()||"",c=node.className||"";
        if (t==="button"||(typeof c==="string"&&/btn|button/i.test(c))) return "button";
        if (t==="a") return "link";
        if (typeof c==="string"&&/card/i.test(c)) return "card";
      }
      if (["p","span","h1","h2","h3","h4","h5","h6","li","label"].includes(tag)) return "text";
      return "default";
    }
    let lastMag=0, cachedEls=[];
    function updateMagnet(mx,my) {
      const now = Date.now();
      if(now - lastMag > 500) { cachedEls = Array.from(document.querySelectorAll("button,a,[class*='btn'],[class*='card']")); lastMag = now; }
      let best=null,bestDist=90;
      cachedEls.forEach(el=>{const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,d=Math.hypot(mx-cx,my-cy);if(d<bestDist){bestDist=d;best={cx,cy,d};}});
      S.magnetTarget=best;
      if(best){const pull=Math.pow(1-best.d/90,2.5)*20,ang=Math.atan2(best.cy-my,best.cx-mx);S.magnetX=mx+Math.cos(ang)*pull;S.magnetY=my+Math.sin(ang)*pull;}
      else{S.magnetX=mx;S.magnetY=my;}
    }
    function spawnRipple(x,y) {
      [{color:"rgba(0,245,255,.8)",delay:"0s"},{color:"rgba(138,46,255,.6)",delay:"0.08s"}].forEach(({color,delay})=>{
        const el=document.createElement("div");
        el.style.cssText=`position:fixed;border-radius:50%;pointer-events:none;z-index:999998;left:${x}px;top:${y}px;border:1.5px solid ${color};animation:imp-rpl .7s cubic-bezier(.4,0,.2,1) ${delay} forwards;width:0;height:0;transform:translate(-50%,-50%);`;
        document.body.appendChild(el);setTimeout(()=>el.remove(),1200);
      });
    }
    const onMove=e=>{
      S.vx=e.clientX-S.mx;S.vy=e.clientY-S.my;S.mx=e.clientX;S.my=e.clientY;
      updateMagnet(e.clientX,e.clientY);
      const mode=detectMode(document.elementFromPoint(e.clientX,e.clientY));
      if(mode!==S.mode){S.mode=mode;S.modeProgress=0;}
      const labels={default:"SYS.TRACK",button:"ACTIVATE",link:"NAVIGATE",card:"SCAN",text:"READ"};
      label.style.transform=`translate3d(${e.clientX+18}px,${e.clientY+14}px,0)`;
      label.textContent=labels[mode]||"SYS.TRACK";
      const spd=Math.hypot(S.vx,S.vy);
      if(spd>8){const count=Math.min(3,Math.floor(spd/7));for(let i=0;i<count;i++){const ang=Math.atan2(S.vy,S.vx)+(Math.random()-.5)*2,v=1.5+Math.random()*3.5;S.sparks.push({x:e.clientX,y:e.clientY,vx:-Math.cos(ang)*v*.7+(Math.random()-.5)*2,vy:-Math.sin(ang)*v*.7+(Math.random()-.5)*2,life:1,maxLife:.25+Math.random()*.35,r:.8+Math.random()*2,col:Math.random()>.5?"0,245,255":"138,46,255"});}}
    };
    const onClick=e=>{
      spawnRipple(e.clientX,e.clientY);
      for(let i=0;i<20;i++){const ang=(i/20)*Math.PI*2+Math.random()*.4,v=2.5+Math.random()*6;S.sparks.push({x:e.clientX,y:e.clientY,vx:Math.cos(ang)*v,vy:Math.sin(ang)*v,life:1,maxLife:.4+Math.random()*.4,r:1+Math.random()*2.5,col:["0,245,255","138,46,255","255,44,251"][i%3]});}
    };
    document.addEventListener("mousemove",onMove,{passive:true});
    document.addEventListener("click",onClick);
    let rafId;
    function frame(ts) {
      const t=ts/1000;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      S.ix+=(S.magnetX-S.ix)*.28;S.iy+=(S.magnetY-S.iy)*.28;S.ox+=(S.magnetX-S.ox)*.13;S.oy+=(S.magnetY-S.oy)*.13;
      const spd=Math.hypot(S.vx,S.vy);
      S.modeProgress=Math.min(1,S.modeProgress+.07);
      const outerR={default:26,button:38,link:20,card:44,text:18}[S.mode]??26;
      const coreR={default:5,button:7,link:3,card:8,text:2.5}[S.mode]??5;
      const accentCol=S.mode==="card"?"138,46,255":"0,245,255";
      S.ringAngle+=.016*(2.2+spd*.04+(S.mode==="button"?1.5:0));
      S.radarAngle+=.016*1.6;
      if(spd>5){const steps=Math.min(6,Math.floor(spd*.5));for(let i=steps;i>=1;i--){const tr=i/steps,tx=S.ox+(S.mx-S.ox)*(1-tr*.8),ty=S.oy+(S.my-S.oy)*(1-tr*.8);ctx.beginPath();ctx.arc(tx,ty,coreR*(.4+tr*.5),0,Math.PI*2);ctx.fillStyle=`rgba(0,245,255,${.05*tr})`;ctx.fill();}}
      const glowR=outerR+28+Math.sin(t*2.2)*5;
      let gG=ctx.createRadialGradient(S.ox,S.oy,0,S.ox,S.oy,glowR);
      gG.addColorStop(0,`rgba(0,245,255,${.065+(spd>3?.03:0)})`);gG.addColorStop(.4,"rgba(0,119,255,.025)");gG.addColorStop(1,"transparent");
      ctx.beginPath();ctx.arc(S.ox,S.oy,glowR,0,Math.PI*2);ctx.fillStyle=gG;ctx.fill();
      let gG2=ctx.createRadialGradient(S.ox,S.oy,0,S.ox,S.oy,glowR*.7);
      gG2.addColorStop(0,"rgba(138,46,255,.03)");gG2.addColorStop(1,"transparent");
      ctx.beginPath();ctx.arc(S.ox,S.oy,glowR*.7,0,Math.PI*2);ctx.fillStyle=gG2;ctx.fill();
      ctx.save();ctx.translate(S.ox,S.oy);ctx.rotate(S.ringAngle);
      const segCount=S.mode==="card"?6:4,segGap=S.mode==="card"?.32:.44;
      for(let i=0;i<segCount;i++){const sa=(i/segCount)*Math.PI*2,ea=sa+(Math.PI*2/segCount)*(1-segGap);ctx.beginPath();ctx.arc(0,0,outerR,sa,ea);ctx.strokeStyle=`rgba(${accentCol},.85)`;ctx.lineWidth=S.mode==="button"?1.8:1.4;ctx.shadowColor=`rgba(${accentCol},1)`;ctx.shadowBlur=9;ctx.stroke();ctx.beginPath();ctx.moveTo(Math.cos(sa)*(outerR-4),Math.sin(sa)*(outerR-4));ctx.lineTo(Math.cos(sa)*(outerR+5),Math.sin(sa)*(outerR+5));ctx.strokeStyle=`rgba(${accentCol},.4)`;ctx.lineWidth=1;ctx.shadowBlur=0;ctx.stroke();}
      ctx.restore();
      ctx.save();ctx.translate(S.ox,S.oy);ctx.rotate(-S.ringAngle*.6);
      ctx.beginPath();ctx.arc(0,0,outerR*.68,0,Math.PI*2);ctx.setLineDash([3,8]);ctx.strokeStyle=`rgba(${accentCol},.22)`;ctx.lineWidth=.8;ctx.stroke();ctx.setLineDash([]);ctx.restore();
      ctx.save();ctx.translate(S.ox,S.oy);ctx.rotate(S.radarAngle);
      const sweepR=outerR*.66;
      for(let i=0;i<16;i++){const a=-(i/16)*Math.PI*.85;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,sweepR-2,a,a+.07);ctx.closePath();ctx.fillStyle=`rgba(0,245,255,${(1-i/16)*.16})`;ctx.fill();}
      ctx.restore();
      ctx.save();ctx.translate(S.ox,S.oy);ctx.rotate(S.ringAngle*1.25);
      const diam=outerR+8;ctx.beginPath();ctx.moveTo(0,-diam-5);ctx.lineTo(3.5,-diam);ctx.lineTo(0,-diam+5);ctx.lineTo(-3.5,-diam);ctx.closePath();
      ctx.fillStyle="#00f5ff";ctx.shadowColor="#00f5ff";ctx.shadowBlur=14;ctx.fill();ctx.restore();
      ctx.save();ctx.translate(S.ix,S.iy);
      const pulse=Math.abs(Math.sin(t*3.2));
      for(let i=3;i>=1;i--){const pr=coreR*(1+i*.65*pulse),cG2=ctx.createRadialGradient(0,0,0,0,0,pr);cG2.addColorStop(0,`rgba(0,245,255,${.14/i})`);cG2.addColorStop(1,"transparent");ctx.beginPath();ctx.arc(0,0,pr,0,Math.PI*2);ctx.fillStyle=cG2;ctx.fill();}
      const cG=ctx.createRadialGradient(-coreR*.3,-coreR*.3,0,0,0,coreR);
      cG.addColorStop(0,"#fff");cG.addColorStop(.4,"#00f5ff");cG.addColorStop(1,"#0077ff");
      ctx.beginPath();ctx.arc(0,0,coreR,0,Math.PI*2);ctx.fillStyle=cG;ctx.shadowColor="#00f5ff";ctx.shadowBlur=18;ctx.fill();
      if(S.mode==="button"||S.mode==="card"){const len=outerR-7;ctx.strokeStyle=`rgba(${accentCol},${S.modeProgress*.5})`;ctx.lineWidth=.7;ctx.shadowBlur=0;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{ctx.beginPath();ctx.moveTo(dx*(coreR+3),dy*(coreR+3));ctx.lineTo(dx*len,dy*len);ctx.stroke();});}
      if(S.mode==="text"){ctx.strokeStyle="rgba(0,245,255,.9)";ctx.lineWidth=1.5;ctx.shadowColor="#00f5ff";ctx.shadowBlur=10;[[0,-13,0,13],[-4,-13,4,-13],[-4,13,4,13]].forEach(([x1,y1,x2,y2])=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();});}
      if(S.mode==="link"){ctx.strokeStyle="rgba(255,44,251,.95)";ctx.lineWidth=2;ctx.shadowColor="#ff2cfb";ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(8,0);ctx.lineTo(0,8);ctx.stroke();}
      ctx.restore();
      const dist=Math.hypot(S.ox-S.ix,S.oy-S.iy);
      if(dist>5){ctx.setLineDash([2,7]);ctx.strokeStyle="rgba(0,245,255,.16)";ctx.lineWidth=.7;ctx.shadowBlur=0;ctx.beginPath();ctx.moveTo(S.ox,S.oy);ctx.lineTo(S.ix,S.iy);ctx.stroke();ctx.setLineDash([]);}
      if(S.mode==="button"&&S.magnetTarget){const{cx:bcx,cy:bcy}=S.magnetTarget,phase=(t*1.8)%1,ba=phase<.5?phase*.14:(1-phase)*.14;const bG=ctx.createRadialGradient(bcx,bcy,0,bcx,bcy,58);bG.addColorStop(0,`rgba(0,245,255,${ba})`);bG.addColorStop(1,"transparent");ctx.beginPath();ctx.arc(bcx,bcy,58,0,Math.PI*2);ctx.fillStyle=bG;ctx.fill();}
      for(let i=S.sparks.length-1;i>=0;i--){const sp=S.sparks[i];sp.x+=sp.vx;sp.y+=sp.vy;sp.vy+=.07;sp.life-=.016/sp.maxLife;if(sp.life<=0){S.sparks.splice(i,1);continue;}ctx.beginPath();ctx.arc(sp.x,sp.y,sp.r*sp.life,0,Math.PI*2);ctx.fillStyle=`rgba(${sp.col},${sp.life*.9})`;ctx.shadowColor=`rgb(${sp.col})`;ctx.shadowBlur=6;ctx.fill();}
      ctx.shadowBlur=0;
      rafId=requestAnimationFrame(frame);
    }
    rafId=requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove",onMove);
      document.removeEventListener("click",onClick);
      window.removeEventListener("resize",resize);
      label.remove();
      document.head.removeChild(style);
    };
  },[]);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999999}} />;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{--c:#00f5ff;--p:#a855f7;--gold:#fbbf24;--red:#ff3b5c;--grn:#00ff88;--bg:#020810;--panel:rgba(0,14,30,.96);--pb:rgba(0,245,255,.1);--txt:#b0d4e8;--dim:#3a6070;}
body{background:var(--bg);color:var(--txt);font-family:'Rajdhani',sans-serif;overflow-x:hidden;}
.root{min-height:100vh;position:relative;display:flex;flex-direction:column;}
.scanlines{position:fixed;inset:0;pointer-events:none;z-index:9000;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.03) 2px,rgba(0,0,0,.03) 3px);}
.gbg{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(0,245,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,.015) 1px,transparent 1px);background-size:60px 60px;}
.nav{position:fixed;top:0;left:0;right:0;z-index:1000;display:flex;align-items:center;background:rgba(2,8,16,.98);border-bottom:1px solid rgba(0,245,255,.08);height:56px;}
.nav-logo{display:flex;align-items:center;gap:8px;padding:0 20px;border-right:1px solid rgba(0,245,255,.08);height:100%;flex-shrink:0;}
.nav-logo-txt{font-family:'Orbitron',monospace;font-size:13px;font-weight:900;color:#fff;letter-spacing:4px;text-shadow:0 0 20px var(--c);}
.nav-tabs{display:flex;height:100%;flex:1;overflow-x:auto;}
.nav-tab{font-family:'Orbitron',monospace;font-size:9px;font-weight:700;letter-spacing:2px;color:var(--dim);padding:0 18px;border:none;border-right:1px solid rgba(0,245,255,.05);background:none;height:100%;transition:all .2s;white-space:nowrap;position:relative;text-transform:uppercase;cursor:pointer;}
.nav-tab:hover{color:#fff;background:rgba(0,245,255,.03);}
.nav-tab.active{color:var(--c);background:rgba(0,245,255,.05);}
.nav-tab.active::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--c);box-shadow:0 0 8px var(--c);}
.nav-right{padding:0 16px;display:flex;align-items:center;gap:12px;margin-left:auto;border-left:1px solid rgba(0,245,255,.08);flex-shrink:0;}
.sdot{width:6px;height:6px;border-radius:50%;background:var(--grn);box-shadow:0 0 8px var(--grn);animation:blink 2s ease-in-out infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
.nav-stat{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--dim);letter-spacing:1px;}
.profile-btn{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--p),var(--c));border:2px solid rgba(0,245,255,.4);display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:'Orbitron',monospace;font-size:10px;font-weight:700;color:#fff;transition:box-shadow .2s;flex-shrink:0;}
.profile-btn:hover{box-shadow:0 0 16px rgba(0,245,255,.5);}
.main{flex:1;position:relative;z-index:10;padding-top:56px;}
.page{display:none;flex-direction:column;}
.page.active{display:flex;}

/* HOME */
.home-hero{min-height:calc(100vh - 56px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;padding:40px 24px;overflow:hidden;}
.home-hero-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
.home-eyebrow{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:6px;color:var(--dim);margin-bottom:20px;display:flex;align-items:center;gap:12px;}
.home-eyebrow::before,.home-eyebrow::after{content:'';flex:1;max-width:60px;height:1px;background:linear-gradient(90deg,transparent,var(--dim));}
.home-eyebrow::after{background:linear-gradient(90deg,var(--dim),transparent);}
.home-title{font-family:'Orbitron',monospace;font-size:clamp(52px,10vw,120px);font-weight:900;color:#fff;letter-spacing:8px;line-height:.9;text-shadow:0 0 30px rgba(0,245,255,.45),0 0 70px rgba(0,245,255,.1);animation:title-flicker 6s ease-in-out infinite;}
@keyframes title-flicker{0%,100%{text-shadow:0 0 30px rgba(0,245,255,.45),0 0 70px rgba(0,245,255,.1)}89%,92%{text-shadow:0 0 30px rgba(0,245,255,.45),0 0 70px rgba(0,245,255,.1)}90%{text-shadow:0 0 6px rgba(0,245,255,.15)}}
.home-sub{font-family:'Rajdhani',sans-serif;font-size:14px;letter-spacing:6px;color:var(--c);margin-top:14px;text-transform:uppercase;}
.home-desc{font-family:'Rajdhani',sans-serif;font-size:15px;color:var(--txt);max-width:560px;line-height:1.8;margin-top:18px;}
.home-ctas{display:flex;gap:16px;margin-top:36px;flex-wrap:wrap;justify-content:center;}
.btn-primary{font-family:'Orbitron',monospace;font-size:10px;font-weight:700;letter-spacing:3px;padding:13px 38px;background:var(--c);color:var(--bg);border:none;cursor:pointer;clip-path:polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%);transition:all .2s;box-shadow:0 0 28px rgba(0,245,255,.4);}
.btn-primary:hover{box-shadow:0 0 52px rgba(0,245,255,.8);transform:translateY(-2px);}
.btn-secondary{font-family:'Orbitron',monospace;font-size:10px;font-weight:700;letter-spacing:3px;padding:13px 38px;background:transparent;color:var(--p);border:1.5px solid rgba(168,85,247,.5);cursor:pointer;clip-path:polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%);transition:all .2s;}
.btn-secondary:hover{background:rgba(168,85,247,.08);box-shadow:0 0 24px rgba(168,85,247,.3);transform:translateY(-2px);}
.home-stats{display:flex;gap:0;margin-top:52px;border-top:1px solid rgba(0,245,255,.08);border-bottom:1px solid rgba(0,245,255,.08);width:100%;max-width:640px;}
.home-stat{flex:1;padding:20px 16px;text-align:center;border-right:1px solid rgba(0,245,255,.08);}
.home-stat:last-child{border-right:none;}
.home-stat-val{font-family:'Orbitron',monospace;font-size:30px;font-weight:700;color:var(--c);text-shadow:0 0 16px var(--c);}
.home-stat-lbl{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--dim);letter-spacing:2px;margin-top:4px;text-transform:uppercase;}
.home-features{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(0,245,255,.06);margin-top:0;width:100%;max-width:640px;}
.home-feat{background:var(--bg);padding:20px 18px;text-align:left;}
.home-feat-ico{font-size:20px;margin-bottom:8px;}
.home-feat-t{font-family:'Orbitron',monospace;font-size:9px;font-weight:700;letter-spacing:2px;color:#fff;margin-bottom:5px;text-transform:uppercase;}
.home-feat-d{font-family:'Rajdhani',sans-serif;font-size:12px;color:var(--dim);line-height:1.6;}
.home-scroll-hint{font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(0,245,255,.3);letter-spacing:3px;position:absolute;bottom:24px;left:50%;transform:translateX(-50%);animation:pulse-hint 2s ease-in-out infinite;}
@keyframes pulse-hint{0%,100%{opacity:.3}50%{opacity:.8}}
.ticker-wrap{overflow:hidden;background:rgba(0,245,255,.025);border-top:1px solid rgba(0,245,255,.06);padding:7px 0;position:relative;z-index:10;}
.ticker{display:flex;gap:40px;white-space:nowrap;animation:tick 32s linear infinite;font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--dim);letter-spacing:2px;}
@keyframes tick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.tsp{color:var(--c);}

/* DASHBOARD */
.dash-hero{padding:28px 32px 0;text-align:center;}
.dash-title{font-family:'Orbitron',monospace;font-size:clamp(22px,3vw,42px);font-weight:900;color:#fff;letter-spacing:5px;text-shadow:0 0 30px var(--c);}
.dash-sub{font-family:'Rajdhani',sans-serif;font-size:12px;letter-spacing:5px;color:var(--c);margin-top:5px;}
.stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:22px 32px 0;}
.stat-card{background:var(--panel);border:1px solid var(--pb);padding:16px 18px;position:relative;overflow:hidden;}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--c),transparent);}
.stat-ico{font-size:20px;margin-bottom:6px;}
.stat-val{font-family:'Orbitron',monospace;font-size:26px;font-weight:700;color:var(--c);text-shadow:0 0 12px var(--c);}
.stat-lbl{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--dim);letter-spacing:2px;margin-top:3px;text-transform:uppercase;}
.stat-card.purple::before{background:linear-gradient(90deg,transparent,var(--p),transparent);}
.stat-card.purple .stat-val{color:var(--p);text-shadow:0 0 12px var(--p);}
.stat-card.gold::before{background:linear-gradient(90deg,transparent,var(--gold),transparent);}
.stat-card.gold .stat-val{color:var(--gold);text-shadow:0 0 12px var(--gold);}
.stat-card.grn::before{background:linear-gradient(90deg,transparent,var(--grn),transparent);}
.stat-card.grn .stat-val{color:var(--grn);text-shadow:0 0 12px var(--grn);}
.sep{height:1px;background:linear-gradient(90deg,transparent,rgba(0,245,255,.1),transparent);margin:18px 32px;}
.panel{background:var(--panel);border:1px solid var(--pb);padding:20px;position:relative;}
.panel::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--c),transparent);opacity:.5;}
.panel-title{font-family:'Orbitron',monospace;font-size:10px;font-weight:700;letter-spacing:3px;color:var(--c);margin-bottom:14px;text-transform:uppercase;}
.panel-title.purple{color:var(--p);}
.panel-title.gold{color:var(--gold);}
.progress-bar-track{height:2px;background:rgba(0,245,255,.1);}
.progress-bar-fill{height:100%;background:linear-gradient(90deg,var(--p),var(--c));box-shadow:0 0 6px var(--c);transition:width .6s ease;}
.progress-lbl{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--dim);letter-spacing:1px;margin-top:3px;display:flex;justify-content:space-between;}

/* CARD DECK */
.card-deck-scene{min-height:calc(100vh - 56px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:40px 24px 60px;position:relative;overflow:hidden;}
.card-deck-bg{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 30%,rgba(0,245,255,.05) 0%,transparent 60%),radial-gradient(ellipse at 80% 80%,rgba(168,85,247,.04) 0%,transparent 50%);}
.card-deck-title{font-family:'Orbitron',monospace;font-size:clamp(18px,2.5vw,32px);font-weight:900;color:#fff;letter-spacing:5px;text-shadow:0 0 24px var(--c);margin-bottom:6px;text-align:center;}
.card-deck-sub{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--dim);letter-spacing:4px;margin-bottom:40px;text-align:center;}
.deck-container{position:relative;width:380px;max-width:92vw;height:520px;margin:0 auto;}
.rummy-card{position:absolute;inset:0;background:linear-gradient(160deg,rgba(0,20,45,.98) 0%,rgba(0,10,28,.99) 100%);border:1.5px solid rgba(0,245,255,.25);border-radius:18px;padding:28px 26px 22px;display:flex;flex-direction:column;transform-origin:bottom center;transition:transform .45s cubic-bezier(.34,1.56,.64,1),box-shadow .35s ease,opacity .35s;box-shadow:0 8px 40px rgba(0,0,0,.7),0 0 0 0 rgba(0,245,255,0);cursor:pointer;overflow:hidden;user-select:none;}
.rummy-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:18px 18px 0 0;background:linear-gradient(90deg,transparent,var(--c),transparent);opacity:.7;}
.rummy-card::after{content:'';position:absolute;inset:0;border-radius:18px;background:radial-gradient(ellipse at 70% 20%,rgba(0,245,255,.04) 0%,transparent 60%);pointer-events:none;}
.rummy-card.locked{border-color:rgba(255,255,255,.07);}
.rummy-card.locked::before{background:linear-gradient(90deg,transparent,rgba(58,96,112,.5),transparent);}
.rummy-card-stacked-2{transform:rotate(-4deg) translateY(16px) translateX(-10px) scale(.95);z-index:1;opacity:.7;pointer-events:none;}
.rummy-card-stacked-3{transform:rotate(3deg) translateY(28px) translateX(12px) scale(.9);z-index:0;opacity:.45;pointer-events:none;}
.rummy-card-stacked-4{transform:rotate(-2deg) translateY(38px) translateX(-6px) scale(.86);z-index:-1;opacity:.25;pointer-events:none;}
.rummy-card-active{z-index:10;transform:rotate(0deg) translateY(0) scale(1);box-shadow:0 20px 80px rgba(0,0,0,.8),0 0 40px rgba(0,245,255,.15),0 0 0 1px rgba(0,245,255,.15);}
.rummy-card-active:hover{transform:rotate(0deg) translateY(-6px) scale(1.01);box-shadow:0 28px 90px rgba(0,0,0,.85),0 0 60px rgba(0,245,255,.25),0 0 0 1.5px rgba(0,245,255,.3);}
.rummy-card-active.locked:hover{transform:none;}
.card-corner-num{font-family:'Orbitron',monospace;font-size:44px;font-weight:900;color:rgba(0,245,255,.07);position:absolute;top:14px;right:20px;line-height:1;pointer-events:none;}
.locked .card-corner-num{color:rgba(255,255,255,.04);}
.card-suit{font-size:28px;margin-bottom:10px;filter:drop-shadow(0 0 8px rgba(0,245,255,.4));}
.locked .card-suit{filter:none;opacity:.35;}
.card-ch-label{font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:3px;color:var(--c);margin-bottom:6px;text-transform:uppercase;}
.locked .card-ch-label{color:var(--dim);}
.card-title{font-family:'Orbitron',monospace;font-size:15px;font-weight:900;color:#fff;letter-spacing:2px;margin-bottom:3px;text-transform:uppercase;}
.locked .card-title{color:var(--dim);}
.card-sub{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--c);letter-spacing:2px;margin-bottom:12px;text-transform:uppercase;}
.locked .card-sub{color:var(--dim);}
.card-desc{font-family:'Rajdhani',sans-serif;font-size:13px;color:var(--txt);line-height:1.65;flex:1;}
.locked .card-desc{color:var(--dim);}
.card-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px;}
.card-tag{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:1px;color:var(--dim);border:1px solid rgba(255,255,255,.06);padding:2px 7px;border-radius:2px;}
.card-progress-section{margin-top:14px;}
.card-progress-track{height:2px;background:rgba(0,245,255,.08);}
.card-progress-fill{height:100%;background:linear-gradient(90deg,var(--p),var(--c));box-shadow:0 0 6px var(--c);transition:width .6s;}
.card-progress-lbl{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--dim);letter-spacing:1px;margin-top:3px;display:flex;justify-content:space-between;}
.card-footer{display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:12px;border-top:1px solid rgba(0,245,255,.07);}
.card-tap-hint{font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(0,245,255,.4);letter-spacing:2px;animation:pulse-hint 2s ease-in-out infinite;}
.card-deck-nav{display:flex;align-items:center;gap:20px;margin-top:32px;position:relative;z-index:20;}
.deck-nav-btn{width:44px;height:44px;background:rgba(0,14,30,.9);border:1.5px solid rgba(0,245,255,.25);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:var(--c);transition:all .25s;font-family:monospace;}
.deck-nav-btn:hover{border-color:var(--c);box-shadow:0 0 20px rgba(0,245,255,.3);transform:scale(1.08);}
.deck-nav-btn:disabled{opacity:.25;cursor:not-allowed;transform:none;box-shadow:none;}
.deck-dots{display:flex;gap:8px;align-items:center;}
.deck-dot{width:6px;height:6px;border-radius:50%;background:rgba(0,245,255,.2);transition:all .3s;cursor:pointer;}
.deck-dot.active{background:var(--c);box-shadow:0 0 8px var(--c);width:20px;border-radius:3px;}
.deck-dot.locked-dot{background:rgba(255,255,255,.08);}

/* MODAL */
.card-modal-overlay{position:fixed;inset:0;z-index:5000;background:rgba(0,0,0,.88);display:flex;align-items:flex-start;justify-content:center;padding:70px 20px 20px;overflow-y:auto;animation:fadeIn .25s ease;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.card-modal{background:linear-gradient(160deg,rgba(0,18,40,.99),rgba(0,8,22,.99));border:1.5px solid rgba(0,245,255,.22);border-radius:20px;width:100%;max-width:900px;position:relative;animation:slideUp .3s cubic-bezier(.34,1.56,.64,1);}
@keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
.card-modal::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:20px 20px 0 0;background:linear-gradient(90deg,transparent,var(--c),transparent);}
.card-modal-header{padding:28px 28px 20px;border-bottom:1px solid rgba(0,245,255,.07);display:flex;align-items:flex-start;justify-content:space-between;gap:16px;}
.card-modal-close{width:36px;height:36px;border:1px solid rgba(0,245,255,.2);border-radius:50%;background:none;color:var(--c);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;}
.card-modal-close:hover{background:rgba(0,245,255,.08);box-shadow:0 0 14px rgba(0,245,255,.3);}
.card-modal-body{padding:24px 28px;display:grid;grid-template-columns:1fr 300px;gap:20px;}
.card-modal-rounds{padding:0 28px 28px;}
.modal-section-title{font-family:'Orbitron',monospace;font-size:10px;font-weight:700;letter-spacing:3px;color:var(--c);margin-bottom:14px;text-transform:uppercase;}
.modal-section-title.purple{color:var(--p);}
.modal-section-title.gold{color:var(--gold);}
.objective-list{list-style:none;display:flex;flex-direction:column;gap:8px;}
.objective-item{display:flex;align-items:flex-start;gap:9px;font-family:'Rajdhani',sans-serif;font-size:13px;color:var(--txt);line-height:1.5;}
.objective-ico{font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--c);flex-shrink:0;margin-top:1px;}
.dataset-table{width:100%;border-collapse:collapse;}
.dataset-table td{font-family:'Share Tech Mono',monospace;font-size:9px;padding:6px 8px;border-bottom:1px solid rgba(0,245,255,.05);}
.dataset-table td:first-child{color:var(--dim);}
.dataset-table td:last-child{color:var(--txt);text-align:right;}
.output-box{background:rgba(0,0,0,.4);border:1px solid rgba(0,245,255,.08);padding:12px;font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--grn);line-height:2;letter-spacing:1px;border-radius:4px;}
.modal-round-item{background:rgba(0,0,0,.3);border:1px solid rgba(0,245,255,.08);border-radius:8px;padding:14px 16px;margin-bottom:10px;position:relative;transition:border-color .2s;}
.modal-round-item.active-round{border-color:rgba(0,245,255,.3);}
.modal-round-item.done-round{border-color:rgba(0,255,136,.25);}
.modal-round-item.locked-round{opacity:.4;}
.modal-round-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;border-radius:8px 0 0 8px;background:var(--c);}
.modal-round-item.done-round::before{background:var(--grn);}
.modal-round-item.locked-round::before{background:var(--dim);}
.modal-round-header{display:flex;align-items:center;gap:10px;margin-bottom:8px;}
.modal-round-num{font-family:'Orbitron',monospace;font-size:16px;font-weight:900;color:rgba(0,245,255,.18);width:28px;flex-shrink:0;}
.active-round .modal-round-num{color:var(--c);}
.done-round .modal-round-num{color:var(--grn);}
.modal-round-name{font-family:'Orbitron',monospace;font-size:10px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;}
.modal-round-desc{font-family:'Rajdhani',sans-serif;font-size:12px;color:var(--txt);line-height:1.5;margin-bottom:10px;}
.upload-zone{border:1px dashed rgba(0,245,255,.22);padding:12px;text-align:center;background:rgba(0,0,0,.3);transition:all .22s;cursor:pointer;position:relative;border-radius:4px;}
.upload-zone:hover{border-color:rgba(0,245,255,.55);background:rgba(0,245,255,.02);}
.upload-zone.uploaded{border-color:rgba(0,255,136,.4);background:rgba(0,255,136,.02);}
.upload-zone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;}
.upload-ico{font-size:16px;margin-bottom:4px;}
.upload-txt{font-family:'Share Tech Mono',monospace;font-size:7px;color:var(--dim);letter-spacing:2px;}
.upload-txt.done{color:var(--grn);}
.upload-fname{font-family:'Share Tech Mono',monospace;font-size:7px;color:var(--grn);margin-top:2px;word-break:break-all;}
.pts-val-mini{font-family:'Orbitron',monospace;font-size:18px;font-weight:700;color:var(--gold);text-shadow:0 0 10px var(--gold);}
.pts-lbl-mini{font-family:'Share Tech Mono',monospace;font-size:7px;color:var(--dim);letter-spacing:1.5px;text-transform:uppercase;}
.round-submit-btn{font-family:'Orbitron',monospace;font-size:8px;font-weight:700;letter-spacing:1.5px;padding:7px 14px;background:var(--c);color:var(--bg);border:none;cursor:pointer;clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%);transition:all .2s;margin-top:6px;width:100%;}
.round-submit-btn:hover{box-shadow:0 0 16px rgba(0,245,255,.4);}
.round-submit-btn:disabled{background:rgba(0,245,255,.1);color:var(--dim);cursor:not-allowed;box-shadow:none;clip-path:none;}
.round-submit-btn.done-btn{background:rgba(0,255,136,.1);color:var(--grn);clip-path:none;}
.chip{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:2px;padding:2px 8px;border:1px solid rgba(0,245,255,.2);color:var(--c);border-radius:2px;}
.chip.grn{color:var(--grn);border-color:rgba(0,255,136,.3);}
.submission-policy{display:flex;align-items:flex-start;gap:6px;padding:6px 8px;margin-bottom:7px;background:rgba(0,245,255,.04);border:1px solid rgba(0,245,255,.12);border-radius:4px;}
.submission-policy.warn{background:rgba(251,191,36,.04);border-color:rgba(251,191,36,.2);}
.sp-label{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:1.5px;color:var(--c);}
.sp-label.warn{color:var(--gold);}
.sp-desc{font-family:'Share Tech Mono',monospace;font-size:6.5px;color:var(--dim);letter-spacing:.8px;line-height:1.8;margin-top:1px;}

/* LEADERBOARD */
.lb-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid rgba(0,245,255,.05);transition:background .2s;}
.lb-row:last-child{border-bottom:none;}
.lb-row:hover{background:rgba(0,245,255,.03);}
.lb-row.you{background:rgba(0,245,255,.05);border:1px solid rgba(0,245,255,.15);border-radius:4px;margin:2px 0;}
.lb-rank{font-family:'Orbitron',monospace;font-size:13px;font-weight:700;width:28px;flex-shrink:0;text-align:center;}
.lb-rank.r1{color:var(--gold);text-shadow:0 0 10px var(--gold);}
.lb-rank.r2{color:#b0c4d8;}
.lb-rank.r3{color:#cd7f32;}
.lb-rank.rn{color:var(--dim);}
.lb-avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Orbitron',monospace;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;}
.lb-name{flex:1;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;color:var(--txt);}
.lb-xp{font-family:'Orbitron',monospace;font-size:11px;color:var(--c);text-shadow:0 0 8px var(--c);}
.lb-badge{font-family:'Share Tech Mono',monospace;font-size:6px;letter-spacing:1.5px;padding:2px 6px;border-radius:2px;flex-shrink:0;}

/* PROFILE */
.profile-card{background:var(--panel);border:1px solid var(--pb);padding:28px;text-align:center;position:relative;overflow:hidden;}
.profile-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--p),transparent);}
.avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--p),var(--c));border:3px solid rgba(0,245,255,.4);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-family:'Orbitron',monospace;font-size:22px;font-weight:900;color:#fff;position:relative;}
.avatar::after{content:'';position:absolute;inset:-6px;border-radius:50%;border:1px solid rgba(0,245,255,.2);animation:spin-ring 8s linear infinite;}
@keyframes spin-ring{to{transform:rotate(360deg);}}
.profile-name{font-family:'Orbitron',monospace;font-size:16px;font-weight:700;color:#fff;letter-spacing:3px;}
.profile-rank{font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--p);letter-spacing:3px;margin-top:5px;text-transform:uppercase;}
.profile-id{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--dim);letter-spacing:2px;margin-top:3px;}
.profile-divider{height:1px;background:rgba(0,245,255,.08);margin:16px 0;}
.profile-stat-row{display:flex;justify-content:space-around;margin-top:14px;}
.pstat{text-align:center;}
.pstat-val{font-family:'Orbitron',monospace;font-size:18px;font-weight:700;color:var(--c);}
.pstat-lbl{font-family:'Share Tech Mono',monospace;font-size:7px;color:var(--dim);letter-spacing:1px;margin-top:2px;text-transform:uppercase;}
.profile-badge-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:14px;}
.pbadge{font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:2px;padding:3px 9px;border:1px solid rgba(0,245,255,.2);color:var(--c);}
.pbadge.gold{color:var(--gold);border-color:rgba(251,191,36,.3);}
.pbadge.purple{color:var(--p);border-color:rgba(168,85,247,.3);}
.pbadge.grn{color:var(--grn);border-color:rgba(0,255,136,.3);}
.activity-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(0,245,255,.05);font-family:'Share Tech Mono',monospace;font-size:9px;}
.activity-row span:first-child{color:var(--txt);}
.activity-row span:last-child{color:var(--dim);}
.resource-item{display:flex;align-items:center;gap:10px;padding:9px 12px;background:rgba(0,0,0,.28);border:1px solid rgba(0,245,255,.06);cursor:pointer;transition:all .2s;margin-bottom:6px;}
.resource-item:hover{border-color:rgba(0,245,255,.22);background:rgba(0,245,255,.02);}
.resource-name{font-family:'Rajdhani',sans-serif;font-size:13px;color:var(--txt);font-weight:500;}
.resource-tag{font-family:'Share Tech Mono',monospace;font-size:8px;color:var(--dim);letter-spacing:1px;margin-top:1px;}
`;

// ─── Data (no mock values) ───────────────────────────────────────────────────

// ─── Clock ───────────────────────────────────────────────────────────────────
function HudClock() {
  const [t,setT] = useState("");
  useEffect(()=>{
    const tick=()=>{const n=new Date();setT([n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,"0")).join(":"));};
    tick();const id=setInterval(tick,1000);return()=>clearInterval(id);
  },[]);
  return <>{t}</>;
}

// ─── Card Deck ───────────────────────────────────────────────────────────────
function CardDeck({challenges,onOpen}) {
  const [active,setActive]=useState(0);
  const go=dir=>setActive(a=>Math.max(0,Math.min(challenges.length-1,a+dir)));
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%"}}>
      <div className="deck-container">
        {challenges.map((ch,i)=>{
          const offset=i-active;
          if(offset<0||offset>3) return null;
          let cls="rummy-card";
          if(ch.status==="locked") cls+=" locked";
          if(offset===0) cls+=" rummy-card-active";
          else if(offset===1) cls+=" rummy-card-stacked-2";
          else if(offset===2) cls+=" rummy-card-stacked-3";
          else cls+=" rummy-card-stacked-4";
          const accent=ch.id===1?"var(--c)":ch.id===2?"var(--p)":ch.id===3?"var(--gold)":"var(--grn)";
          return (
            <div key={ch.id} className={cls} style={{zIndex:10-offset}}
              onClick={()=>{if(offset===0&&ch.status!=="locked") onOpen(ch);}}>
              <div className="card-corner-num">{ch.num}</div>
              <div className="card-suit" style={{color:ch.status==="locked"?"var(--dim)":accent}}>{ch.suit}</div>
              <div className="card-ch-label">CHALLENGE {ch.num}</div>
              <div className="card-title">{ch.title}</div>
              <div className="card-sub">{ch.sub}</div>
              {offset===0&&<>
                <div className="card-desc">{ch.desc}</div>
                <div className="card-tags">{ch.tags.map(t=><span key={t} className="card-tag">{t}</span>)}</div>
                <div className="card-footer">
                  <span className="card-tap-hint">{ch.status==="locked"?"🔒 LOCKED":"▸ TAP TO OPEN"}</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"var(--dim)",letterSpacing:2}}>{ch.rounds.length} ROUND{ch.rounds.length>1?"S":""}</span>
                </div>
              </>}
            </div>
          );
        })}
      </div>
      <div className="card-deck-nav">
        <button className="deck-nav-btn" onClick={()=>go(-1)} disabled={active===0}>←</button>
        <div className="deck-dots">
          {challenges.map((ch,i)=>(
            <div key={ch.id} className={`deck-dot${i===active?" active":""}${ch.status==="locked"?" locked-dot":""}`} onClick={()=>setActive(i)}/>
          ))}
        </div>
        <button className="deck-nav-btn" onClick={()=>go(1)} disabled={active===challenges.length-1}>→</button>
      </div>
    </div>
  );
}

// ─── Challenge Modal ──────────────────────────────────────────────────────────
function ChallengeModal({ch,ALL_ROUNDS,userId,uploads,setUploads,submitted,setSubmitted,submissionCounts,setSubmissionCounts,onClose}) {
  const rounds=ALL_ROUNDS.filter(r=>ch.rounds.includes(r.id));
  const completedRounds=rounds.filter(r=>submitted[r.id]).length;
  const progress=rounds.length>0?Math.round((completedRounds/rounds.length)*100):0;
  return (
    <div className="card-modal-overlay" onClick={e=>{if(e.target.className==="card-modal-overlay")onClose();}}>
      <div className="card-modal">
        <div className="card-modal-header">
          <div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,letterSpacing:3,color:"var(--c)",marginBottom:5}}>CHALLENGE {ch.num} · {ch.status==="active"?"ACTIVE":"LOCKED"}</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:"#fff",letterSpacing:3,textTransform:"uppercase"}}>{ch.title}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"var(--c)",letterSpacing:2,marginTop:3,textTransform:"uppercase"}}>{ch.sub}</div>
          </div>
          <button className="card-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="card-modal-body">
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <div className="modal-section-title">OBJECTIVES</div>
              <p style={{fontFamily:"'Rajdhani',sans-serif",fontSize:13,color:"var(--txt)",lineHeight:1.7,marginBottom:12}}>{ch.desc}</p>
              <ul className="objective-list">
                {ch.objectives.map((o,i)=>(
                  <li key={i} className="objective-item"><span className="objective-ico">▸</span><span>{o}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="modal-section-title" style={{marginBottom:8}}>EXPECTED OUTPUT</div>
              <div className="output-box">{ch.output.map((f,i)=><div key={i}>▸ {f}</div>)}</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <div className="modal-section-title purple">DATASET INFO</div>
              <div style={{background:"rgba(0,0,0,.3)",border:"1px solid rgba(0,245,255,.07)",borderRadius:4,overflow:"hidden"}}>
                <table className="dataset-table">
                  {Object.entries(ch.dataset).map(([k,v])=><tr key={k}><td>{k}</td><td>{v}</td></tr>)}
                </table>
              </div>
            </div>
            <div>
              <div className="modal-section-title" style={{marginBottom:8}}>PROGRESS</div>
              <div style={{background:"rgba(0,0,0,.3)",border:"1px solid rgba(0,245,255,.07)",borderRadius:4,padding:12}}>
                <div className="card-progress-track"><div className="card-progress-fill" style={{width:progress+"%"}}/></div>
                <div className="card-progress-lbl"><span>COMPLETION</span><span>{progress}%</span></div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"var(--dim)",letterSpacing:1.5,marginTop:10}}>{completedRounds} / {rounds.length} ROUNDS DONE</div>
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {ch.tags.map(t=>(
                <span key={t} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,letterSpacing:1,color:"var(--dim)",border:"1px solid rgba(255,255,255,.06)",padding:"2px 7px",borderRadius:2}}>{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="card-modal-rounds">
          <div className="modal-section-title gold">ROUNDS FOR THIS CHALLENGE</div>
          {rounds.map((r,ri)=>{
            const prevDone=ri===0||(rounds[ri-1]&&submitted[rounds[ri-1].id]);
            const isLocked=!prevDone;
            const isDone=submitted[r.id];
            const hasUpload=uploads[r.id];
            const subCount=submissionCounts[r.id]||0;
            const maxSubs=r.id===1?3:1;
            const subsLeft=maxSubs-subCount;
            const subLimitReached=subCount>=maxSubs;
            let roundCls="modal-round-item";
            if(isDone) roundCls+=" done-round";
            else if(isLocked) roundCls+=" locked-round";
            else roundCls+=" active-round";
            return (
              <div key={r.id} className={roundCls}>
                <div className="modal-round-header">
                  <div className="modal-round-num">{String(r.id).padStart(2,"0")}</div>
                  <div style={{flex:1}}><div className="modal-round-name">{r.name}</div></div>
                  <span className={`chip${isDone?" grn":""}`}>{isDone?"✓ DONE":isLocked?"🔒 LOCKED":"● OPEN"}</span>
                  <div style={{marginLeft:8,textAlign:"center",minWidth:48}}>
                    <div className="pts-val-mini">{r.pts}</div>
                    <div className="pts-lbl-mini">XP</div>
                  </div>
                </div>
                {!isLocked&&<>
                  <div className="modal-round-desc">{r.desc}</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"var(--dim)",letterSpacing:2,marginBottom:7}}>ACCEPTS: {r.accepts}</div>
                  <div className={`submission-policy${r.id===1?" warn":""}`}>
                    <span style={{fontSize:11,flexShrink:0}}>{r.id===1?"⚠️":"ℹ️"}</span>
                    <div>
                      <div className={`sp-label${r.id===1?" warn":""}`}>
                        {r.id===1?`3 SUBMISSIONS ALLOWED · ${Math.max(0,subsLeft)} REMAINING`:"ONLY 1 SUBMISSION ALLOWED"}
                      </div>
                      <div className="sp-desc">
                        {subLimitReached?r.id===1?"✖ ALL SUBMISSION ATTEMPTS USED":"✖ ALREADY SUBMITTED":"Once submitted, the file is final and cannot be edited."}
                      </div>
                    </div>
                  </div>
                  {!subLimitReached&&(
                    <div className={`upload-zone${isDone?" uploaded":""}`}>
                      {!isDone&&<input type="file" accept={r.accepts} onChange={e=>{if(!e.target.files[0])return;setUploads(p=>({...p,[r.id]:e.target.files[0].name}));}}/>}
                      <div className="upload-ico">{isDone?"✅":hasUpload?"📎":"⬆"}</div>
                      <div className={`upload-txt${isDone||hasUpload?" done":""}`}>{isDone?"SUBMITTED":hasUpload?"FILE READY":"DRAG & DROP OR CLICK"}</div>
                      {!isDone && !hasUpload && <div style={{fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 4}}>.csv max 100KB · .ipynb max 2MB</div>}
                      {hasUpload&&!isDone&&<div className="upload-fname">📄 {uploads[r.id]}</div>}
                    </div>
                  )}
                  <button className={`round-submit-btn${isDone&&subLimitReached?" done-btn":""}`}
                    disabled={!hasUpload||subLimitReached}
                    onClick={async ()=>{
                      const next=subCount+1;
                      const formData = new FormData();
                      formData.append("user_id", userId);
                      // Provide dummy blob if file isn't available
                      const dummyBlob = new Blob(["dummy content"], { type: "text/plain" });
                      formData.append("file", dummyBlob, uploads[r.id] || "code.py");
                      
                      try {
                        const res = await fetch(`http://localhost:8000/rounds/${r.id}/submit`, {
                          method: "POST",
                          body: formData
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setSubmissionCounts(p=>({...p,[r.id]:data.attempt}));
                          setUploads(p=>({...p,[r.id]:null}));
                          if (data.status === "accepted") setSubmitted(p=>({...p,[r.id]:true}));
                        } else {
                          alert(data.detail || "Submission failed");
                        }
                      } catch (err) {
                        alert("Network error: " + err);
                      }
                    }}>
                    {subLimitReached?r.id===1?"✓ ALL 3 SUBMISSIONS USED":"✓ SUBMITTED":hasUpload?r.id===1?`→ SUBMIT (${subCount+1}/${maxSubs})`:"→ SUBMIT CODE":"UPLOAD FILE FIRST"}
                  </button>
                  {r.id===1&&subCount>0&&(
                    <div style={{display:"flex",gap:4,marginTop:6}}>
                      {Array.from({length:maxSubs}).map((_,si)=>(
                        <div key={si} style={{flex:1,height:2,background:si<subCount?"var(--gold)":"rgba(255,255,255,.07)",boxShadow:si<subCount?"0 0 5px rgba(251,191,36,.4)":"none",transition:"background .3s"}}/>
                      ))}
                    </div>
                  )}
                </>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── XP Bar Chart ─────────────────────────────────────────────────────────────
function XPBarChart({submitted, ALL_ROUNDS}) {
  if (!ALL_ROUNDS || ALL_ROUNDS.length === 0) return null;
  const maxPts=Math.max(...ALL_ROUNDS.map(r=>r.pts));
  const barH=120;
  return (
    <svg viewBox={`0 0 ${ALL_ROUNDS.length*46+10} ${barH+36}`} style={{width:"100%",display:"block"}}>
      <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00f5ff" stopOpacity=".9"/><stop offset="100%" stopColor="#0047aa" stopOpacity=".6"/></linearGradient></defs>
      {ALL_ROUNDS.map((r,i)=>{
        const done=submitted[r.id];
        const h=Math.round((r.pts/maxPts)*barH);
        const x=i*46+14,y=barH-h;
        return (
          <g key={r.id}>
            {done&&<rect x={x} y={y} width={28} height={h} rx={2} fill="rgba(0,245,255,.08)" style={{filter:"blur(4px)"}}/>}
            <rect x={x} y={done?y:barH-4} width={28} height={done?h:4} rx={2} fill={done?"url(#barGrad)":"rgba(0,245,255,.14)"} stroke={done?"rgba(0,245,255,.5)":"rgba(0,245,255,.2)"} strokeWidth=".7"/>
            {done&&<rect x={x} y={y} width={28} height={2} rx={1} fill="rgba(0,245,255,.9)"/>}
            <text x={x+14} y={barH+12} textAnchor="middle" fill="rgba(0,245,255,.4)" fontSize="7" fontFamily="'Share Tech Mono',monospace">R{r.id}</text>
            {done&&<text x={x+14} y={y-4} textAnchor="middle" fill="#00f5ff" fontSize="6.5" fontFamily="'Orbitron',monospace">{r.pts}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState("home");
  const [openChallenge,setOpenChallenge]=useState(null);
  const [uploads,setUploads]=useState({});
  const [submitted,setSubmitted]=useState({});
  const [submissionCounts,setSubmissionCounts]=useState({});
  
  const [CHALLENGES, setChallenges] = useState([]);
  const [ALL_ROUNDS, setAllRounds] = useState([]);
  const [TOTAL_XP, setTotalXP] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const userId = localStorage.getItem("imperium_user_id");

  useEffect(() => {
    async function loadData() {
      try {
        const [chRes, rRes] = await Promise.all([
          fetch("http://localhost:8000/challenges"),
          fetch("http://localhost:8000/rounds")
        ]);
        const chData = await chRes.json();
        const rData = await rRes.json();
        setChallenges(chData);
        setAllRounds(rData);
        setTotalXP(rData.reduce((a,r) => a + r.pts, 0));
        
        if (userId) {
          const uRes = await fetch(`http://localhost:8000/users/${userId}`);
          if (uRes.ok) {
            const uData = await uRes.json();
            setUserProfile(uData);
          }
          
          const subsRes = await fetch(`http://localhost:8000/users/${userId}/submissions`);
          if (subsRes.ok) {
            const subsData = await subsRes.json();
            const newSubCounts = {};
            const newSubmitted = {};
            subsData.forEach(s => {
              if (!newSubCounts[s.round_id] || s.attempt > newSubCounts[s.round_id]) {
                newSubCounts[s.round_id] = s.attempt;
              }
              if (s.status === "accepted") newSubmitted[s.round_id] = true;
            });
            setSubmissionCounts(newSubCounts);
            setSubmitted(newSubmitted);
          }
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    loadData();
  }, [userId]);

  useEffect(()=>{
    const s=document.createElement("style");s.textContent=CSS;document.head.appendChild(s);
    return()=>document.head.removeChild(s);
  },[]);

  const earnedXP=ALL_ROUNDS.filter(r=>submitted[r.id]).reduce((a,r)=>a+r.pts,0);
  const completedRounds=Object.keys(submitted).length;

  // Dynamic challenge progress based on submissions
  const getChallengeProgress=(ch)=>{
    const rounds=ALL_ROUNDS.filter(r=>ch.rounds.includes(r.id));
    const done=rounds.filter(r=>submitted[r.id]).length;
    return rounds.length>0?Math.round((done/rounds.length)*100):0;
  };

  const dynamicChallenges = CHALLENGES.map((ch, i) => {
    if (i === 0) return { ...ch, status: "active" };
    const prevCh = CHALLENGES[i - 1];
    const prevProg = getChallengeProgress(prevCh);
    return { ...ch, status: prevProg === 100 ? "active" : "locked" };
  });

  const go=t=>{setTab(t);window.scrollTo&&window.scrollTo({top:0});};
  const TABS=[["home","⬡ HOME"],["dashboard","◈ DASHBOARD"],["tutorials","◎ TUTORIALS"],["challenges","▲ CHALLENGES"],["profile","◉ PROFILE"],["results","🏆 RESULTS"]];

  return (
    <div className="root">
      <Cursor/>
      <style>{CSS}</style>
      <div className="scanlines"/>
      <div className="gbg"/>

      {openChallenge&&(
        <ChallengeModal ch={openChallenge} ALL_ROUNDS={ALL_ROUNDS} userId={userId} uploads={uploads} setUploads={setUploads}
          submitted={submitted} setSubmitted={setSubmitted}
          submissionCounts={submissionCounts} setSubmissionCounts={setSubmissionCounts}
          onClose={()=>setOpenChallenge(null)}/>
      )}

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <svg viewBox="0 0 28 28" fill="none" style={{width:22,height:22}}>
            <path d="M14 3L17 11L24 6L21 17H7L4 6L11 11L14 3Z" stroke="#00f5ff" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
            <rect x="7" y="19" width="14" height="3.5" rx="1" fill="rgba(0,245,255,.2)" stroke="#00f5ff" strokeWidth="0.9"/>
          </svg>
          <span className="nav-logo-txt">IMPERIUM</span>
        </div>
        <div className="nav-tabs">
          {TABS.map(([id,lbl])=>(
            <button key={id} className={`nav-tab${tab===id?" active":""}`} onClick={()=>go(id)}>{lbl}</button>
          ))}
        </div>
        <div className="nav-right">
          <div className="sdot"/>
          <span className="nav-stat"><HudClock/></span>
          <span className="nav-stat" style={{color:"var(--c)"}}>XP: {earnedXP}</span>
          <div className="profile-btn" onClick={()=>go("profile")}>ME</div>
        </div>
      </nav>

      <div className="main">

        {/* ── HOME ── */}
        <div className={`page${tab==="home"?" active":""}`}>
          <div className="home-hero">
            <div className="home-hero-bg">
              <canvas ref={el=>{
                if(!el||el._init)return;el._init=true;
                const W=()=>{el.width=el.offsetWidth||window.innerWidth;};const H=()=>{el.height=el.offsetHeight||window.innerHeight;};W();H();window.addEventListener('resize',()=>{W();H();});
                const ctx=el.getContext('2d');
                const pts=Array.from({length:60},()=>({x:Math.random()*1400,y:Math.random()*700,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.5+.5,col:['#00f5ff','#a855f7','#00ff88'][Math.floor(Math.random()*3)],pulse:Math.random()*Math.PI*2}));
                let scanY=100,scanDir=1,t=0;
                function drawGrid(){const vp={x:el.width/2,y:el.height*.62};for(let i=0;i<18;i++){const y=vp.y+i*20,a=.18-i*.009;if(a<=0)break;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(el.width,y);ctx.strokeStyle=`rgba(0,245,255,${a})`;ctx.lineWidth=.5;ctx.stroke();}for(let i=-14;i<=14;i++){ctx.beginPath();ctx.moveTo(vp.x+i*55,vp.y);ctx.lineTo(vp.x+i*200,el.height+80);ctx.strokeStyle='rgba(0,245,255,0.12)';ctx.lineWidth=.5;ctx.stroke();}const cy=el.height*.18;for(let i=0;i<10;i++){ctx.beginPath();ctx.moveTo(0,cy-i*14);ctx.lineTo(el.width,cy-i*14);ctx.strokeStyle=`rgba(168,85,247,${.08+i*.015})`;ctx.lineWidth=.4;ctx.stroke();}}
                function drawHolotable(){const cx=el.width/2,ty=el.height*.7;ctx.beginPath();ctx.ellipse(cx,ty,200,22,0,0,Math.PI*2);ctx.strokeStyle='rgba(0,245,255,0.35)';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='rgba(0,245,255,0.03)';ctx.fill();for(let i=0;i<7;i++){const phase=(t*.6+i*.22)%1,ry=ty-20-phase*200,rx=35+i*14,alpha=phase<.7?phase/.7*.25:(1-phase)/.3*.25;ctx.beginPath();ctx.ellipse(cx,ry,rx,rx*.25,0,0,Math.PI*2);ctx.strokeStyle=i%2===0?`rgba(0,245,255,${alpha})`:`rgba(168,85,247,${alpha})`;ctx.lineWidth=.8;ctx.stroke();}const bA=.12+Math.sin(t*2)*.05,bG=ctx.createLinearGradient(cx,ty-220,cx,ty);bG.addColorStop(0,'rgba(0,245,255,0)');bG.addColorStop(.5,`rgba(0,245,255,${bA})`);bG.addColorStop(1,'rgba(0,245,255,0.02)');ctx.beginPath();ctx.moveTo(cx-18,ty);ctx.lineTo(cx+18,ty);ctx.lineTo(cx+4,ty-220);ctx.lineTo(cx-4,ty-220);ctx.closePath();ctx.fillStyle=bG;ctx.fill();}
                function drawScan(){scanY+=scanDir*1.2;if(scanY>el.height*.75)scanDir=-1;if(scanY<el.height*.08)scanDir=1;ctx.beginPath();ctx.moveTo(0,scanY);ctx.lineTo(el.width,scanY);ctx.strokeStyle='rgba(0,245,255,0.06)';ctx.lineWidth=40;ctx.stroke();ctx.beginPath();ctx.moveTo(0,scanY);ctx.lineTo(el.width,scanY);ctx.strokeStyle='rgba(0,245,255,0.18)';ctx.lineWidth=1;ctx.stroke();}
                function drawPts(){pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.pulse+=.04;if(p.x<0)p.x=el.width;if(p.x>el.width)p.x=0;if(p.y<0)p.y=el.height;if(p.y>el.height)p.y=0;const a=.3+Math.sin(p.pulse)*.25;const cM={'#00f5ff':`rgba(0,245,255,${a})`,'#a855f7':`rgba(168,85,247,${a})`,'#00ff88':`rgba(0,255,136,${a})`};ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=cM[p.col]||`rgba(0,245,255,${a})`;ctx.shadowColor=p.col;ctx.shadowBlur=4;ctx.fill();});}
                function loop(){ctx.clearRect(0,0,el.width,el.height);drawGrid();drawScan();drawHolotable();drawPts();t+=.016;el._raf=requestAnimationFrame(loop);}loop();
              }} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.85}}/>
            </div>
            <div className="home-eyebrow">ATHERA PRESENTS</div>
            <img src="/imperium-logo.png" alt="IMPERIUM" style={{width: "100%", maxWidth: 800, display: "block", margin: "-35px auto -35px", filter: "drop-shadow(0 0 30px rgba(0,245,255,0.45))", position: "relative", zIndex: 10}} />
            <div className="home-sub">— AN IMMERSIVE AI CHALLENGE EXPERIENCE —</div>
            <p className="home-desc">Solve real-world healthcare AI problems across 4 progressive challenges and 7 competitive rounds. Build, train, evaluate and deploy your ML model.</p>
            <div className="home-ctas">
              <button className="btn-primary" onClick={()=>go("challenges")}>→ VIEW CHALLENGES</button>
              <button className="btn-secondary" onClick={()=>go("tutorials")}>◎ SEE TUTORIALS</button>
            </div>
            <div className="home-stats">
              {[["04","CHALLENGES"],["07","ROUNDS"],[TOTAL_XP,"XP POOL"]].map(([v,l])=>(
                <div key={l} className="home-stat"><div className="home-stat-val">{v}</div><div className="home-stat-lbl">{l}</div></div>
              ))}
            </div>
            <div className="home-features" style={{marginTop:1}}>
              {[["⬡","DATA PIPELINE","Collect, clean & structure datasets"],
                ["◈","MODEL TRAINING","Engineer features, tune hyperparameters"],
                ["▶","DEPLOYMENT","Package as a FastAPI service with SHAP explainability"]].map(([ico,t,d])=>(
                <div key={t} className="home-feat"><div className="home-feat-ico">{ico}</div><div className="home-feat-t">{t}</div><div className="home-feat-d">{d}</div></div>
              ))}
            </div>
            <div className="home-scroll-hint">▼ SCROLL TO EXPLORE ▼</div>
          </div>
          <div className="ticker-wrap">
            <div className="ticker">
              {["⚡ IMPERIUM CHALLENGE IS LIVE","CHALLENGE 1 NOW OPEN","SUBMIT ROUND CODE TO EARN XP","FINAL SUBMISSION: .IPYNB FILE","HEALTHCARE AI",
                "⚡ IMPERIUM CHALLENGE IS LIVE","CHALLENGE 1 NOW OPEN","SUBMIT ROUND CODE TO EARN XP","FINAL SUBMISSION: .IPYNB FILE","HEALTHCARE AI"].map((t,i)=>(
                <span key={i}>{t}<span className="tsp"> ///</span></span>
              ))}
            </div>
          </div>
        </div>

        {/* ── DASHBOARD ── */}
        <div className={`page${tab==="dashboard"?" active":""}`}>
          <div className="dash-hero">
            <div className="dash-title">CONTROL CENTER</div>
            <div className="dash-sub">— IMPERIUM MISSION DASHBOARD —</div>
          </div>
          <div className="stat-row">
            <div className="stat-card"><div className="stat-ico">⬡</div><div className="stat-val">04</div><div className="stat-lbl">Challenges</div></div>
            <div className="stat-card purple"><div className="stat-ico">▶</div><div className="stat-val">07</div><div className="stat-lbl">Rounds</div></div>
            <div className="stat-card gold"><div className="stat-ico">◈</div><div className="stat-val">{completedRounds}</div><div className="stat-lbl">Completed</div></div>
            <div className="stat-card grn"><div className="stat-ico">⬢</div><div className="stat-val">{earnedXP}</div><div className="stat-lbl">XP Earned</div></div>
          </div>
          <div className="sep"/>

          {/* Pipeline */}
          <div style={{padding:"0 32px",marginBottom:20}}>
            <div className="panel">
              <div className="panel-title">CHALLENGE PIPELINE</div>
              <div style={{display:"flex",alignItems:"stretch",gap:0,overflowX:"auto",paddingBottom:4}}>
                {dynamicChallenges.map((ch,ci)=>{
                  const chRounds=ALL_ROUNDS.filter(r=>ch.rounds.includes(r.id));
                  const prog=getChallengeProgress(ch);
                  const accent=ch.id===1?"var(--c)":ch.id===2?"var(--p)":ch.id===3?"var(--gold)":"var(--grn)";
                  const accentRgb=ch.id===1?"0,245,255":ch.id===2?"168,85,247":ch.id===3?"251,191,36":"0,255,136";
                  return (
                    <div key={ch.id} style={{display:"flex",alignItems:"center",flex:1,minWidth:0}}>
                      <div style={{flex:1,background:"rgba(0,0,0,.35)",border:`1px solid ${ch.status==="locked"?"rgba(255,255,255,.06)":`rgba(${accentRgb},.2)`}`,borderRadius:8,padding:"14px 14px 12px",position:"relative",overflow:"hidden",cursor:ch.status!=="locked"?"pointer":"default",transition:"border-color .2s"}}
                        onClick={()=>ch.status!=="locked"&&setOpenChallenge(ch)}>
                        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${accent},transparent)`,opacity:ch.status==="locked"?.3:1}}/>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                          <span style={{fontSize:16,filter:ch.status==="locked"?"grayscale(1) opacity(.4)":"none"}}>{ch.suit}</span>
                          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,letterSpacing:2,color:ch.status==="locked"?"var(--dim)":accent,textTransform:"uppercase"}}>CH.{ch.num}</span>
                          <span style={{marginLeft:"auto",fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:ch.status==="locked"?"var(--dim)":prog===100?"var(--grn)":prog>0?"var(--c)":"var(--dim)",letterSpacing:1}}>{ch.status==="locked"?"🔒":prog+"%"}</span>
                        </div>
                        <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,fontWeight:700,color:ch.status==="locked"?"var(--dim)":"#fff",letterSpacing:1.5,marginBottom:3,textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ch.title}</div>
                        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:ch.status==="locked"?"rgba(58,96,112,.5)":accent,letterSpacing:1.5,marginBottom:10,textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ch.sub}</div>
                        <div style={{height:2,background:"rgba(255,255,255,.05)",borderRadius:1,marginBottom:8}}>
                          <div style={{height:"100%",width:prog+"%",background:ch.status==="locked"?"rgba(58,96,112,.4)":accent,borderRadius:1,boxShadow:ch.status!=="locked"?`0 0 6px ${accent}`:"none",transition:"width .6s"}}/>
                        </div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          {chRounds.map(r=>(
                            <div key={r.id} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6.5,letterSpacing:1,padding:"2px 6px",borderRadius:2,border:`1px solid ${submitted[r.id]?"rgba(0,255,136,.35)":ch.status==="locked"?"rgba(255,255,255,.05)":"rgba(0,245,255,.15)"}`,color:submitted[r.id]?"var(--grn)":ch.status==="locked"?"rgba(58,96,112,.6)":"var(--dim)",background:submitted[r.id]?"rgba(0,255,136,.04)":"transparent"}}>
                              {submitted[r.id]?"✓ ":""}R{r.id}
                            </div>
                          ))}
                        </div>
                      </div>
                      {ci<dynamicChallenges.length-1&&(
                        <div style={{flexShrink:0,width:36,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"0 2px"}}>
                          <div style={{width:"100%",height:1,background:"rgba(0,245,255,.15)"}}/>
                          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(0,245,255,.25)"}}>→</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row: XP chart + challenge progress */}
          <div style={{padding:"0 32px",display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:20}}>
            <div className="panel">
              <div className="panel-title">XP EARNED PER ROUND</div>
              <XPBarChart submitted={submitted} ALL_ROUNDS={ALL_ROUNDS}/>
              <div style={{display:"flex",gap:16,marginTop:10}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,background:"var(--c)",borderRadius:1}}/><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"var(--dim)",letterSpacing:2}}>COMPLETED</span></div>
                <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,background:"rgba(0,245,255,.15)",border:"1px solid rgba(0,245,255,.2)",borderRadius:1}}/><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"var(--dim)",letterSpacing:2}}>PENDING</span></div>
              </div>
            </div>
            <div className="panel">
              <div className="panel-title purple">CHALLENGE PROGRESS</div>
              {dynamicChallenges.map(ch=>{
                const prog=getChallengeProgress(ch);
                return (
                  <div key={ch.id} style={{marginBottom:16,cursor:ch.status!=="locked"?"pointer":"default"}} onClick={()=>{if(ch.status!=="locked")setOpenChallenge(ch);}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:ch.status==="locked"?"var(--dim)":"var(--txt)",letterSpacing:1.5,textTransform:"uppercase"}}>{ch.suit} {ch.title}</span>
                      <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:prog===0?"var(--dim)":prog===100?"var(--grn)":"var(--c)",minWidth:32,textAlign:"right"}}>{prog}%</span>
                    </div>
                    <div className="card-progress-track" style={{height:3}}><div className="card-progress-fill" style={{width:prog+"%"}}/></div>
                  </div>
                );
              })}
              <div style={{marginTop:8,background:"rgba(0,0,0,.35)",border:"1px solid rgba(0,245,255,.1)",padding:"18px 14px",textAlign:"center"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"var(--dim)",letterSpacing:3,marginBottom:8,textTransform:"uppercase"}}>Overall Completion</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:38,fontWeight:900,color:"var(--c)",textShadow:"0 0 24px var(--c)",lineHeight:1}}>
                  {dynamicChallenges.length > 0 ? Math.round(dynamicChallenges.reduce((a,ch)=>a+getChallengeProgress(ch),0)/dynamicChallenges.length) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TUTORIALS ── */}
        <div className={`page${tab==="tutorials"?" active":""}`}>
          <div style={{padding:"24px 32px 0"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:700,color:"#fff",letterSpacing:4}}>TUTORIAL CENTER</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"var(--dim)",letterSpacing:3,marginTop:3}}>VIDEO GUIDES · DOCUMENTATION · STARTER RESOURCES</div>
          </div>
          <div style={{padding:"22px 32px 28px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
            <div className="panel" style={{gridColumn:"1/-1"}}>
              <div className="panel-title">INTRO TO THE CHALLENGE</div>
              <video 
                src="/tutorial.mp4" 
                controls 
                style={{width: "100%", borderRadius: 6, display: "block", background: "#000"}}
              />
            </div>
            <div className="panel">
              <div className="panel-title purple">RESOURCES & DOCS</div>
              {[{name:"Dataset Documentation",tag:"PDF",ico:"📄"},{name:"Evaluation Rubric",tag:"PDF · Scoring Guide",ico:"📊"},{name:"MLflow Quickstart",tag:"MD · Setup",ico:"🔬"}].map((r,i)=>(
                <div key={i} className="resource-item"><span style={{fontSize:16}}>{r.ico}</span><div><div className="resource-name">{r.name}</div><div className="resource-tag">{r.tag}</div></div></div>
              ))}
            </div>
            <div className="panel">
              <div className="panel-title gold">QUICK REFERENCE</div>
              {[["Submission format",".csv max 100KB · .ipynb max 2MB"],["Final notebook","imperium_final.ipynb"],["MLflow port","localhost:5000"],["API endpoint","POST /predict"]].map(([k,v],i)=>(
                <div key={i} className="activity-row"><span>{k}</span><span style={{color:"var(--c)"}}>{v}</span></div>
              ))}
            </div>
            <div className="panel">
              <div className="panel-title">ENVIRONMENT</div>
              <div className="output-box" style={{marginTop:0}}>
                {["▸ Python 3.11+","▸ scikit-learn >= 1.4","▸ xgboost >= 2.0","▸ optuna >= 3.5","▸ fastapi >= 0.110","▸ shap >= 0.45"].map((l,i)=><div key={i}>{l}</div>)}
              </div>
            </div>
          </div>
        </div>

        {/* ── CHALLENGES ── */}
        <div className={`page${tab==="challenges"?" active":""}`}>
          <div className="card-deck-scene">
            <div className="card-deck-bg"/>
            <div className="card-deck-title">CHALLENGE DECK</div>
            <div className="card-deck-sub">SWIPE THROUGH CHALLENGES · TAP TO OPEN DETAILS & ROUNDS</div>
            <CardDeck challenges={dynamicChallenges} onOpen={setOpenChallenge}/>
            <div style={{marginTop:40,fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(0,245,255,.2)",letterSpacing:3,textAlign:"center"}}>
              🔒 LOCKED CHALLENGES UNLOCK AS YOU COMPLETE PREVIOUS ONES
            </div>
          </div>
        </div>

        {/* ── PROFILE ── */}
        <div className={`page${tab==="profile"?" active":""}`}>
          <div style={{padding:"24px 32px",display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:16}}>
              <div className="profile-card">
                <div className="avatar">ME</div>
                <div className="profile-name">{userProfile ? userProfile.name.toUpperCase() : "YOUR NAME"}</div>
                <div className="profile-rank">◈ PARTICIPANT</div>
                <div className="profile-id">ID: {userProfile ? userProfile.id : "—"}</div>
                <div className="profile-divider"/>
                <div className="profile-stat-row">
                  <div className="pstat"><div className="pstat-val">{earnedXP}</div><div className="pstat-lbl">XP</div></div>
                  <div className="pstat"><div className="pstat-val">{completedRounds}</div><div className="pstat-lbl">Rounds</div></div>
                </div>
              </div>
              <div className="panel">
                <div className="panel-title gold">XP BREAKDOWN</div>
                {dynamicChallenges.map(ch=>{
                  const accent=ch.id===1?"var(--c)":ch.id===2?"var(--p)":ch.id===3?"var(--gold)":"var(--grn)";
                  const earned=ALL_ROUNDS.filter(r=>ch.rounds.includes(r.id)&&submitted[r.id]).reduce((a,r)=>a+r.pts,0);
                  const total=ALL_ROUNDS.filter(r=>ch.rounds.includes(r.id)).reduce((a,r)=>a+r.pts,0);
                  const pct=total>0?Math.round((earned/total)*100):0;
                  return (
                    <div key={ch.id} style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:ch.status==="locked"?"var(--dim)":"var(--txt)",letterSpacing:1.5}}>{ch.suit} CH.{ch.num} · {ch.title}</span>
                        <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:earned>0?accent:"var(--dim)"}}>{earned}/{total}</span>
                      </div>
                      <div style={{height:3,background:"rgba(255,255,255,.05)",borderRadius:2}}>
                        <div style={{height:"100%",width:pct+"%",background:ch.status==="locked"?"rgba(58,96,112,.3)":accent,borderRadius:2,boxShadow:earned>0?`0 0 6px ${accent}`:"none",transition:"width .6s"}}/>
                      </div>
                      <div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>
                        {ALL_ROUNDS.filter(r=>ch.rounds.includes(r.id)).map(r=>(
                          <span key={r.id} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:6.5,padding:"2px 6px",borderRadius:2,border:`1px solid ${submitted[r.id]?"rgba(0,255,136,.3)":ch.status==="locked"?"rgba(255,255,255,.04)":"rgba(0,245,255,.12)"}`,color:submitted[r.id]?"var(--grn)":ch.status==="locked"?"rgba(58,96,112,.5)":"var(--dim)",background:submitted[r.id]?"rgba(0,255,136,.04)":"transparent"}}>
                            {submitted[r.id]?`✓ R${r.id} +${r.pts}`:`R${r.id} +${r.pts}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div style={{padding:"10px 0 0",borderTop:"1px solid rgba(0,245,255,.07)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"var(--dim)",letterSpacing:2}}>TOTAL XP</span>
                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:700,color:"var(--c)",textShadow:"0 0 12px var(--c)"}}>{earnedXP} <span style={{fontSize:9,color:"var(--dim)"}}>/ {TOTAL_XP}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div className={`page${tab==="results"?" active":""}`}>
          <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18,padding:40}}>
            <div style={{fontSize:56,filter:"grayscale(1)",opacity:.35}}>🏆</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:"var(--dim)",letterSpacing:5,textAlign:"center"}}>RESULTS LOCKED</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"var(--dim)",letterSpacing:3,textAlign:"center",lineHeight:2.2}}>
              RESULTS WILL BE REVEALED AFTER<br/>ALL CHALLENGE ROUNDS ARE COMPLETED<br/>AND FINAL NOTEBOOK IS SUBMITTED
            </div>
            <div style={{marginTop:8,fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(0,245,255,.25)",letterSpacing:3}}>🔒 LOCKED · COMPLETE ALL ROUNDS TO UNLOCK</div>
          </div>
        </div>

      </div>
    </div>
  );
}
