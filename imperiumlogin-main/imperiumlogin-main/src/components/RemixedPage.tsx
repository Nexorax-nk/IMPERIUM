// @ts-nocheck
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import IntroSequence from "./IntroSequence";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

:root {
  --c: #00f5ff; --c2: #00c8d4; --cg: rgba(0,245,255,0.18);
  --p: #a855f7;  --pg: rgba(168,85,247,0.25);
  --gold: #fbbf24; --red: #ff3b5c; --grn: #00ff88;
  --bg: #020810; --bg2: #030c18;
  --panel: rgba(0,14,30,0.94); --pb: rgba(0,245,255,0.12);
  --txt: #b0d4e8; --dim: #3a6070;
}

/* ── RESET ── */
.imp-root, .imp-root *, .imp-root *::before, .imp-root *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
.imp-root {
  background: var(--bg); color: var(--txt);
  font-family: 'Rajdhani', sans-serif;
  overflow-x: hidden; cursor: none;
  min-height: 100vh; position: relative;
}
.imp-root a, .imp-root button { cursor: none; }

/* ── BACKGROUND FX ── */
.imp-scanlines {
  position: fixed; inset: 0; pointer-events: none; z-index: 9000;
  background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.03) 2px,rgba(0,0,0,.03) 3px);
  animation: scan-move 20s linear infinite;
}
@keyframes scan-move { to { background-position: 0 60px; } }

.imp-gbg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(0,245,255,.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,245,255,.018) 1px, transparent 1px);
  background-size: 72px 72px;
  animation: grid-drift 40s linear infinite;
}
@keyframes grid-drift {
  0%   { transform: perspective(600px) rotateX(5deg) translateY(0); }
  100% { transform: perspective(600px) rotateX(5deg) translateY(72px); }
}

/* ── NAV ── */
.imp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 48px;
  background: linear-gradient(180deg, rgba(2,8,16,.98) 0%, rgba(2,8,16,.4) 100%);
  border-bottom: 1px solid rgba(0,245,255,.07);
  backdrop-filter: blur(12px);
}
.imp-nlogo {
  display: flex; align-items: center; gap: 10px;
  background: none; border: none; text-decoration: none;
}
.imp-nlt {
  font-family: 'Orbitron', monospace; font-size: 16px; font-weight: 900;
  color: #fff; letter-spacing: 5px;
  text-shadow: 0 0 24px var(--c);
}
.imp-nst {
  display: flex; align-items: center; gap: 7px;
  font-family: 'Share Tech Mono', monospace; font-size: 9px;
  color: var(--dim); letter-spacing: 2px;
}
.imp-sdot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--grn); box-shadow: 0 0 8px var(--grn);
  animation: blink 2.2s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

