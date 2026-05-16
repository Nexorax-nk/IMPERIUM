// @ts-nocheck
import React, { useEffect, useRef } from "react";

export default function Loader({ onDone }) {
  const canvasRef = useRef(null);
  const warpRef   = useRef(null);
  const btnRef    = useRef(null);
  const barFillRef = useRef(null);
  const barPctRef  = useRef(null);
  const statusRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current, warpC = warpRef.current;
    const btn = btnRef.current, barFill = barFillRef.current;
    const barPct = barPctRef.current, statusEl = statusRef.current;
    if (!canvas || !warpC) return;

    const ctx = canvas.getContext("2d");
    const warpCtx = warpC.getContext("2d");
    let W, H;
    const resize = () => { W = canvas.width = warpC.width = window.innerWidth; H = canvas.height = warpC.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);

    const TOTAL_DUR = 5000, BASE_SPD = 1/TOTAL_DUR, HELD_SPD = BASE_SPD*14;
    let held=false, progress=0, done=false;

    const STATUSES = [
      "[ SYS ] BOOTING COMBAT AI... STAND BY",
      "[ CPU ] LOADING NEURAL WEAPON MATRIX",
      "[ GPU ] RENDERING MECH CHASSIS — 48 SEGMENTS",
      "[ NET ] SYNCING BATTLEFIELD TELEMETRY",
      "[ ARM ] CALIBRATING PLASMA CANNONS × 4",
      "[ SYS ] THREAT DATABASE — 9,842 ENTRIES",
      "[ PWR ] ARC REACTOR CHARGING — 98%",
      "[ HUD ] HEADS-UP DISPLAY ONLINE",
      "[ OK  ] MECH ONLINE — DEPLOYING TO IMPERIUM",
    ];
    let lastStatIdx=-1;
    const updateStatus=()=>{
      if(!statusEl) return;
      const idx=Math.min(Math.floor(progress*(STATUSES.length-1)),STATUSES.length-2);
      if(progress>=0.98){statusEl.textContent=STATUSES[STATUSES.length-1];}
      else if(idx!==lastStatIdx){
        statusEl.style.opacity="0";
        setTimeout(()=>{if(statusEl){statusEl.textContent=STATUSES[idx];statusEl.style.opacity="1";}},140);
        lastStatIdx=idx;
      }
    };

    // ── state ──────────────────────────────────────────────────────────────
    let t=0, robotPulse=0, eyeFlicker=0, circPhase=0;
    let mx=W/2, my=H/2;
    const onMouse=e=>{mx=e.clientX;my=e.clientY;};
    window.addEventListener("mousemove",onMouse,{passive:true});

    // sparks
    const sparks=[];
    const spawnSpark=(x,y,col,n=4)=>{
      for(let i=0;i<n;i++){
        const a=Math.random()*Math.PI*2;
        sparks.push({x,y,vx:Math.cos(a)*(1+Math.random()*5),vy:Math.sin(a)*(1+Math.random()*5)-2,life:1,col,r:1+Math.random()*2.5});
      }
    };

    // bullet trails for held state
    const bullets=[];
    let bulletT=0;
    const spawnBullet=()=>{
      const cx2=W*0.5, S=Math.min(W,H)*0.42;
      const by=-S*0.02;
      const torsoY=by-S*0.46;
      [[-1],[1]].forEach(([fl])=>{
        const ax=fl*(S*0.4*0.5+S*0.045)+cx2;
        const ay=torsoY+S*0.06+H*0.78;
        bullets.push({x:ax,y:ay,vx:fl*(6+Math.random()*10),vy:-(1.5+Math.random()*3),life:1,col:"255,120,0"});
      });
    };

    // ── BACKGROUND ────────────────────────────────────────────────────────────
    function drawBg(prog){
      // Deep void
      const bg=ctx.createRadialGradient(W*0.5,H*0.4,0,W*0.5,H*0.5,Math.max(W,H));
      bg.addColorStop(0,`rgba(${held?"20,8,4":"4,8,20"},1)`);
      bg.addColorStop(0.5,`rgba(${held?"12,4,0":"2,4,10"},1)`);
      bg.addColorStop(1,"#000");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      // Arena hex floor
      const fy=H*0.82;
      const vp={x:W*0.5+(mx-W*0.5)*0.04,y:fy-H*0.14};
      ctx.save(); ctx.strokeStyle=`rgba(${held?"255,120,0":"0,200,255"},0.06)`; ctx.lineWidth=0.7;
      for(let c=0;c<=28;c++){const bx=W*(c/28);ctx.beginPath();ctx.moveTo(bx,fy+100);ctx.lineTo(vp.x,vp.y);ctx.stroke();}
      for(let r=1;r<=14;r++){
        const fr=r/14,lx=vp.x+(0-vp.x)*fr,rx=vp.x+(W-vp.x)*fr,ly=vp.y+(fy+100-vp.y)*fr;
        ctx.strokeStyle=`rgba(${held?"255,80,0":"0,200,255"},${0.08*(1-fr)})`;
        ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(rx,ly);ctx.stroke();
      }
      ctx.restore();
      // Floor glow pool
      const fg=ctx.createRadialGradient(W*0.5,fy,0,W*0.5,fy,W*0.5);
      fg.addColorStop(0,`rgba(${held?"255,80,0":"0,180,255"},${0.1*prog})`);
      fg.addColorStop(1,"transparent");
      ctx.fillStyle=fg; ctx.fillRect(0,fy-20,W,100);

      // Atmospheric dust particles
      ctx.save();
      for(let i=0;i<60;i++){
        const px2=((Math.sin(i*1.7+t*0.3)*0.5+0.5))*W;
        const py2=((Math.cos(i*2.3+t*0.2)*0.5+0.5))*H*0.9;
        const da=0.04+0.03*Math.sin(i+t);
        ctx.beginPath(); ctx.arc(px2,py2,0.6+Math.random()*0.8,0,Math.PI*2);
        ctx.fillStyle=`rgba(${held?"255,160,60":"100,200,255"},${da})`; ctx.fill();
      }
      ctx.restore();
    }

    // ── COMBAT HUD PANELS ─────────────────────────────────────────────────────
    function drawCombatHUD(prog){
      if(prog<0.22) return;
      const a=Math.min(1,(prog-0.22)/0.35);
      const T=t;

      // ── LEFT PANEL – PLAYER STATS ──
      const lx=22, ly=H*0.14, lw=180, lh=230;
      ctx.save(); ctx.globalAlpha=a*0.95;
      // Panel glass
      ctx.fillStyle="rgba(0,4,14,0.88)";
      ctx.strokeStyle="rgba(0,200,255,0.5)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.roundRect(lx,ly,lw,lh,4); ctx.fill(); ctx.stroke();
      // Top bar
      ctx.fillStyle="rgba(0,200,255,0.12)";
      ctx.beginPath(); ctx.roundRect(lx,ly,lw,18,[4,4,0,0]); ctx.fill();
      ctx.fillStyle="rgba(0,220,255,0.9)"; ctx.font="700 8px 'Share Tech Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("◉ UNIT-7 STATUS",lx+7,ly+12);

      // HEALTH bar
      const hp=0.45+0.45*prog;
      ctx.fillStyle="rgba(255,255,255,0.06)"; ctx.fillRect(lx+8,ly+26,lw-16,10);
      const hg=ctx.createLinearGradient(lx+8,ly+26,lx+8+(lw-16)*hp,ly+26);
      hg.addColorStop(0,"#ff2a2a"); hg.addColorStop(0.5,"#ff7700"); hg.addColorStop(1,"#00ff88");
      ctx.fillStyle=hg; ctx.fillRect(lx+8,ly+26,(lw-16)*hp,10);
      ctx.fillStyle="rgba(255,255,255,0.07)"; ctx.fillRect(lx+8,ly+26,lw-16,4);
      ctx.fillStyle="rgba(0,220,255,0.6)"; ctx.font="600 7px 'Share Tech Mono',monospace";
      ctx.fillText("HP",lx+8,ly+24); ctx.fillStyle="rgba(255,255,255,0.5)";
      ctx.fillText(Math.round(hp*100)+"/100",lx+lw-42,ly+24);

      // SHIELD bar
      const sh=Math.min(1,prog*1.4)*0.8;
      ctx.fillStyle="rgba(255,255,255,0.06)"; ctx.fillRect(lx+8,ly+44,lw-16,8);
      const sg=ctx.createLinearGradient(lx+8,ly+44,lx+8+(lw-16)*sh,ly+44);
      sg.addColorStop(0,"#0066ff"); sg.addColorStop(1,"#00f5ff");
      ctx.fillStyle=sg; ctx.fillRect(lx+8,ly+44,(lw-16)*sh,8);
      ctx.fillStyle="rgba(0,200,255,0.6)"; ctx.fillText("SH",lx+8,ly+43);
      ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.fillText(Math.round(sh*100)+"%",lx+lw-30,ly+43);

      // ENERGY
      const en=0.3+0.5*Math.abs(Math.sin(T*1.2));
      ctx.fillStyle="rgba(255,255,255,0.06)"; ctx.fillRect(lx+8,ly+60,lw-16,8);
      const eg=ctx.createLinearGradient(lx+8,ly+60,lx+8+(lw-16)*en,ly+60);
      eg.addColorStop(0,"#8800ff"); eg.addColorStop(1,"#ff00ff");
      ctx.fillStyle=eg; ctx.fillRect(lx+8,ly+60,(lw-16)*en,8);
      ctx.fillStyle="rgba(220,100,255,0.7)"; ctx.fillText("EN",lx+8,ly+59);

      // STATS grid
      const stats=[["LVL","99"],["ATK","999"],["DEF","847"],["SPD","MAX"],["XP","██████"]];
      stats.forEach(([k,v],i)=>{
        const sy=ly+80+i*27;
        ctx.fillStyle="rgba(0,200,255,0.08)";
        ctx.fillRect(lx+8,sy-10,lw-16,22);
        ctx.strokeStyle="rgba(0,200,255,0.12)"; ctx.lineWidth=0.5;
        ctx.strokeRect(lx+8,sy-10,lw-16,22);
        ctx.fillStyle="rgba(100,200,255,0.6)"; ctx.font="600 8px 'Share Tech Mono',monospace";
        ctx.fillText(k,lx+14,sy+5);
        ctx.fillStyle="rgba(0,255,180,0.9)"; ctx.textAlign="right";
        ctx.fillText(v,lx+lw-10,sy+5); ctx.textAlign="left";
      });

      // Scan line sweep
      const scanY=(T*50)%lh;
      const scanGrad=ctx.createLinearGradient(lx,ly+scanY-4,lx,ly+scanY+4);
      scanGrad.addColorStop(0,"transparent"); scanGrad.addColorStop(0.5,"rgba(0,220,255,0.1)"); scanGrad.addColorStop(1,"transparent");
      ctx.fillStyle=scanGrad; ctx.fillRect(lx,ly+scanY-4,lw,8);

      ctx.restore();

      // ── RIGHT PANEL – WEAPON SYSTEMS ──
      const rx=W-202, ry=H*0.14, rw=180, rh=230;
      ctx.save(); ctx.globalAlpha=a*0.95;
      ctx.fillStyle="rgba(4,0,14,0.88)";
      ctx.strokeStyle="rgba(255,80,0,0.5)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.roundRect(rx,ry,rw,rh,4); ctx.fill(); ctx.stroke();
      ctx.fillStyle="rgba(255,80,0,0.12)"; ctx.beginPath(); ctx.roundRect(rx,ry,rw,18,[4,4,0,0]); ctx.fill();
      ctx.fillStyle="rgba(255,120,0,0.9)"; ctx.font="700 8px 'Share Tech Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("◉ WEAPON SYSTEMS",rx+7,ry+12);

      const weapons=[
        {name:"PLASMA CANNON",ammo:0.7+0.2*Math.sin(T*0.8),col:"255,60,0",hot:true},
        {name:"ION BLASTER",ammo:0.9,col:"0,200,255",hot:false},
        {name:"RAIL GUN",ammo:0.45+0.3*Math.abs(Math.sin(T*0.5)),col:"180,0,255",hot:false},
        {name:"NANO MISSILES",ammo:Math.min(1,prog*1.2),col:"0,255,100",hot:false},
      ];
      weapons.forEach((w,i)=>{
        const wy=ry+28+i*48;
        ctx.fillStyle=`rgba(${w.col},0.07)`; ctx.fillRect(rx+8,wy,rw-16,40);
        ctx.strokeStyle=`rgba(${w.col},0.3)`; ctx.lineWidth=0.6; ctx.strokeRect(rx+8,wy,rw-16,40);
        ctx.fillStyle=`rgba(${w.col},0.8)`; ctx.font=`700 7px 'Share Tech Mono',monospace`;
        ctx.fillText(w.name,rx+12,wy+11);
        if(w.hot){
          const pulse=0.6+0.4*Math.sin(T*4);
          ctx.fillStyle=`rgba(255,200,0,${pulse})`; ctx.fillText("◆ ACTIVE",rx+rw-54,wy+11);
        }
        // ammo bar – segmented
        const bw=rw-20, segs=10;
        for(let s=0;s<segs;s++){
          const filled=s/segs<w.ammo;
          ctx.fillStyle=filled?`rgba(${w.col},0.8)`:"rgba(255,255,255,0.06)";
          ctx.fillRect(rx+10+s*(bw/segs)+0.5,wy+18,bw/segs-2,6);
        }
        // temp reading
        const temp=Math.round(300+w.ammo*800+Math.sin(T*2+i)*50);
        ctx.fillStyle=`rgba(${w.col},0.5)`; ctx.font="500 7px 'Share Tech Mono',monospace";
        ctx.fillText(`TEMP: ${temp}K`,rx+10,wy+36);
        ctx.textAlign="right";
        ctx.fillText(`${Math.round(w.ammo*100)}%`,rx+rw-8,wy+36);
        ctx.textAlign="left";
      });
      ctx.restore();

      // ── TOP CENTER – GAME TITLE / MATCH INFO ──
      if(prog>0.1){
        const ta=Math.min(1,(prog-0.1)/0.3);
        ctx.save(); ctx.globalAlpha=ta;
        // Match status bar
        ctx.fillStyle="rgba(0,0,10,0.85)";
        ctx.strokeStyle="rgba(0,200,255,0.3)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(W*0.5-200,14,400,32,3); ctx.fill(); ctx.stroke();
        ctx.fillStyle="rgba(0,200,255,0.8)"; ctx.font="700 9px 'Share Tech Mono',monospace"; ctx.textAlign="center";
        ctx.fillText("[ ARENA MODE ] · SECTOR ALPHA-7 · THREAT LEVEL: CRITICAL",W*0.5,35);
        // Flashing record indicator
        if(Math.floor(T*2)%2===0){
          ctx.fillStyle="rgba(255,40,40,0.9)"; ctx.beginPath(); ctx.arc(W*0.5-185,30,4,0,Math.PI*2); ctx.fill();
        }
        ctx.restore();
      }

      // ── BOTTOM – MINIMAP ──
      if(prog>0.4){
        const ma=Math.min(1,(prog-0.4)/0.35);
        const mx2=W*0.5, my2=H-110, mw=160, mh=100;
        ctx.save(); ctx.globalAlpha=ma*0.9;
        ctx.fillStyle="rgba(0,4,14,0.9)"; ctx.strokeStyle="rgba(0,200,255,0.4)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(mx2-mw*0.5,my2,mw,mh,4); ctx.fill(); ctx.stroke();
        ctx.fillStyle="rgba(0,200,255,0.08)"; ctx.beginPath(); ctx.roundRect(mx2-mw*0.5,my2,mw,14,[4,4,0,0]); ctx.fill();
        ctx.fillStyle="rgba(0,200,255,0.7)"; ctx.font="600 7px 'Share Tech Mono',monospace"; ctx.textAlign="left";
        ctx.fillText("TACTICAL MAP",mx2-mw*0.5+6,my2+10);
        // Enemy blips
        [[0.2,0.4,"255,60,0"],[0.75,0.3,"255,80,0"],[0.55,0.7,"255,120,0"],[0.1,0.8,"200,40,0"]].forEach(([ex,ey,c])=>{
          const bx=mx2-mw*0.5+8+ex*(mw-16), by2=my2+18+ey*(mh-22);
          const pulse=0.5+0.5*Math.sin(T*3+ex*5);
          ctx.fillStyle=`rgba(${c},${pulse*0.9})`;
          ctx.beginPath(); ctx.arc(bx,by2,3,0,Math.PI*2); ctx.fill();
          ctx.strokeStyle=`rgba(${c},${pulse*0.4})`; ctx.lineWidth=0.8;
          ctx.beginPath(); ctx.arc(bx,by2,6,0,Math.PI*2); ctx.stroke();
        });
        // Player blip (center)
        ctx.fillStyle="rgba(0,255,180,1)"; ctx.shadowColor="rgba(0,255,180,1)"; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.arc(mx2,my2+mh*0.5,4,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle="rgba(0,255,180,0.4)"; ctx.lineWidth=1; ctx.shadowBlur=0;
        ctx.beginPath(); ctx.arc(mx2,my2+mh*0.5,8+3*Math.sin(T*2),0,Math.PI*2); ctx.stroke();
        // Radar sweep
        ctx.save(); ctx.translate(mx2,my2+mh*0.5); ctx.rotate(T*1.5);
        const radarGrad=ctx.createConicalGradient?ctx.createConicalGradient(0,0,0):null;
        ctx.strokeStyle="rgba(0,255,100,0.5)"; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(mw*0.45,0); ctx.stroke();
        ctx.restore();
        ctx.restore();
      }

      // ── XP RING (around robot center) ──────────────────────────────────────
      if(prog>0.3){
        const xpa=Math.min(1,(prog-0.3)/0.4);
        const cx2=W*0.5, cy2=H*0.78-Math.min(W,H)*0.42*0.4;
        const R=Math.min(W,H)*0.42*0.62;
        ctx.save(); ctx.globalAlpha=xpa*0.6;
        // XP track
        ctx.beginPath(); ctx.arc(cx2,cy2,R,0,Math.PI*2);
        ctx.strokeStyle="rgba(255,255,255,0.06)"; ctx.lineWidth=3; ctx.stroke();
        // XP fill
        ctx.beginPath(); ctx.arc(cx2,cy2,R,-Math.PI*0.5,-Math.PI*0.5+progress*Math.PI*2);
        const xpg=ctx.createLinearGradient(cx2-R,cy2,cx2+R,cy2);
        xpg.addColorStop(0,"rgba(255,200,0,0.9)"); xpg.addColorStop(1,"rgba(255,80,0,0.9)");
        ctx.strokeStyle=xpg; ctx.lineWidth=3; ctx.stroke();
        // XP ticks
        for(let i=0;i<20;i++){
          const a=-Math.PI*0.5+i*(Math.PI*2/20);
          ctx.strokeStyle=`rgba(255,200,0,${i/20<progress?0.5:0.1})`; ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(cx2+Math.cos(a)*(R-5),cy2+Math.sin(a)*(R-5)); ctx.lineTo(cx2+Math.cos(a)*(R+5),cy2+Math.sin(a)*(R+5)); ctx.stroke();
        }
        ctx.restore();
      }
    }

    // ── 3D MECH ROBOT ────────────────────────────────────────────────────────
    function drawMech(prog){
      robotPulse+=0.04*(held?2.5:1);
      eyeFlicker+=0.12;
      circPhase+=0.025*(held?3:1);

      const cx2=W*0.5, baseY=H*0.78;
      const S=Math.min(W,H)*0.42*Math.min(1,0.22+prog*1.1);
      const ep=0.5+0.5*Math.sin(robotPulse*2);
      const eyeA=prog>0.1?Math.min(1,(prog-0.1)/0.2)*(0.9+0.1*Math.sin(eyeFlicker)):0;
      const eyeCol=held?"255,120,0":"0,220,255";
      const accentCol=held?"255,80,0":"0,180,255";
      const cA=Math.min(1,prog*2.8);

      ctx.save(); ctx.translate(cx2,baseY);
      const by=-S*0.02;

      // ── GROUND SHADOW + PLATFORM ──
      const pedW=S*0.65;
      const shG=ctx.createRadialGradient(0,8,0,0,8,pedW*1.4);
      shG.addColorStop(0,"rgba(0,0,0,0.8)"); shG.addColorStop(1,"transparent");
      ctx.save(); ctx.scale(1,0.15); ctx.beginPath(); ctx.arc(0,0,pedW*1.4,0,Math.PI*2); ctx.fillStyle=shG; ctx.fill(); ctx.restore();
      // Platform hex glow
      for(let r2=0;r2<4;r2++){
        const rr=pedW*(0.4+r2*0.2)*(1+0.04*ep);
        ctx.beginPath(); ctx.ellipse(0,6,rr,rr*0.2,0,0,Math.PI*2);
        const elG=ctx.createLinearGradient(-rr,6,rr,6);
        elG.addColorStop(0,"transparent"); elG.addColorStop(0.5,`rgba(${accentCol},${(0.4-r2*0.08)*ep})`); elG.addColorStop(1,"transparent");
        ctx.strokeStyle=elG; ctx.lineWidth=1.2-r2*0.2; ctx.stroke();
      }

      // ── HEAVY LEGS ──
      [[-1],[1]].forEach(([fl])=>{
        const lx=fl*S*0.19, ly=by;
        // ── THIGH (angled battle plates) ──
        ctx.save(); ctx.translate(lx,ly);
        const thG=ctx.createLinearGradient(-S*0.1,-S*0.45,S*0.1,-S*0.1);
        thG.addColorStop(0,fl>0?"#2c4060":"#1e3050"); thG.addColorStop(0.3,"#122030"); thG.addColorStop(1,"#06101c");
        // Outer armor plate – angular shape
        ctx.beginPath();
        ctx.moveTo(-S*0.09,-S*0.44); ctx.lineTo(S*0.09,-S*0.44);
        ctx.lineTo(S*0.1,-S*0.12); ctx.lineTo(S*0.065,-S*0.08);
        ctx.lineTo(-S*0.065,-S*0.08); ctx.lineTo(-S*0.1,-S*0.12);
        ctx.closePath(); ctx.fillStyle=thG; ctx.fill();
        ctx.strokeStyle=`rgba(${accentCol},0.4)`; ctx.lineWidth=1; ctx.stroke();
        // Rim light
        ctx.fillStyle=`rgba(${fl>0?"160,210,255":"100,180,255"},${fl>0?0.08:0.04})`;
        ctx.beginPath(); ctx.moveTo(-S*0.09,-S*0.44); ctx.lineTo(S*0.09,-S*0.44); ctx.lineTo(S*0.07,-S*0.28); ctx.lineTo(-S*0.07,-S*0.28); ctx.closePath(); ctx.fill();
        // Combat stripe
        ctx.fillStyle=`rgba(${accentCol},0.35)`;
        ctx.fillRect(-S*0.085,-S*0.42,S*0.17,S*0.025);
        // Panel screws
        [[-S*0.07,-S*0.38],[S*0.06,-S*0.35],[-S*0.06,-S*0.22],[S*0.07,-S*0.19]].forEach(([sx,sy])=>{
          ctx.beginPath(); ctx.arc(sx,sy,1.5,0,Math.PI*2);
          ctx.fillStyle=`rgba(${accentCol},0.4)`; ctx.fill();
        });
        // Thigh LED strip
        if(prog>0.2){
          const la=Math.min(1,(prog-0.2)/0.3);
          ctx.save(); ctx.shadowColor=`rgba(${accentCol},1)`; ctx.shadowBlur=8*la;
          ctx.fillStyle=`rgba(${accentCol},${la*(0.7+0.3*ep)})`;
          ctx.fillRect(-S*0.085,-S*0.33,S*0.03,S*0.12);
          ctx.restore();
        }
        ctx.restore();

        // ── KNEE JOINT – ball + rim ──
        const kg=ctx.createRadialGradient(lx,ly-S*0.075,0,lx,ly-S*0.075,S*0.07);
        kg.addColorStop(0,"#304060"); kg.addColorStop(0.5,"#0e1e32"); kg.addColorStop(1,"#040a14");
        ctx.beginPath(); ctx.arc(lx,ly-S*0.075,S*0.065,0,Math.PI*2); ctx.fillStyle=kg; ctx.fill();
        ctx.strokeStyle=`rgba(${accentCol},0.7)`; ctx.lineWidth=1.3; ctx.stroke();
        if(prog>0.3){
          const ks=ctx.createRadialGradient(lx,ly-S*0.075,0,lx,ly-S*0.075,S*0.09);
          ks.addColorStop(0,`rgba(${accentCol},${0.5*ep})`); ks.addColorStop(1,"transparent");
          ctx.beginPath(); ctx.arc(lx,ly-S*0.075,S*0.09,0,Math.PI*2); ctx.fillStyle=ks; ctx.fill();
        }

        // ── SHIN – armored plating ──
        ctx.save(); ctx.translate(lx,ly-S*0.07);
        const shG2=ctx.createLinearGradient(-S*0.08,0,S*0.08,S*0.28);
        shG2.addColorStop(0,"#162840"); shG2.addColorStop(0.4,"#0c1828"); shG2.addColorStop(1,"#060f1e");
        // Main shin plate
        ctx.beginPath(); ctx.moveTo(-S*0.08,0); ctx.lineTo(S*0.08,0); ctx.lineTo(S*0.065,S*0.28); ctx.lineTo(-S*0.065,S*0.28); ctx.closePath();
        ctx.fillStyle=shG2; ctx.fill(); ctx.strokeStyle=`rgba(${accentCol},0.25)`; ctx.lineWidth=0.9; ctx.stroke();
        // Front armor panel
        ctx.fillStyle=`rgba(${fl>0?"18,34,58":"14,28,48"},0.9)`;
        ctx.beginPath(); ctx.moveTo(-S*0.05,S*0.04); ctx.lineTo(S*0.05,S*0.04); ctx.lineTo(S*0.04,S*0.18); ctx.lineTo(-S*0.04,S*0.18); ctx.closePath();
        ctx.fill(); ctx.strokeStyle=`rgba(${accentCol},0.2)`; ctx.lineWidth=0.7; ctx.stroke();
        // Panel lines
        for(let li=0;li<3;li++){const py2=S*(0.08+li*0.06);ctx.strokeStyle=`rgba(${accentCol},0.08)`;ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(-S*0.072,py2);ctx.lineTo(S*0.062,py2);ctx.stroke();}
        ctx.restore();

        // ── FOOT – wide battle boot ──
        ctx.save(); ctx.translate(lx,ly+S*0.22);
        ctx.beginPath(); ctx.moveTo(-S*0.13,-S*0.01); ctx.lineTo(S*0.13,-S*0.01); ctx.lineTo(S*0.15,S*0.06); ctx.lineTo(fl*S*0.18,S*0.09); ctx.lineTo(-S*0.13,S*0.09); ctx.closePath();
        ctx.fillStyle="#0c1828"; ctx.fill(); ctx.strokeStyle=`rgba(${accentCol},0.5)`; ctx.lineWidth=1.1; ctx.stroke();
        // Boot thrusters
        if(prog>0.25){
          const la=Math.min(1,(prog-0.25)/0.35);
          ctx.shadowColor=`rgba(${accentCol},1)`; ctx.shadowBlur=10*la*(0.5+0.5*ep);
          ctx.fillStyle=`rgba(${accentCol},${la*(0.6+0.4*ep)})`;
          ctx.fillRect(-S*0.11,S*0.065,S*0.22,2.5);
          ctx.shadowBlur=0;
        }
        ctx.restore();
      });

      // ── HEAVY TORSO ──
      const torsoY=by-S*0.48, torsoH=S*0.44, torsoW=S*0.46;
      // Back engine block
      const ebG=ctx.createLinearGradient(-torsoW*0.45,torsoY,torsoW*0.45,torsoY+torsoH);
      ebG.addColorStop(0,"#0e1e34"); ebG.addColorStop(1,"#040c18");
      ctx.beginPath(); ctx.roundRect(-torsoW*0.55,torsoY+S*0.04,torsoW*1.1,torsoH-S*0.06,[4,4,3,3]);
      ctx.fillStyle=ebG; ctx.fill(); ctx.strokeStyle=`rgba(${accentCol},0.15)`; ctx.lineWidth=0.8; ctx.stroke();

      // Main torso – layered armor
      const tG=ctx.createLinearGradient(-torsoW*0.5,torsoY,torsoW*0.5,torsoY+torsoH);
      tG.addColorStop(0,"#22385a"); tG.addColorStop(0.2,"#162840"); tG.addColorStop(0.55,"#0d1e32"); tG.addColorStop(0.85,"#08152a"); tG.addColorStop(1,"#050e1e");
      ctx.beginPath();
      ctx.moveTo(-torsoW*0.5,torsoY+S*0.04); ctx.lineTo(-torsoW*0.48,torsoY);
      ctx.lineTo(torsoW*0.48,torsoY); ctx.lineTo(torsoW*0.5,torsoY+S*0.04);
      ctx.lineTo(torsoW*0.5,torsoY+torsoH); ctx.lineTo(-torsoW*0.5,torsoY+torsoH);
      ctx.closePath(); ctx.fillStyle=tG; ctx.fill();
      // Rim
      ctx.strokeStyle=`rgba(${accentCol},0.45)`; ctx.lineWidth=1.4; ctx.stroke();
      // Metallic sheen
      const rimG2=ctx.createLinearGradient(-torsoW*0.5,torsoY,-torsoW*0.2,torsoY+torsoH*0.4);
      rimG2.addColorStop(0,`rgba(160,210,255,0.1)`); rimG2.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.roundRect(-torsoW*0.5,torsoY,torsoW*0.3,torsoH*0.5,3); ctx.fillStyle=rimG2; ctx.fill();

      // Shoulder armor caps (large)
      [[-1],[1]].forEach(([fl])=>{
        ctx.save(); ctx.translate(fl*torsoW*0.52,torsoY+S*0.04);
        const scG=ctx.createLinearGradient(-S*0.09,-S*0.04,S*0.09,S*0.08);
        scG.addColorStop(0,fl>0?"#2a4268":"#1e3258"); scG.addColorStop(1,"#080f1e");
        ctx.beginPath(); ctx.moveTo(0,-S*0.04); ctx.lineTo(fl*S*0.14,-S*0.02); ctx.lineTo(fl*S*0.16,S*0.06); ctx.lineTo(fl*S*0.1,S*0.09); ctx.lineTo(0,S*0.07); ctx.closePath();
        ctx.fillStyle=scG; ctx.fill(); ctx.strokeStyle=`rgba(${accentCol},0.5)`; ctx.lineWidth=1; ctx.stroke();
        // Shoulder LED
        if(prog>0.3){
          const la=Math.min(1,(prog-0.3)/0.3);
          ctx.shadowColor=`rgba(${accentCol},1)`; ctx.shadowBlur=12*la*ep;
          ctx.fillStyle=`rgba(${accentCol},${la*0.9})`;
          ctx.beginPath(); ctx.arc(fl*S*0.1,S*0.02,3,0,Math.PI*2); ctx.fill();
          ctx.shadowBlur=0;
        }
        ctx.restore();
      });

      // Torso panel lines
      ctx.strokeStyle=`rgba(${accentCol},0.12)`; ctx.lineWidth=0.7;
      [0.28,0.52,0.74].forEach(frac=>{
        const py3=torsoY+frac*torsoH;
        ctx.beginPath(); ctx.moveTo(-torsoW*0.46,py3); ctx.lineTo(torsoW*0.46,py3); ctx.stroke();
      });
      // Center seam
      ctx.strokeStyle=`rgba(${accentCol},0.08)`; ctx.lineWidth=0.6;
      ctx.beginPath(); ctx.moveTo(0,torsoY+S*0.02); ctx.lineTo(0,torsoY+torsoH*0.9); ctx.stroke();

      // ── ARC REACTOR / POWER CORE ──
      const coreY=torsoY+torsoH*0.4;
      if(prog>0.2){
        const ca=Math.min(1,(prog-0.2)/0.3);
        // Outer bloom
        for(let r2=3;r2>=0;r2--){
          const rr=S*(0.22-r2*0.04);
          const bg2=ctx.createRadialGradient(0,coreY,0,0,coreY,rr);
          bg2.addColorStop(0,`rgba(${accentCol},${ca*(0.18-r2*0.04)*(0.6+0.4*ep)})`); bg2.addColorStop(1,"transparent");
          ctx.beginPath(); ctx.arc(0,coreY,rr,0,Math.PI*2); ctx.fillStyle=bg2; ctx.fill();
        }
        // Outer ring
        ctx.beginPath(); ctx.arc(0,coreY,S*0.1,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${accentCol},${ca*0.8})`; ctx.lineWidth=1.8;
        ctx.shadowColor=`rgba(${accentCol},1)`; ctx.shadowBlur=18*ca*ep; ctx.stroke(); ctx.shadowBlur=0;
        // Spinning hex arcs
        ctx.save(); ctx.translate(0,coreY);
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4+circPhase*0.4, ea=a+Math.PI/4-0.15;
          ctx.beginPath(); ctx.arc(0,0,S*0.075,a,ea);
          ctx.strokeStyle=`rgba(${accentCol},${ca*(0.5+0.5*Math.sin(circPhase*1.5+i))})`; ctx.lineWidth=2.5;
          ctx.shadowColor=`rgba(${accentCol},1)`; ctx.shadowBlur=8; ctx.stroke();
        }
        // Counter-spin inner ring
        ctx.rotate(-circPhase*0.8);
        for(let i=0;i<4;i++){
          const a=i*Math.PI/2, ea=a+Math.PI/2-0.25;
          ctx.beginPath(); ctx.arc(0,0,S*0.05,a,ea);
          ctx.strokeStyle=`rgba(${held?"255,200,0":"0,255,200"},${ca*0.7})`; ctx.lineWidth=1.5; ctx.stroke();
        }
        ctx.restore(); ctx.shadowBlur=0;
        // Core white dot
        const cInner=ctx.createRadialGradient(0,coreY,0,0,coreY,S*0.03);
        cInner.addColorStop(0,"rgba(255,255,255,1)"); cInner.addColorStop(0.5,`rgba(${accentCol},1)`); cInner.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(0,coreY,S*0.03,0,Math.PI*2); ctx.fillStyle=cInner; ctx.fill();
      }

      // ── CHEST VENTS ──
      [[-torsoW*0.3,torsoY+torsoH*0.2],[torsoW*0.3-S*0.06,torsoY+torsoH*0.2]].forEach(([vx,vy])=>{
        for(let vi=0;vi<4;vi++){
          ctx.fillStyle=`rgba(0,0,0,0.6)`; ctx.fillRect(vx,vy+vi*7,S*0.06,4);
          if(prog>0.35){
            const va=Math.min(1,(prog-0.35)/0.3);
            ctx.fillStyle=`rgba(${accentCol},${va*0.4*(0.5+0.5*Math.sin(circPhase*2+vi))})`;
            ctx.fillRect(vx,vy+vi*7,S*0.06,4);
          }
        }
      });

      // ── CIRCUIT TRACES ON TORSO ──
      if(cA>0.15){
        const cp=Math.min(1,(cA-0.15)/0.5);
        ctx.save(); ctx.lineWidth=1; ctx.shadowColor=`rgba(${accentCol},1)`; ctx.shadowBlur=6;
        ctx.strokeStyle=`rgba(${accentCol},${cp*0.65})`;
        // Left tree
        [[torsoW*-0.38,torsoY+torsoH*0.1],[torsoW*-0.38,torsoY+torsoH*0.5],
         [torsoW*-0.2,torsoY+torsoH*0.5],[torsoW*-0.2,torsoY+torsoH*0.68],
         [torsoW*-0.3,torsoY+torsoH*0.76]].reduce((prev,curr,i)=>{
          if(i>0){ctx.beginPath();ctx.moveTo(prev[0],prev[1]);ctx.lineTo(curr[0],curr[1]);ctx.stroke();}
          return curr;
        });
        // Right tree
        [[torsoW*0.38,torsoY+torsoH*0.12],[torsoW*0.38,torsoY+torsoH*0.55],
         [torsoW*0.2,torsoY+torsoH*0.55],[torsoW*0.2,torsoY+torsoH*0.72],
         [torsoW*0.3,torsoY+torsoH*0.78]].reduce((prev,curr,i)=>{
          if(i>0){ctx.beginPath();ctx.moveTo(prev[0],prev[1]);ctx.lineTo(curr[0],curr[1]);ctx.stroke();}
          return curr;
        });
        ctx.shadowBlur=0; ctx.restore();
      }

      // ── HEAVY ARMS + PLASMA CANNON ──
      [[-1],[1]].forEach(([fl])=>{
        const ax=fl*(torsoW*0.5+S*0.06), shY=torsoY+S*0.055;
        // Shoulder joint
        const sjG=ctx.createRadialGradient(ax,shY,0,ax,shY,S*0.09);
        sjG.addColorStop(0,"#2a4268"); sjG.addColorStop(0.5,"#0e1e32"); sjG.addColorStop(1,"#040a16");
        ctx.beginPath(); ctx.arc(ax,shY,S*0.085,0,Math.PI*2);
        ctx.fillStyle=sjG; ctx.fill(); ctx.strokeStyle=`rgba(${accentCol},0.6)`; ctx.lineWidth=1.3; ctx.stroke();
        if(prog>0.25){
          const la=Math.min(1,(prog-0.25)/0.3);
          ctx.shadowColor=`rgba(${accentCol},1)`; ctx.shadowBlur=12*la*ep;
          ctx.beginPath(); ctx.arc(ax,shY,S*0.04,0,Math.PI*2);
          ctx.fillStyle=`rgba(${accentCol},${la*0.9})`; ctx.fill(); ctx.shadowBlur=0;
        }

        // Arm angle (idle sway)
        const armAng=fl*(0.12+0.04*Math.sin(robotPulse*0.5));
        ctx.save(); ctx.translate(ax,shY); ctx.rotate(armAng);

        // Upper arm – heavy
        const uaG=ctx.createLinearGradient(-S*0.075,0,S*0.075,S*0.3);
        uaG.addColorStop(0,fl>0?"#22385a":"#182e4a"); uaG.addColorStop(0.5,"#0e1e30"); uaG.addColorStop(1,"#07101e");
        ctx.beginPath(); ctx.moveTo(-S*0.075,0); ctx.lineTo(S*0.075,0); ctx.lineTo(S*0.065,S*0.28); ctx.lineTo(-S*0.065,S*0.28); ctx.closePath();
        ctx.fillStyle=uaG; ctx.fill(); ctx.strokeStyle=`rgba(${accentCol},0.25)`; ctx.lineWidth=1; ctx.stroke();
        // Arm sheen
        ctx.fillStyle=`rgba(160,210,255,${fl>0?0.07:0.03})`; ctx.fillRect(-S*0.075,0,S*0.04,S*0.28);
        // Arm panel stripe
        ctx.fillStyle=`rgba(${accentCol},0.25)`; ctx.fillRect(-S*0.072,S*0.04,S*0.14,S*0.02);

        // Elbow joint
        const ej=ctx.createRadialGradient(0,S*0.28,0,0,S*0.28,S*0.06);
        ej.addColorStop(0,"#263c5a"); ej.addColorStop(1,"#060e1a");
        ctx.beginPath(); ctx.arc(0,S*0.28,S*0.056,0,Math.PI*2); ctx.fillStyle=ej; ctx.fill();
        ctx.strokeStyle=`rgba(${accentCol},0.6)`; ctx.lineWidth=1.1; ctx.stroke();

        // Forearm
        const faG=ctx.createLinearGradient(-S*0.065,S*0.28,S*0.065,S*0.52);
        faG.addColorStop(0,"#14243c"); faG.addColorStop(1,"#080f1c");
        ctx.beginPath(); ctx.moveTo(-S*0.065,S*0.28); ctx.lineTo(S*0.065,S*0.28); ctx.lineTo(S*0.07,S*0.52); ctx.lineTo(-S*0.07,S*0.52); ctx.closePath();
        ctx.fillStyle=faG; ctx.fill(); ctx.strokeStyle=`rgba(${accentCol},0.2)`; ctx.lineWidth=0.9; ctx.stroke();

        // ── PLASMA CANNON (right arm) ──
        if(fl===1){
          const canY=S*0.38, canW=S*0.22, canH=S*0.12;
          const canG=ctx.createLinearGradient(S*0.065,canY,-S*0.065,canY+canH);
          canG.addColorStop(0,"#1c3050"); canG.addColorStop(1,"#060e1e");
          ctx.beginPath(); ctx.roundRect(S*0.07,canY,canW,canH,3); ctx.fillStyle=canG; ctx.fill();
          ctx.strokeStyle=`rgba(${accentCol},0.7)`; ctx.lineWidth=1; ctx.stroke();
          // Barrel rings
          for(let ri=0;ri<4;ri++){
            const rx=S*(0.12+ri*0.05);
            ctx.strokeStyle=`rgba(${accentCol},${0.5-ri*0.08})`; ctx.lineWidth=1.5;
            ctx.beginPath(); ctx.moveTo(rx,canY+2); ctx.lineTo(rx,canY+canH-2); ctx.stroke();
          }
          // Muzzle
          if(prog>0.45){
            const mza=Math.min(1,(prog-0.45)/0.3);
            ctx.shadowColor=`rgba(${accentCol},1)`; ctx.shadowBlur=16*mza*(0.5+0.5*ep);
            ctx.fillStyle=`rgba(${accentCol},${mza*(0.7+0.3*ep)})`;
            ctx.beginPath(); ctx.arc(S*0.29,canY+canH*0.5,S*0.02,0,Math.PI*2); ctx.fill();
            // Muzzle flash
            if(held&&Math.sin(robotPulse*8)>0.5){
              ctx.beginPath(); ctx.arc(S*0.29,canY+canH*0.5,S*0.05,0,Math.PI*2);
              ctx.fillStyle=`rgba(255,220,80,0.8)`; ctx.fill();
            }
            ctx.shadowBlur=0;
          }
        }

        // Hand/claw
        ctx.beginPath(); ctx.roundRect(-S*0.075,S*0.52,S*0.14,S*0.09,[4,4,6,6]);
        ctx.fillStyle="#0b1626"; ctx.fill(); ctx.strokeStyle=`rgba(${accentCol},0.45)`; ctx.lineWidth=1; ctx.stroke();
        // Finger glows
        if(prog>0.5){
          const fp=Math.min(1,(prog-0.5)/0.35);
          for(let fi=0;fi<4;fi++){
            const fx2=-S*0.06+fi*S*0.038;
            ctx.shadowColor=`rgba(${accentCol},1)`; ctx.shadowBlur=8*fp;
            ctx.fillStyle=`rgba(${accentCol},${fp*(0.5+0.3*Math.sin(eyeFlicker*1.5+fi))})`;
            ctx.beginPath(); ctx.roundRect(fx2,S*0.6,S*0.025,S*0.03,[0,0,3,3]); ctx.fill();
          }
          ctx.shadowBlur=0;
        }
        ctx.restore();
      });

      // ── NECK ──
      const neckY=torsoY-S*0.08;
      for(let ni=0;ni<4;ni++){
        const nw=S*(0.14-ni*0.012), nh=S*0.032, ny2=neckY+ni*S*0.03;
        const ng=ctx.createLinearGradient(-nw*0.5,ny2,nw*0.5,ny2+nh);
        ng.addColorStop(0,`rgba(${14+ni*3},${24+ni*3},${40+ni*3},1)`);
        ng.addColorStop(1,`rgba(${8+ni*2},${14+ni*2},${24+ni*2},1)`);
        ctx.beginPath(); ctx.roundRect(-nw*0.5,ny2,nw,nh,2); ctx.fillStyle=ng; ctx.fill();
        ctx.strokeStyle=`rgba(${accentCol},${0.2+ni*0.04})`; ctx.lineWidth=0.8; ctx.stroke();
      }

      // ── HEAD – ANGULAR BATTLE HELMET ──
      const headY=torsoY-S*0.35, headW=S*0.38, headH=S*0.29;
      // Head base shape – hex-cut armor
      const hG=ctx.createLinearGradient(-headW*0.5,headY,headW*0.5,headY+headH);
      hG.addColorStop(0,"#263a5c"); hG.addColorStop(0.25,"#18294a"); hG.addColorStop(0.6,"#0e1c38"); hG.addColorStop(1,"#07101e");
      ctx.beginPath();
      ctx.moveTo(-headW*0.4,headY); ctx.lineTo(headW*0.4,headY);
      ctx.lineTo(headW*0.5,headY+S*0.04); ctx.lineTo(headW*0.5,headY+headH-S*0.03);
      ctx.lineTo(headW*0.35,headY+headH); ctx.lineTo(-headW*0.35,headY+headH);
      ctx.lineTo(-headW*0.5,headY+headH-S*0.03); ctx.lineTo(-headW*0.5,headY+S*0.04);
      ctx.closePath(); ctx.fillStyle=hG; ctx.fill();
      // Rim + sheen
      ctx.strokeStyle=`rgba(${accentCol},0.55)`; ctx.lineWidth=1.5; ctx.stroke();
      const hRim=ctx.createLinearGradient(-headW*0.5,headY,headW*0.5,headY+headH*0.4);
      hRim.addColorStop(0,`rgba(180,220,255,0.1)`); hRim.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.roundRect(-headW*0.5,headY,headW,headH*0.45,4); ctx.fillStyle=hRim; ctx.fill();

      // Top crest
      ctx.beginPath();
      ctx.moveTo(-headW*0.15,headY); ctx.lineTo(headW*0.15,headY);
      ctx.lineTo(headW*0.1,headY-S*0.06); ctx.lineTo(-headW*0.1,headY-S*0.06);
      ctx.closePath();
      ctx.fillStyle="#0e1e38"; ctx.fill(); ctx.strokeStyle=`rgba(${accentCol},0.4)`; ctx.lineWidth=1; ctx.stroke();
      // Crest LED
      if(prog>0.4){
        const la=Math.min(1,(prog-0.4)/0.3);
        ctx.shadowColor=`rgba(${accentCol},1)`; ctx.shadowBlur=10*la*ep;
        ctx.fillStyle=`rgba(${accentCol},${la*0.8})`;
        ctx.fillRect(-headW*0.12,headY-S*0.05,headW*0.24,2.5);
        ctx.shadowBlur=0;
      }

      // Cheek vents
      [[-1],[1]].forEach(([fl])=>{
        const vx=fl*(headW*0.3);
        for(let vi=0;vi<3;vi++){
          const vy=headY+headH*0.55+vi*8;
          ctx.fillStyle="rgba(0,0,0,0.7)"; ctx.fillRect(vx-8,vy,14,4);
          if(prog>0.35){
            const va=Math.min(1,(prog-0.35)/0.3);
            ctx.fillStyle=`rgba(${accentCol},${va*0.35*(0.5+0.5*Math.sin(circPhase*3+vi))})`;
            ctx.fillRect(vx-8,vy,14,4);
          }
        }
      });

      // Head panel seam
      ctx.strokeStyle=`rgba(${accentCol},0.08)`; ctx.lineWidth=0.6;
      ctx.beginPath(); ctx.moveTo(0,headY+S*0.02); ctx.lineTo(0,headY+headH*0.95); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-headW*0.5,headY+headH*0.52); ctx.lineTo(headW*0.5,headY+headH*0.52); ctx.stroke();

      // ── VISOR / EYES – war mode ──
      const eyeY=headY+headH*0.36;
      // Visor slot
      ctx.beginPath(); ctx.roundRect(-headW*0.42,eyeY-S*0.04,headW*0.84,S*0.075,4);
      ctx.fillStyle="#010408"; ctx.fill(); ctx.strokeStyle=`rgba(${accentCol},0.3)`; ctx.lineWidth=0.8; ctx.stroke();

      [[-1],[1]].forEach(([fl])=>{
        const ex2=fl*headW*0.25;
        // Eye recess
        ctx.beginPath(); ctx.roundRect(ex2-S*0.08,eyeY-S*0.035,S*0.15,S*0.07,5);
        ctx.fillStyle="#020810"; ctx.fill();
        if(eyeA>0){
          // Full lens fill
          const eyeG2=ctx.createRadialGradient(ex2,eyeY,0,ex2,eyeY,S*0.08);
          eyeG2.addColorStop(0,"rgba(255,255,255,1)");
          eyeG2.addColorStop(0.18,`rgba(${eyeCol},1)`);
          eyeG2.addColorStop(0.55,`rgba(${eyeCol},${eyeA*0.6})`);
          eyeG2.addColorStop(1,"transparent");
          ctx.save(); ctx.beginPath(); ctx.roundRect(ex2-S*0.077,eyeY-S*0.033,S*0.144,S*0.066,4); ctx.clip();
          ctx.beginPath(); ctx.arc(ex2,eyeY,S*0.08,0,Math.PI*2); ctx.fillStyle=eyeG2; ctx.fill();
          // Scanline inside eye
          const sX=ex2-S*0.06+(((Date.now()*0.003)%1)*S*0.12);
          ctx.fillStyle="rgba(255,255,255,0.35)"; ctx.fillRect(sX-2,eyeY-S*0.033,4,S*0.066);
          ctx.restore();
          // Multi-layer bloom
          for(let g=0;g<4;g++){
            ctx.shadowColor=`rgba(${eyeCol},1)`; ctx.shadowBlur=(14+g*12)*eyeA;
            ctx.beginPath(); ctx.arc(ex2,eyeY,S*(0.025-g*0.004),0,Math.PI*2);
            ctx.fillStyle=`rgba(${eyeCol},${eyeA*(0.9-g*0.18)})`; ctx.fill();
          }
          ctx.shadowBlur=0;
        }
      });

      // Center visor stripe
      if(eyeA>0){
        ctx.save(); ctx.beginPath(); ctx.roundRect(-headW*0.42,eyeY-S*0.04,headW*0.84,S*0.075,4); ctx.clip();
        const vscan=((Date.now()*0.0008)%1)*S*0.075;
        const vsg=ctx.createLinearGradient(0,eyeY-S*0.04+vscan-4,0,eyeY-S*0.04+vscan+4);
        vsg.addColorStop(0,"transparent"); vsg.addColorStop(0.5,`rgba(${eyeCol},${eyeA*0.12})`); vsg.addColorStop(1,"transparent");
        ctx.fillStyle=vsg; ctx.fillRect(-headW*0.42,eyeY-S*0.04+vscan-4,headW*0.84,8);
        ctx.restore();
      }

      // ── TARGETING RETICLE (floats above head) ──
      if(prog>0.38){
        const rp=Math.min(1,(prog-0.38)/0.35);
        ctx.save(); ctx.translate(0,headY+headH*0.38);
        const retR=headW*0.62;
        ctx.strokeStyle=`rgba(${accentCol},${rp*0.4})`; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.arc(0,0,retR,0,Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0,0,retR*0.6,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${accentCol},${rp*0.2})`; ctx.stroke();
        // Corner brackets
        [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([bx,by2])=>{
          const ang=Math.atan2(by2,bx), bl=retR*0.28;
          ctx.strokeStyle=`rgba(${accentCol},${rp*0.85})`; ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(Math.cos(ang)*retR,Math.sin(ang)*retR);
          ctx.lineTo(Math.cos(ang+bx*0.4)*retR,Math.sin(ang)*retR); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(Math.cos(ang)*retR,Math.sin(ang)*retR);
          ctx.lineTo(Math.cos(ang)*retR,Math.sin(ang+by2*0.4)*retR); ctx.stroke();
        });
        // Rotating targeting ring
        ctx.save(); ctx.rotate(Date.now()*0.0015);
        ctx.setLineDash([8,12]);
        ctx.strokeStyle=`rgba(${accentCol},${rp*0.3})`; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.arc(0,0,retR*0.82,0,Math.PI*2); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
        ctx.restore();
      }

      // ── ANTENNAE / SENSOR HORNS ──
      [[-1],[1]].forEach(([fl])=>{
        const ax2=fl*headW*0.28, ay=headY-S*0.01;
        ctx.strokeStyle=`rgba(${accentCol},0.5)`; ctx.lineWidth=1.4;
        ctx.beginPath(); ctx.moveTo(ax2,ay); ctx.lineTo(ax2+fl*S*0.04,ay-S*0.09); ctx.stroke();
        if(prog>0.4){
          const la=Math.min(1,(prog-0.4)/0.3);
          ctx.shadowColor=`rgba(${accentCol},1)`; ctx.shadowBlur=10*la;
          ctx.fillStyle=`rgba(${accentCol},${la*(0.8+0.2*Math.sin(eyeFlicker*2.5+fl))})`;
          ctx.beginPath(); ctx.arc(ax2+fl*S*0.04,ay-S*0.09,S*0.012,0,Math.PI*2); ctx.fill();
          ctx.shadowBlur=0;
        }
      });

      // ── FULL BODY GLOW AURA ──
      if(prog>0.15){
        const ga=Math.min(1,(prog-0.15)/0.5)*0.16*(0.6+0.4*ep);
        const aura=ctx.createRadialGradient(0,torsoY+torsoH*0.5,0,0,torsoY+torsoH*0.5,S);
        aura.addColorStop(0,`rgba(${accentCol},${ga})`);
        aura.addColorStop(0.5,`rgba(${held?"100,30,0":"0,60,140"},${ga*0.4})`);
        aura.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(0,torsoY+torsoH*0.5,S,0,Math.PI*2); ctx.fillStyle=aura; ctx.fill();
      }

      ctx.restore();
    }

    // ── BULLETS & SPARKS ─────────────────────────────────────────────────────
    function updateFX(dt){
      // bullets
      for(let i=bullets.length-1;i>=0;i--){
        const b=bullets[i];
        b.x+=b.vx*dt*60; b.y+=b.vy*dt*60; b.vy+=0.15*dt*60; b.life-=dt*3;
        if(b.life<=0){bullets.splice(i,1);continue;}
        ctx.save(); ctx.shadowColor=`rgba(${b.col},1)`; ctx.shadowBlur=8*b.life;
        ctx.beginPath(); ctx.arc(b.x,b.y,2.5*b.life,0,Math.PI*2);
        ctx.fillStyle=`rgba(${b.col},${b.life*0.9})`; ctx.fill();
        // Trail
        ctx.strokeStyle=`rgba(${b.col},${b.life*0.5})`; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(b.x,b.y); ctx.lineTo(b.x-b.vx*6,b.y-b.vy*4); ctx.stroke();
        ctx.restore();
      }
      // sparks
      for(let i=sparks.length-1;i>=0;i--){
        const s=sparks[i];
        s.x+=s.vx*dt*60; s.y+=s.vy*dt*60; s.vy+=0.08*dt*60; s.life-=dt*2.2;
        if(s.life<=0){sparks.splice(i,1);continue;}
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2);
        ctx.fillStyle=`rgba(s.col},${s.life*0.85})`; ctx.fill();
      }
    }

    // ── PORTAL END SEQUENCE ───────────────────────────────────────────────────
    let endPhase=0;
    function drawPortalEnd(dt){
      endPhase=Math.min(1,endPhase+dt*0.003);
      warpCtx.clearRect(0,0,W,H);
      const cx2=W*0.5, cy2=H*0.5, mR=Math.max(W,H)*0.95;
      for(let i=0;i<16;i++){
        const r=mR*((endPhase+i*0.065)%1);
        const a=(1-(endPhase+i*0.065)%1)*0.85;
        warpCtx.beginPath(); warpCtx.arc(cx2,cy2,r,0,Math.PI*2);
        warpCtx.strokeStyle=i%3===0?`rgba(0,245,255,${a})`:(i%3===1?`rgba(255,80,0,${a*0.7})`:`rgba(168,85,247,${a*0.6})`);
        warpCtx.lineWidth=2.8-r/mR*2.5; warpCtx.stroke();
      }
      if(endPhase>0.5){
        const tp=(endPhase-0.5)/0.5;
        warpCtx.save(); warpCtx.globalAlpha=tp;
        warpCtx.font=`900 ${Math.min(W*0.12,88)}px Orbitron,monospace`;
        warpCtx.textAlign="center"; warpCtx.textBaseline="middle";
        warpCtx.fillStyle=`rgba(255,255,255,${tp})`;
        warpCtx.shadowColor="rgba(0,245,255,1)"; warpCtx.shadowBlur=60*tp;
        warpCtx.fillText("UNIT ONLINE",cx2,cy2-52*tp);
        warpCtx.font=`900 ${Math.min(W*0.07,52)}px Orbitron,monospace`;
        warpCtx.fillText("ENTERING IMPERIUM",cx2,cy2+16*tp);
        warpCtx.restore();
      }
      return endPhase>=1;
    }

    // ── MAIN LOOP ─────────────────────────────────────────────────────────────
    let lastTs=0, rafId;
    function frame(ts){
      const dt=Math.min(ts-lastTs,50); lastTs=ts; t=ts/1000;
      const dtS=dt/1000;
      if(!done) progress=Math.min(1,progress+(held?HELD_SPD:BASE_SPD)*dt);
      const pct=Math.round(progress*100);
      if(barFill) barFill.style.width=pct+"%";
      if(barPct) barPct.textContent=pct;
      updateStatus();

      // spawn bullets when held
      if(held){ bulletT+=dtS; if(bulletT>0.08){bulletT=0;spawnBullet();} }

      ctx.clearRect(0,0,W,H);
      drawBg(progress);
      updateFX(dtS);
      drawMech(progress);
      drawCombatHUD(progress);

      if(progress>=1&&!done){done=true;startEnd();return;}
      rafId=requestAnimationFrame(frame);
    }

    function startEnd(){
      let prev=0;
      function ef(ts){
        const dt=Math.min(ts-prev,50)/1000; prev=ts; t=ts/1000;
        ctx.clearRect(0,0,W,H);
        drawBg(1);
        drawMech(1.0);
        drawCombatHUD(1.0);
        const fin=drawPortalEnd(dt*1000);
        if(fin){
          const el=document.getElementById("imp-loader");
          if(el) el.classList.add("fade-out");
          setTimeout(()=>onDone(),1800);
        } else requestAnimationFrame(ef);
      }
      requestAnimationFrame(ef);
    }

    function setHeld(v){
      held=v;
      if(btn) v?btn.classList.add("held"):btn.classList.remove("held");
    }
    const md=()=>setHeld(true), mu=()=>setHeld(false);
    const ts2=(e)=>{e.preventDefault();setHeld(true);};
    if(btn){btn.addEventListener("mousedown",md);btn.addEventListener("touchstart",ts2,{passive:false});}
    window.addEventListener("mouseup",mu); window.addEventListener("touchend",mu);
    rafId=requestAnimationFrame(frame);

    return ()=>{
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize",resize);
      window.removeEventListener("mousemove",onMouse);
      window.removeEventListener("mouseup",mu);
      window.removeEventListener("touchend",mu);
    };
  },[onDone]);

  return (
    <div id="imp-loader">
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
      <img src="/imperium-logo.png" alt="IMPERIUM" style={{width: "100%", maxWidth: 720, display: "block", margin: "-220px auto 20px", position: "relative", zIndex: 20, filter: "drop-shadow(0 0 35px rgba(0,245,255,0.55))"}} />
      <div id="imp-loader-sub">COMBAT MECH ONLINE · ARENA 2080</div>
      <div id="imp-loader-status" ref={statusRef}>[ SYS ] BOOTING COMBAT AI...</div>
      <canvas ref={warpRef} id="imp-warp-overlay" />
      <button id="imp-hold-btn" ref={btnRef}>
        <span className="imp-btn-ring"></span>
        HOLD TO ACCELERATE
      </button>
      <div id="imp-hold-hint">HOLD TO BOOST · FIRES PLASMA ROUNDS</div>
      <div id="imp-loader-bar-wrap">
        <div id="imp-loader-bar-label">BOOT SEQUENCE: <span ref={barPctRef}>0</span>%</div>
        <div id="imp-loader-bar-track">
          <div id="imp-loader-bar-fill" ref={barFillRef} style={{width:"0%"}}></div>
          <div id="imp-loader-bar-seg"></div>
        </div>
      </div>
    </div>
  );
}