.imp-nlinks { display: flex; gap: 30px; align-items: center; }
.imp-nlinks button {
  font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700;
  color: #c8eeff; letter-spacing: 3px; text-transform: uppercase;
  transition: color .25s, text-shadow .25s; background: none; border: none;
  position: relative;
  text-shadow: 0 0 8px rgba(0,245,255,.55), 0 0 18px rgba(0,245,255,.25);
}
.imp-nlinks button::after {
  content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
  height: 1px; background: var(--c); transform: scaleX(0);
  transition: transform .25s;
  box-shadow: 0 0 8px var(--c);
}
.imp-nlinks button:hover { color: #fff; text-shadow: 0 0 10px rgba(0,245,255,1), 0 0 22px rgba(0,245,255,.8); }
.imp-nlinks button:hover::after { transform: scaleX(1); }
.imp-nyr {
  font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700;
  color: var(--c); letter-spacing: 3px; text-shadow: 0 0 10px var(--c);
}

/* ── HUD OVERLAYS ── */
.imp-hud {
  position: fixed; font-family: 'Share Tech Mono', monospace;
  font-size: 8.5px; color: rgba(0,245,255,.3); letter-spacing: 1.5px;
  pointer-events: none; z-index: 500; line-height: 1.9;
}
.imp-htl { top: 90px; left: 22px; }
.imp-htr { top: 90px; right: 22px; text-align: right; }
.imp-hbl { bottom: 46px; left: 22px; }
.imp-hbr { bottom: 46px; right: 22px; text-align: right; }

/* ── PAGE SYSTEM ── */
.imp-page {
  position: relative; z-index: 10; min-height: 100vh;
  opacity: 0; transform: translateY(18px);
  transition: opacity .5s cubic-bezier(.4,0,.2,1), transform .5s cubic-bezier(.4,0,.2,1);
  display: none; flex-direction: column;
}
.imp-page.active { display: flex; }
.imp-page.visible { opacity: 1; transform: translateY(0); }

/* ── HERO LANDING ── */
.imp-hero {
  text-align: center; position: relative;
  padding: 54px 24px 30px; z-index: 10;
  width: 100%; max-width: 1100px; margin: 0 auto;
  pointer-events: none;
}
.imp-hero button, .imp-hero a { pointer-events: auto; }

.imp-h-ather {
  font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700;
  letter-spacing: 8px; color: #fff; margin-bottom: 22px;
  display: flex; align-items: center; justify-content: center; gap: 14px;
  animation: fadeUp .9s ease both;
  text-shadow: 0 0 10px rgba(0,245,255,1), 0 0 24px rgba(0,245,255,.75);
}
.imp-aico {
  width: 18px; height: 18px; border: 1px solid var(--c);
  transform: rotate(45deg); display: inline-flex;
  align-items: center; justify-content: center;
  box-shadow: 0 0 8px var(--c); font-size: 8px; color: var(--c);
}

.imp-htitle {
  font-family: 'Orbitron', monospace;
  font-size: clamp(72px,12vw,160px); font-weight: 900;
  line-height: .9; color: #fff; letter-spacing: 8px;
  text-transform: uppercase;
  animation: fadeDown 1s ease .15s both;
}

.imp-hsub {
  font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 500;
  letter-spacing: 7px; color: var(--c); text-transform: uppercase;
  margin-top: 12px; animation: fadeUp .9s ease .35s both;
}
.imp-htag {
  font-family: 'Share Tech Mono', monospace; font-size: 11px;
  color: var(--dim); letter-spacing: 3px; margin-top: 14px;
  animation: fadeUp .9s ease .5s both;
}

.imp-hcta {
  display: flex; gap: 18px; justify-content: center;
  margin-top: 42px; animation: fadeUp .9s ease .65s both;
}
.imp-btnp {
  font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase;
  padding: 14px 42px; background: var(--c); color: var(--bg);
  border: none;
  clip-path: polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%);
  transition: all .22s; box-shadow: 0 0 32px rgba(0,245,255,0.5);
  display: inline-block;
}
.imp-btnp:hover { box-shadow: 0 0 60px rgba(0,245,255,0.9); transform: translateY(-2px); }

/* ── COUNTDOWN ── */
.imp-hcd {
  display: flex; gap: 0; justify-content: center;
  margin-top: 38px; animation: fadeUp .9s ease .8s both;
}
.imp-cdi {
  text-align: center; padding: 0 24px;
  border-right: 1px solid rgba(0,245,255,0.12);
}
.imp-cdi:last-child { border-right: none; }
.imp-cdn {
  font-family: 'Orbitron', monospace; font-size: 38px; font-weight: 700;
  color: var(--c); text-shadow: 0 0 20px var(--c);
  display: block; line-height: 1;
}
.imp-cdl {
  font-family: 'Share Tech Mono', monospace; font-size: 8px;
  letter-spacing: 3px; color: var(--dim); text-transform: uppercase;
  margin-top: 5px; display: block;
}

/* ── TICKER ── */
.imp-ticker-wrap {
  width: 100%; overflow: hidden;
  background: rgba(0,245,255,0.03);
  border-top: 1px solid rgba(0,245,255,0.07);
  padding: 9px 0; position: relative; z-index: 10;
}
.imp-ticker {
  display: flex; gap: 52px; white-space: nowrap;
  animation: tick 36s linear infinite;
  font-family: 'Share Tech Mono', monospace; font-size: 10px;
  color: var(--dim); letter-spacing: 2px;
}
@keyframes tick { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
.imp-tsp { color: var(--c); }

/* ── AUTH PANEL ── */
.imp-apanel {
  background: var(--panel);
  border: 1px solid var(--pb);
  padding: 38px 34px; height: 100%;
  position: relative; backdrop-filter: blur(20px);
  display: flex; flex-direction: column; overflow: hidden;
}
.imp-apanel::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--c), transparent);
  animation: sweep-line 4s ease-in-out infinite;
}
@keyframes sweep-line { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }

/* Corner brackets */
.imp-pc { position: absolute; width: 18px; height: 18px; border-color: var(--c); border-style: solid; opacity: .6; }
.imp-pc-tl { top: 0; left: 0; border-width: 2px 0 0 2px; }
.imp-pc-bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; }
.imp-pc-tr { top: 0; right: 0; border-width: 2px 2px 0 0; }
.imp-pc-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

.imp-apt {
  font-family: 'Orbitron', monospace; font-size: 22px; font-weight: 700;
  letter-spacing: 5px; text-transform: uppercase; margin-bottom: 4px;
}
.imp-aps {
  font-family: 'Share Tech Mono', monospace; font-size: 9px;
  letter-spacing: 3px; color: var(--dim); text-transform: uppercase;
  margin-bottom: 28px;
}

/* ── FORM ELEMENTS ── */
.imp-flabel {
  display: block; font-family: 'Share Tech Mono', monospace; font-size: 9px;
  font-weight: 600; letter-spacing: 3px; color: var(--c); margin-bottom: 7px;
  text-transform: uppercase;
}
.imp-fg { margin-bottom: 18px; }
.imp-iw { position: relative; }
.imp-iico {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  font-size: 13px; opacity: .35;
}
.imp-finput {
  width: 100%; background: rgba(0,0,0,.55);
  border: 1px solid rgba(0,245,255,0.14);
  color: var(--txt); font-family: 'Rajdhani', sans-serif;
  font-size: 14px; padding: 11px 12px 11px 38px;
  outline: none; transition: border-color .2s, box-shadow .2s;
  font-weight: 500;
}
.imp-finput:focus {
  border-color: var(--c);
  box-shadow: 0 0 18px rgba(0,245,255,0.15);
  background: rgba(0,245,255,0.025);
}
.imp-finput::placeholder { color: var(--dim); }

.imp-btnauth {
  width: 100%; font-family: 'Orbitron', monospace; font-size: 12px;
  font-weight: 700; letter-spacing: 4px; text-transform: uppercase;
  padding: 14px 20px; border: none; transition: all .22s;
  position: relative; overflow: hidden; margin-top: auto;
  display: flex; align-items: center; justify-content: center;
  text-align: center;
}
.imp-btnc { background: var(--c); color: var(--bg); box-shadow: 0 0 32px rgba(0,245,255,0.4); }
.imp-btnc:hover { box-shadow: 0 0 56px rgba(0,245,255,0.8); transform: translateY(-1px); }

/* ── ALERTS ── */
.imp-alert {
  display: none; background: rgba(255,59,92,0.08);
  border: 1px solid rgba(255,59,92,0.3); color: var(--red);
  font-family: 'Share Tech Mono', monospace; font-size: 9.5px;
  padding: 9px 12px; margin-bottom: 16px; letter-spacing: 1px;
}
.imp-succ {
  display: none; background: rgba(0,255,136,0.07);
  border: 1px solid rgba(0,255,136,0.3); color: var(--grn);
  font-family: 'Share Tech Mono', monospace; font-size: 9.5px;
  padding: 9px 12px; margin-bottom: 16px; letter-spacing: 1px;
}
.imp-show { display: block !important; }

.imp-backlink {
  font-family: 'Share Tech Mono', monospace; font-size: 9px;
  color: var(--c); letter-spacing: 2px; transition: opacity 0.2s;
  opacity: 0.6; background: none; border: none;
}
.imp-backlink:hover { opacity: 1; }

/* ── LOADER ── */
#imp-loader {
  position: fixed; inset: 0; z-index: 99990; background: #000208;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden; transition: opacity 1.8s ease;
}
#imp-loader.fade-out { opacity: 0; pointer-events: none; }

#imp-loader-status {
  position: absolute; top: 128px; left: 50%; transform: translateX(-50%);
  font-family: 'Share Tech Mono', monospace; font-size: 9px;
  letter-spacing: 2px; color: rgba(0,255,136,0.8); z-index: 10;
  white-space: nowrap; min-width: 320px; text-align: center;
  transition: opacity 0.3s;
}

#imp-hold-btn {
  position: absolute; bottom: 98px; left: 50%; transform: translateX(-50%);
  z-index: 10; font-family: 'Orbitron', monospace; font-size: 11px;
  font-weight: 700; letter-spacing: 4px; color: var(--bg);
  background: var(--c); border: none; padding: 14px 52px;
  clip-path: polygon(14px 0%,100% 0%,calc(100% - 14px) 100%,0% 100%);
  box-shadow: 0 0 36px rgba(0,245,255,0.75);
}
#imp-hold-btn.held { transform: translateX(-50%) scale(1.06); box-shadow: 0 0 100px #00f5ff; }

#imp-loader-bar-wrap {
  position: absolute; bottom: 38px; left: 50%; transform: translateX(-50%);
  width: 380px; z-index: 10;
}
#imp-loader-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--p), var(--c));
  box-shadow: 0 0 12px var(--c); transition: width 0.08s linear;
}

@keyframes fadeUp   { from { opacity:0; transform: translateY(-14px); } to { opacity:1; transform: translateY(0); } }
@keyframes fadeDown { from { opacity:0; transform: translateY(14px);  } to { opacity:1; transform: translateY(0); } }
@keyframes imp-spin { to { transform: rotate(360deg); } }
`;

// ─── LOADER ──────────────────────────────────────────────────────────────────
function Loader({ onDone }) {
  const canvasRef = useRef(null);
  const btnRef = useRef(null);
  const barFillRef = useRef(null);
  const barPctRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const btn = btnRef.current;
    const barFill = barFillRef.current;
    const barPct = barPctRef.current;
    const statusEl = statusRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let W, H;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);

    const TOTAL_DUR = 3000, BASE_SPD = 1/TOTAL_DUR, HELD_SPD = BASE_SPD*10;
    let held=false, progress=0, done=false;

    const STATUSES = [
      "[ SYS ] BOOTING COMBAT AI...",
      "[ CPU ] LOADING NEURAL MATRIX",
      "[ GPU ] RENDERING INTERFACE",
      "[ NET ] SYNCING TELEMETRY",
      "[ OK  ] SYSTEM READY",
    ];
    
    let lastTs=0, rafId;
    function frame(ts){
      const dt=Math.min(ts-lastTs,50); lastTs=ts;
      if(!done) progress=Math.min(1,progress+(held?HELD_SPD:BASE_SPD)*dt);
      const pct=Math.round(progress*100);
      if(barFill) barFill.style.width=pct+"%";
      if(barPct) barPct.textContent=pct;
      
      if(statusEl) {
        const idx = Math.min(Math.floor(progress * STATUSES.length), STATUSES.length - 1);
        statusEl.textContent = STATUSES[idx];
      }

      ctx.clearRect(0,0,W,H);
      // Simple background dots
      ctx.fillStyle = "rgba(0,245,255,0.1)";
      for(let i=0; i<50; i++) {
        const x = (Math.sin(i*1.7+ts/1000)*0.5+0.5)*W;
        const y = (Math.cos(i*2.3+ts/1000)*0.5+0.5)*H;
        ctx.beginPath(); ctx.arc(x,y,1,0,Math.PI*2); ctx.fill();
      }

      if(progress>=1&&!done){
        done=true;
        const el=document.getElementById("imp-loader");
        if(el) el.classList.add("fade-out");
        setTimeout(()=>onDone(), 1000);
        return;
      }
      rafId=requestAnimationFrame(frame);
    }

    const setHeld=(v)=>{ held=v; if(btn) v?btn.classList.add("held"):btn.classList.remove("held"); };
    if(btn){
      btn.addEventListener("mousedown",()=>setHeld(true));
      btn.addEventListener("touchstart",(e)=>{e.preventDefault();setHeld(true);},{passive:false});
    }
    window.addEventListener("mouseup",()=>setHeld(false));
    window.addEventListener("touchend",()=>setHeld(false));
    rafId=requestAnimationFrame(frame);

    return ()=>{ cancelAnimationFrame(rafId); window.removeEventListener("resize",resize); };
  },[onDone]);

  return (
    <div id="imp-loader">
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
      <div id="imp-loader-status" ref={statusRef}>[ SYS ] BOOTING...</div>
      <button id="imp-hold-btn" ref={btnRef}>HOLD TO ACCELERATE</button>
      <div id="imp-loader-bar-wrap">
        <div style={{color:"#00f5ff",fontSize:8,textAlign:"center",marginBottom:8}}>BOOT SEQUENCE: <span ref={barPctRef}>0</span>%</div>
        <div style={{width:"100%",height:2,background:"rgba(0,245,255,0.1)"}}>
          <div id="imp-loader-bar-fill" ref={barFillRef} style={{width:"0%"}}></div>
        </div>
      </div>
    </div>
  );
}

// ─── ROBOTIC LAB BACKGROUND ──────────────────────────────────────────────────
function RoboticLab() {
  return (
    <div style={{position:"absolute",inset:0,zIndex:0,overflow:"hidden",pointerEvents:"none"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 50%, rgba(2,12,28,0.8) 0%, rgba(0,2,8,1) 100%)"}} />
      {[...Array(20)].map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          width:2, height:2,
          background:"#00f5ff",
          left:`${Math.random()*100}%`,
          top:`${Math.random()*100}%`,
          opacity:0.3,
          animation:`p-float ${4+Math.random()*4}s linear infinite`,
          animationDelay:`${Math.random()*5}s`
        }}></div>
      ))}
      <style>{`
        @keyframes p-float { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(-100px); opacity: 0; } }
      `}</style>
    </div>
  );
}

// ─── CINEMATIC SPACE BACKGROUND ──────────────────────────────────────────────
function CinematicSpace() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:0,overflow:"hidden",pointerEvents:"none"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 50% 50%, rgba(2,12,28,1) 0%, rgba(0,2,8,1) 100%)"}} />
      <div style={{position:"absolute",width:"80%",height:"80%",left:"10%",top:"10%",background:"radial-gradient(circle, rgba(0,245,255,0.03) 0%, transparent 70%)",filter:"blur(60px)",animation:"nebula-pulse 12s ease-in-out infinite"}} />
      <div style={{position:"absolute",width:"60%",height:"60%",right:"5%",bottom:"5%",background:"radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 70%)",filter:"blur(50px)",animation:"nebula-pulse 15s ease-in-out infinite alternate"}} />
      {[...Array(40)].map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          width:Math.random()*2+1,
          height:Math.random()*2+1,
          background:"#fff",
          borderRadius:"50%",
          left:`${Math.random()*100}%`,
          top:`${Math.random()*100}%`,
          opacity:Math.random()*0.5+0.2,
          animation:`star-flicker ${Math.random()*3+2}s ease-in-out infinite`
        }} />
      ))}
      <style>{`
        @keyframes nebula-pulse { 0%,100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.1); opacity: 0.5; } }
        @keyframes star-flicker { 0%,100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
      `}</style>
    </div>
  );
}

// ─── CURSOR ──────────────────────────────────────────────────────────────────
function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  useEffect(() => {
    let rx = -100, ry = -100, dx = -100, dy = -100;
    const onMove = (e) => { dx = e.clientX; dy = e.clientY; };
    document.addEventListener("mousemove", onMove, {passive: true});
    function frame() {
      rx += (dx - rx) * 0.15; ry += (dy - ry) * 0.15;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${dx-4}px,${dy-4}px,0)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx-16}px,${ry-16}px,0)`;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <>
      <div ref={dotRef} style={{position:"fixed",top:0,left:0,width:8,height:8,borderRadius:"50%",background:"#00f5ff",boxShadow:"0 0 8px #00f5ff",pointerEvents:"none",zIndex:999999}} />
      <div ref={ringRef} style={{position:"fixed",top:0,left:0,width:32,height:32,borderRadius:"50%",border:"1.5px solid rgba(0,245,255,0.6)",pointerEvents:"none",zIndex:999998}} />
    </>
  );
}

function CursorWrapper({page}) {
  if (page === 'plog') return null;
  return <Cursor />;
}

function HudTime() {
  const [t,setT]=useState("");
  useEffect(()=>{
    const tick=()=>{ const n=new Date(); setT("TIME: "+String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0")+":"+String(n.getSeconds()).padStart(2,"0")); };
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  },[]);
  return <>{t}</>;
}

function Countdown() {
  const TARGET = new Date("2026-05-19T05:00:00Z").getTime();
  const [cd,setCd]=useState({d:"00",h:"00",m:"00",s:"00"});
  useEffect(()=>{
    const calc = () => {
      const diff = Math.max(0, TARGET - Date.now());
      return {
        d: String(Math.floor(diff/864e5)).padStart(2,"0"),
        h: String(Math.floor(diff%864e5/36e5)).padStart(2,"0"),
        m: String(Math.floor(diff%36e5/6e4)).padStart(2,"0"),
        s: String(Math.floor(diff%6e4/1e3)).padStart(2,"0"),
      };
    };
    setCd(calc()); const id=setInterval(()=>setCd(calc()),1000); return ()=>clearInterval(id);
  },[]);
  return (
    <div className="imp-hcd">
      {[["d","DAYS"],["h","HOURS"],["m","MINUTES"],["s","SECONDS"]].map(([k,l])=>(
        <div className="imp-cdi" key={k}><span className="imp-cdn">{cd[k]}</span><span className="imp-cdl">{l}</span></div>
      ))}
    </div>
  );
}

function Page({id,active,className="",children,style={}}) {
  const ref=useRef(null);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    if(active) { el.style.display="flex"; setTimeout(()=>el.classList.add("visible"), 50); }
    else { el.classList.remove("visible"); setTimeout(()=>{ el.style.display="none"; },400); }
  },[active]);
  return <div ref={ref} id={id} className={`imp-page ${className}`} style={{display:"none",paddingTop:76,...style}}>{children}</div>;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function ImperiumPage() {
  const navigate = useNavigate();
  const [loaderDone,setLoaderDone]=useState(false);
  const [page,setPage]=useState("lore");
  const [loginAlert,setLoginAlert]=useState(""); const [loginSucc,setLoginSucc]=useState("");
  const [loginEmail,setLoginEmail]=useState(""); const [loginPwd,setLoginPwd]=useState("");
  const [loginLoading,setLoginLoading]=useState(false);
  const [showIntro,setShowIntro]=useState(false);

  const go=useCallback((id)=>{
    setPage(id); setLoginAlert(""); setLoginSucc("");
    window.scrollTo({top:0,behavior:"smooth"});
  },[]);

  async function doLogin() {
    if(loginLoading) return;
    setLoginAlert(""); setLoginSucc("");
    if(!loginEmail||!loginPwd){setLoginAlert("⚠ FILL ALL REQUIRED FIELDS.");return;}
    setLoginLoading(true);
    try {
      const res = await fetch("https://imperium-api-kfob.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPwd })
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginAlert("⚠ " + (data.detail ? data.detail.toUpperCase() : "INVALID CREDENTIALS."));
        setLoginLoading(false);
        return;
      }
      localStorage.setItem("imperium_user_id", data.user_id);
      setLoginSucc("✓ ACCESS GRANTED. ENTERING IMPERIUM...");
      const introKey = `imperium_intro_seen_${data.user_id}`;
      if (!localStorage.getItem(introKey)) {
        localStorage.setItem(introKey, "true");
        setTimeout(()=>setShowIntro(true), 2000);
      } else {
        setTimeout(()=>navigate({ to: '/dashboard' }), 2000);
      }
    } catch (err) {
      setLoginAlert("⚠ CONNECTION ERROR TO ATHERA MAINFRAME.");
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <div className="imp-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {!loaderDone && <Loader onDone={()=>setLoaderDone(true)} />}
      {showIntro && <IntroSequence onComplete={()=>navigate({ to: '/dashboard' })} />}
      <CursorWrapper page={page} />
      <div className="imp-scanlines"></div>
      <div className="imp-gbg"></div>
      {page !== 'plog' && <CinematicSpace />}

      {/* HUD */}
      <div className="imp-hud imp-htl">SYS.STATUS: <span style={{color:"var(--grn)"}}>ONLINE</span><br/>NODE: 2080.ATHER.NET<br/><HudTime /></div>
      <div className="imp-hud imp-htr">THREAT: <span style={{color:"var(--red)"}}>CRITICAL</span><br/>SECTORS.HIT: 04<br/>MISSION: ACTIVE</div>
      <div className="imp-hud imp-hbl">BUILD: v2080.IMPERIUM<br/>QSH: ENABLED</div>
      <div className="imp-hud imp-hbr">ATHER.TECH.CORP<br/>© 2080 IMPERIUM</div>

      {/* NAV */}
      <nav className="imp-nav">
        <button className="imp-nlogo" onClick={()=>go("pl")}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 4L20 14L28 8L24 20H8L4 8L12 14L16 4Z" stroke="#00f5ff" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <rect x="8" y="22" width="16" height="4" rx="1" fill="rgba(0,245,255,.22)" stroke="#00f5ff" strokeWidth="1"/>
          </svg>
          <span className="imp-nlt">IMPERIUM</span>
        </button>
        <div className="imp-nst"><div className="imp-sdot"></div>ATHERA · SYSTEM ONLINE · 2080</div>
        <div className="imp-nyr">2080</div>
      </nav>

      {/* ── LORE SCREEN ── */}
      <Page id="lore" active={page==="lore"} style={{alignItems:"center",justifyContent:"center",padding:"24px"}}>
        <RoboticLab />
        <div style={{position:"relative",zIndex:10,maxWidth:760,background:"rgba(2,8,16,0.85)",border:"1px solid rgba(0,245,255,0.15)",padding:"40px 48px",backdropFilter:"blur(12px)"}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:"#00f5ff",letterSpacing:4,marginBottom:18}}>YEAR 2080.</div>
          <div style={{fontSize:17,color:"#b0d4e8",lineHeight:1.7,marginBottom:16}}>The world is controlled by <strong>IMPERIUM</strong> — a super AI built inside Athera Labs.</div>
          <div style={{fontSize:17,color:"#b0d4e8",lineHeight:1.7,marginBottom:28}}>Only unpredictable human minds can stop the outbreak.</div>
          <div style={{display:"flex",justifyContent:"center"}}><button className="imp-btnp" onClick={() => go("pl")}>CONTINUE</button></div>
        </div>
      </Page>

      {/* ── LANDING ── */}
      <Page id="pl" active={page==="pl"} style={{alignItems:"center",justifyContent:"center"}}>
        <RoboticLab />
        <div className="imp-hero">
          <div className="imp-h-ather"><span className="imp-aico">◆</span>ATHERA PRESENTS<span className="imp-aico">◆</span></div>
          <h1 className="imp-htitle"><img src="/imperium-logo.png" alt="IMPERIUM" style={{ width: "100%", maxWidth: 600, filter: "drop-shadow(0 0 35px #00f5ff)" }} /></h1>
          <div className="imp-hsub">— AN IMMERSIVE AI CHALLENGE —</div>
          <div className="imp-hcta"><button className="imp-btnp" onClick={()=>go("plog")}>LOGIN</button></div>
          <Countdown />
        </div>
      </Page>

      {/* ── LOGIN ── */}
      <Page id="plog" active={page==="plog"} style={{alignItems:"center",justifyContent:"center",padding:"90px 24px 40px"}}>
        <div style={{position:"relative",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:460}}>
          <img src="/imperium-logo.png" alt="IMPERIUM" style={{width: "100%", maxWidth: 400, filter: "drop-shadow(0 0 15px #00f5ff)"}} />
          <div className="imp-apanel" style={{width:"100%",padding:"32px 30px 26px"}}>
            <div className="imp-pc imp-pc-tl"/><div className="imp-pc imp-pc-tr"/><div className="imp-pc imp-pc-bl"/><div className="imp-pc imp-pc-br"/>
            <div className="imp-apt">LOGIN</div>
            <div className="imp-aps">WELCOME BACK, RECRUIT.</div>
            {loginAlert && <div className="imp-alert imp-show">{loginAlert}</div>}
            {loginSucc  && <div className="imp-succ imp-show">{loginSucc}</div>}
            <div className="imp-fg">
              <label className="imp-flabel">USERNAME</label>
              <div className="imp-iw">
                <input type="text" className="imp-finput" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} style={{cursor:"text"}} />
              </div>
            </div>
            <div className="imp-fg">
              <label className="imp-flabel">PASSWORD</label>
              <div className="imp-iw">
                <input type="password" className="imp-finput" value={loginPwd} onChange={e=>setLoginPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} style={{cursor:"text"}} />
              </div>
            </div>
            <button className="imp-btnauth imp-btnc" onClick={doLogin} style={{opacity:loginLoading?0.6:1}}>{loginLoading ? "AUTHENTICATING..." : "INITIATE LOGIN"}</button>
            <button className="imp-backlink" onClick={()=>go("pl")} style={{marginTop:20}}>← BACK TO BASE</button>
          </div>
        </div>
      </Page>
    </div>
  );
}
