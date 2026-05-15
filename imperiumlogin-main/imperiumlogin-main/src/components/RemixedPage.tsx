// @ts-nocheck
"use client";
import { useState, useEffect, useRef, useCallback } from "react";

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

/* cursor: none applied globally via imp-root */

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
  text-shadow:
    0 0 8px rgba(0,245,255,.55),
    0 0 18px rgba(0,245,255,.25);
}
.imp-nlinks button::after {
  content: ''; position: absolute; bottom: -4px; left: 0; right: 0;
  height: 1px; background: var(--c); transform: scaleX(0);
  transition: transform .25s;
  box-shadow: 0 0 8px var(--c);
}
.imp-nlinks button:hover {
  color: #fff;
  text-shadow:
    0 0 10px rgba(0,245,255,1),
    0 0 22px rgba(0,245,255,.8),
    0 0 45px rgba(0,245,255,.45),
    0 0 80px rgba(0,200,255,.2);
}
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
  text-shadow:
    0 0 10px rgba(0,245,255,1),
    0 0 24px rgba(0,245,255,.75),
    0 0 52px rgba(0,245,255,.4),
    0 0 90px rgba(0,200,255,.2);
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
.imp-gt {
  text-shadow:
    0 0 18px rgba(0,245,255,.35),
    0 0 36px rgba(0,245,255,.15),
    0 0 72px rgba(0,245,255,.06);
  animation: title-flicker 6s ease-in-out infinite;
}
@keyframes title-flicker {
  0%,100% { text-shadow: 0 0 18px rgba(0,245,255,.35),0 0 36px rgba(0,245,255,.15); }
  89%,92%  { text-shadow: 0 0 18px rgba(0,245,255,.35),0 0 36px rgba(0,245,255,.15); }
  90%      { text-shadow: 0 0 4px rgba(0,245,255,.08); }
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
  transition: all .22s; box-shadow: 0 0 32px rgba(0,245,255,.5);
  display: inline-block;
}
.imp-btnp:hover { box-shadow: 0 0 60px rgba(0,245,255,.9); transform: translateY(-2px); }
.imp-btns {
  font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase;
  padding: 14px 42px; background: transparent; color: var(--c);
  border: 1.5px solid rgba(0,245,255,.5);
  clip-path: polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%);
  transition: all .22s; display: inline-block;
}
.imp-btns:hover { background: rgba(0,245,255,.07); box-shadow: 0 0 24px rgba(0,245,255,.25); transform: translateY(-2px); }

/* ── COUNTDOWN ── */
.imp-hcd {
  display: flex; gap: 0; justify-content: center;
  margin-top: 38px; animation: fadeUp .9s ease .8s both;
}
.imp-cdi {
  text-align: center; padding: 0 24px;
  border-right: 1px solid rgba(0,245,255,.12);
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

/* ── SECTORS BAR ── */
.imp-sectors {
  display: flex; width: 100%; margin-top: 52px;
  border-top: 1px solid rgba(0,245,255,.06);
  border-bottom: 1px solid rgba(0,245,255,.06);
  background: rgba(0,6,16,.6); animation: fadeUp .9s ease 1s both;
  position: relative; z-index: 10;
}
.imp-sec {
  flex: 1; padding: 22px 16px;
  border-right: 1px solid rgba(0,245,255,.06);
  text-align: center; position: relative;
  overflow: hidden; transition: background .25s;
}
.imp-sec:last-child { border-right: none; }
.imp-sec:hover { background: rgba(0,245,255,.03); }
.imp-sec-ico { font-size: 22px; display: block; margin-bottom: 7px; }
.imp-sec-title {
  font-family: 'Orbitron', monospace; font-size: 9px; font-weight: 700;
  letter-spacing: 2px; margin-bottom: 5px; text-transform: uppercase;
}
.imp-sec-status { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 2px; }
.imp-sec-bar {
  position: absolute; bottom: 0; left: 0; height: 2px;
  animation: bar-glow 3s ease-in-out infinite;
}
@keyframes bar-glow { 0%,100%{opacity:.5} 50%{opacity:1} }

/* ── TICKER ── */
.imp-ticker-wrap {
  width: 100%; overflow: hidden;
  background: rgba(0,245,255,.03);
  border-top: 1px solid rgba(0,245,255,.07);
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

/* ── FOOTER BAR ── */
.imp-fbar {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  padding: 14px 48px;
  border-top: 1px solid rgba(0,245,255,.05);
  background: rgba(2,8,16,.9);
  font-family: 'Share Tech Mono', monospace; font-size: 8.5px;
  color: var(--dim); letter-spacing: 1.5px; margin-top: auto;
  position: relative; z-index: 10;
}

/* ── AUTH LAYOUT ── */
.imp-auth-wrap {
  display: flex; gap: 0; width: 100%; max-width: 1080px;
  min-height: 580px; position: relative; margin: 0 auto;
}
.imp-auth-side { flex: 1; position: relative; }
.imp-auth-center {
  width: 320px; flex-shrink: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 36px 20px; position: relative;
}
.imp-auth-center::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 80%, rgba(0,245,255,.05) 0%, transparent 70%);
  pointer-events: none;
}

.imp-aclogo {
  font-family: 'Orbitron', monospace; font-size: 30px; font-weight: 900;
  color: #fff; letter-spacing: 5px;
  text-shadow: 0 0 40px var(--c), 0 0 80px rgba(0,245,255,.2);
  text-align: center; margin-top: 14px;
  animation: title-flicker 5s ease-in-out infinite;
}
.imp-acsub {
  font-family: 'Rajdhani', sans-serif; font-size: 10px;
  letter-spacing: 4px; color: var(--c);
  text-transform: uppercase; text-align: center; margin-top: 7px;
}
.imp-actag {
  font-family: 'Share Tech Mono', monospace; font-size: 9px;
  color: var(--dim); text-align: center; letter-spacing: 2px;
  margin-top: 16px; line-height: 2;
}

.imp-atwr {
  width: 2px; height: 90px;
  background: linear-gradient(180deg, transparent, var(--c), transparent);
  margin: 16px auto; box-shadow: 0 0 10px var(--c);
  animation: pulse-wire 2s ease-in-out infinite;
}
@keyframes pulse-wire { 0%,100%{opacity:1} 50%{opacity:.15} }

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

/* Panel scanline */
.imp-apanel::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,245,255,.012) 4px, rgba(0,245,255,.012) 5px);
}

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
  border: 1px solid rgba(0,245,255,.14);
  color: var(--txt); font-family: 'Rajdhani', sans-serif;
  font-size: 14px; padding: 11px 12px 11px 38px;
  outline: none; transition: border-color .2s, box-shadow .2s;
  font-weight: 500;
}
.imp-finput:focus {
  border-color: var(--c);
  box-shadow: 0 0 18px rgba(0,245,255,.15), inset 0 0 8px rgba(0,245,255,.04);
  background: rgba(0,245,255,.025);
}
.imp-finput::placeholder { color: var(--dim); }

/* Animated underline on focus */
.imp-iw::after {
  content: ''; position: absolute; bottom: 0; left: 0;
  width: 0; height: 1px; background: var(--c);
  transition: width .35s ease;
}
.imp-iw:focus-within::after { width: 100%; }

.imp-frow { display: flex; gap: 14px; }
.imp-frow .imp-fg { flex: 1; }
.imp-flink {
  font-family: 'Share Tech Mono', monospace; font-size: 9px; color: var(--c);
  text-decoration: none; display: block; text-align: right; margin-top: 6px;
  opacity: .55; transition: opacity .2s; background: none; border: none;
  letter-spacing: 1px;
}
.imp-flink:hover { opacity: 1; }

/* ── AUTH BUTTON ── */
.imp-btnauth {
  width: 100%; font-family: 'Orbitron', monospace; font-size: 12px;
  font-weight: 700; letter-spacing: 4px; text-transform: uppercase;
  padding: 14px 20px; border: none; transition: all .22s;
  position: relative; overflow: hidden; margin-top: auto;
  display: flex; align-items: center; justify-content: center;
  text-align: center;
}
.imp-btnauth::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent);
  transition: left .4s;
}
.imp-btnauth:hover::before { left: 100%; }
.imp-btnc { background: var(--c); color: var(--bg); box-shadow: 0 0 32px rgba(0,245,255,.4); }
.imp-btnc:hover { box-shadow: 0 0 56px rgba(0,245,255,.8); transform: translateY(-1px); }
.imp-btnpur { background: var(--p); color: #fff; box-shadow: 0 0 32px rgba(168,85,247,.4); }
.imp-btnpur:hover { box-shadow: 0 0 56px rgba(168,85,247,.8); transform: translateY(-1px); }

.imp-aswitch {
  font-family: 'Rajdhani', sans-serif; font-size: 12px;
  color: var(--dim); text-align: center; margin-top: 18px;
}
.imp-aswitch button {
  color: var(--c); font-weight: 600; background: none; border: none;
  font-family: 'Rajdhani', sans-serif; font-size: 12px;
}

/* ── ALERTS ── */
.imp-alert {
  display: none; background: rgba(255,59,92,.08);
  border: 1px solid rgba(255,59,92,.3); color: var(--red);
  font-family: 'Share Tech Mono', monospace; font-size: 9.5px;
  padding: 9px 12px; margin-bottom: 16px; letter-spacing: 1px;
}
.imp-succ {
  display: none; background: rgba(0,255,136,.07);
  border: 1px solid rgba(0,255,136,.3); color: var(--grn);
  font-family: 'Share Tech Mono', monospace; font-size: 9.5px;
  padding: 9px 12px; margin-bottom: 16px; letter-spacing: 1px;
}
.imp-show { display: block !important; }

/* ── GHOST PANEL ── */
.imp-ghost-panel {
  flex: 1; border: 1px solid rgba(0,245,255,.05);
  background: rgba(0,5,14,.5);
  display: flex; align-items: flex-start; justify-content: center;
  padding: 44px 24px; opacity: .2; pointer-events: none;
}
.imp-ghost-txt {
  font-family: 'Share Tech Mono', monospace; font-size: 10px;
  color: var(--dim); letter-spacing: 1.5px; line-height: 2.1; text-align: center;
}

/* ── TEAM MEMBERS ── */
.imp-tms { margin-top: 10px; }
.imp-tmh { display: flex; justify-content: space-between; align-items: center; margin-bottom: 11px; }
.imp-tml { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: var(--p); text-transform: uppercase; }
.imp-tmb {
  font-family: 'Share Tech Mono', monospace; font-size: 9px; color: var(--dim);
  background: rgba(168,85,247,.1); border: 1px solid rgba(168,85,247,.2);
  padding: 2px 10px; letter-spacing: 1px;
}
.imp-mslots { display: flex; flex-direction: column; gap: 8px; }
.imp-mslot { display: flex; align-items: center; gap: 8px; }
.imp-mnum { font-family: 'Orbitron', monospace; font-size: 8px; font-weight: 700; color: var(--p); width: 18px; text-align: center; opacity: .55; }
.imp-mslot .imp-iw { flex: 1; }
.imp-mslot .imp-iw.sm { width: 148px; flex: none; }
.imp-mslot .imp-finput { font-size: 12px; padding: 8px 10px 8px 34px; }
.imp-mslot .imp-finput:disabled { opacity: .2; cursor: not-allowed; }
.imp-btnadd, .imp-btnrm {
  width: 28px; height: 28px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(168,85,247,.3); background: rgba(168,85,247,.07);
  color: var(--p); font-size: 16px; font-weight: 700; transition: all .2s;
}
.imp-btnadd:hover { background: rgba(168,85,247,.18); }
.imp-btnrm { border-color: rgba(255,59,92,.3); background: rgba(255,59,92,.07); color: var(--red); }
.imp-btnrm:hover { background: rgba(255,59,92,.18); }
.imp-req { font-family: 'Share Tech Mono', monospace; font-size: 7px; color: var(--red); letter-spacing: 1px; }

.imp-fcheck { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 18px; }
.imp-fcheck input { width: 13px; height: 13px; flex-shrink: 0; margin-top: 2px; accent-color: var(--p); }
.imp-fcheck label { font-family: 'Rajdhani', sans-serif; font-size: 12px; color: var(--dim); line-height: 1.55; }
.imp-fcheck label a { color: var(--p); text-decoration: none; }

/* ── PURPLE VARIANT ── */
.imp-preg .imp-flabel { color: var(--p); }
.imp-preg .imp-finput:focus { border-color: var(--p); box-shadow: 0 0 18px rgba(168,85,247,.15); background: rgba(168,85,247,.025); }
.imp-preg .imp-apanel::before { background: linear-gradient(90deg, transparent, var(--p), transparent); }
.imp-preg .imp-pc { border-color: var(--p); }
.imp-preg .imp-iw::after { background: var(--p); }
.imp-preg .imp-atwr { background: linear-gradient(180deg, transparent, var(--p), transparent); box-shadow: 0 0 10px var(--p); }
.imp-preg .imp-aclogo { text-shadow: 0 0 40px var(--p), 0 0 80px rgba(168,85,247,.2); }
.imp-preg .imp-acsub { color: var(--p); }
.imp-preg .imp-aswitch button { color: var(--p); }

/* ── BACKLINK ── */
.imp-backlink {
  font-family: 'Share Tech Mono', monospace; font-size: 9px;
  color: var(--c); letter-spacing: 2px; transition: opacity .2s;
  opacity: .6; background: none; border: none;
}
.imp-backlink:hover { opacity: 1; }

/* ── LOADER ── */
#imp-loader {
  position: fixed; inset: 0; z-index: 99990; background: #000208;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden; transition: opacity 1.8s ease;
}
#imp-loader.fade-out { opacity: 0; pointer-events: none; }

#imp-loader-title {
  position: absolute; top: 42px; left: 50%; transform: translateX(-50%);
  font-family: 'Orbitron', monospace;
  font-size: clamp(22px,3.2vw,34px); font-weight: 900; color: #fff;
  letter-spacing: 10px; z-index: 10;
  text-shadow: 0 0 50px rgba(0,245,255,1), 0 0 100px rgba(0,245,255,.5);
  white-space: nowrap; animation: title-flicker 4s ease-in-out infinite;
}
#imp-loader-sub {
  position: absolute; top: 98px; left: 50%; transform: translateX(-50%);
  font-family: 'Share Tech Mono', monospace; font-size: 9px;
  letter-spacing: 5px; color: rgba(0,245,255,.4); z-index: 10; white-space: nowrap;
}
#imp-loader-status {
  position: absolute; top: 128px; left: 50%; transform: translateX(-50%);
  font-family: 'Share Tech Mono', monospace; font-size: 9px;
  letter-spacing: 2px; color: rgba(0,255,136,.8); z-index: 10;
  white-space: nowrap; min-width: 320px; text-align: center;
  transition: opacity .3s;
}

#imp-hold-btn {
  position: absolute; bottom: 98px; left: 50%; transform: translateX(-50%);
  z-index: 10; font-family: 'Orbitron', monospace; font-size: 11px;
  font-weight: 700; letter-spacing: 4px; color: var(--bg);
  background: var(--c); border: none; padding: 14px 52px;
  clip-path: polygon(14px 0%,100% 0%,calc(100% - 14px) 100%,0% 100%);
  box-shadow: 0 0 36px rgba(0,245,255,.75), 0 0 72px rgba(0,245,255,.3);
  user-select: none; touch-action: none;
  transition: box-shadow .15s, transform .15s;
}
#imp-hold-btn.held {
  box-shadow: 0 0 100px rgba(0,245,255,1), 0 0 200px rgba(0,245,255,.6), 0 0 300px rgba(0,245,255,.2);
  transform: translateX(-50%) scale(1.06);
}
.imp-btn-ring {
  position: absolute; inset: -10px;
  border: 1.5px solid rgba(0,245,255,.45);
  clip-path: polygon(14px 0%,100% 0%,calc(100% - 14px) 100%,0% 100%);
  animation: ring-pulse 1.5s ease-in-out infinite; pointer-events: none;
}
@keyframes ring-pulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.9;transform:scale(1.08)} }

#imp-hold-hint {
  position: absolute; bottom: 74px; left: 50%; transform: translateX(-50%);
  font-family: 'Share Tech Mono', monospace; font-size: 8.5px;
  letter-spacing: 3px; color: rgba(0,245,255,.4); white-space: nowrap; z-index: 10;
}

#imp-loader-bar-wrap {
  position: absolute; bottom: 38px; left: 50%; transform: translateX(-50%);
  width: 380px; z-index: 10;
}
#imp-loader-bar-label {
  font-family: 'Share Tech Mono', monospace; font-size: 8px;
  letter-spacing: 3px; color: rgba(0,245,255,.5); text-align: center; margin-bottom: 7px;
}
#imp-loader-bar-track {
  width: 100%; height: 2px; background: rgba(0,245,255,.08); position: relative;
}
#imp-loader-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--p), var(--c));
  box-shadow: 0 0 12px var(--c); transition: width .08s linear;
}
#imp-loader-bar-seg {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: repeating-linear-gradient(90deg,transparent,transparent 31px,rgba(0,0,0,.5) 31px,rgba(0,0,0,.5) 32px);
}

#imp-warp-overlay { position: absolute; inset: 0; z-index: 20; pointer-events: none; }

@keyframes fadeUp   { from { opacity:0; transform: translateY(-14px); } to { opacity:1; transform: translateY(0); } }
@keyframes fadeDown { from { opacity:0; transform: translateY(14px);  } to { opacity:1; transform: translateY(0); } }
`;

// ─── LOADER ──────────────────────────────────────────────────────────────────
function Loader({ onDone }) {
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

    const TOTAL_DUR = 30000, BASE_SPD = 1/TOTAL_DUR, HELD_SPD = BASE_SPD*14;
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
        ctx.save(); ctx.rotate(t*1.5);
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
        ctx.fillStyle=`rgba(${s.col},${s.life*0.85})`; ctx.fill();
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
      <div id="imp-loader-title">IMPERIUM</div>
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

// ─── ROBOTIC LAB BACKGROUND ───────────────────────────────────────────────────
function RoboticLab() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let W, H, rafId;
    let mx = 0.5, my = 0.5;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const onMouse = e => { mx = e.clientX / window.innerWidth; my = e.clientY / window.innerHeight; };
    window.addEventListener("mousemove", onMouse, { passive: true });

    let t = 0;

    // ── FLOATING PARTICLES ────────────────────────────────────────────────────
    const PARTICLES = Array.from({ length: 80 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.5 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.00012,
      vy: -0.00006 - Math.random() * 0.0001,
      a: 0.1 + Math.random() * 0.4,
      col: Math.random() > 0.5 ? "0,245,255" : "100,180,255",
      life: Math.random(),
    }));

    // ── ROBOTIC ARM STATE ──────────────────────────────────────────────────────
    const ARM = {
      baseX: 0.5, baseY: 0.92,
      seg1: 0.18,   // length as fraction of H
      seg2: 0.14,
      seg3: 0.09,
      a1: -1.2, a2: 0.6, a3: -0.4,
      ta1: -1.2, ta2: 0.6, ta3: -0.4,
      gripOpen: 0, tGripOpen: 0,
      mode: "idle", modeT: 0,
    };

    // ── CIRCUIT NODES (wall panel) ─────────────────────────────────────────────
    const NODES = Array.from({ length: 18 }, (_, i) => ({
      x: 0.04 + Math.random() * 0.92,
      y: 0.1 + Math.random() * 0.75,
      r: 2.5 + Math.random() * 3,
      pulse: Math.random() * Math.PI * 2,
      pulseSpd: 0.5 + Math.random() * 1.5,
      col: ["0,245,255","0,180,255","80,220,255","0,255,180"][i % 4],
      active: Math.random() > 0.35,
    }));

    // Circuit edges
    const EDGES = [];
    for (let i = 0; i < NODES.length; i++) {
      for (let j = i + 1; j < NODES.length; j++) {
        const dx = NODES[i].x - NODES[j].x, dy = NODES[i].y - NODES[j].y;
        if (Math.sqrt(dx*dx+dy*dy) < 0.22) EDGES.push([i, j, Math.random()]);
      }
    }

    // ── DATA STREAMS ─────────────────────────────────────────────────────────
    const STREAMS = Array.from({ length: 12 }, (_, i) => ({
      x: 0.05 + i * 0.085,
      y: Math.random(),
      spd: 0.0004 + Math.random() * 0.0006,
      chars: Array.from({ length: 8 }, () => String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))),
      charT: 0,
    }));

    // ── HOLOGRAPHIC DISPLAYS ──────────────────────────────────────────────────
    const HOLOS = [
      { x: 0.08, y: 0.3, w: 0.16, h: 0.28, label: "NEURAL.NET", lines: ["STATUS: ACTIVE","SYNC: 98.4%","LAT: 2ms","CORES: 128/128"], scanY: 0, col: "0,200,255" },
      { x: 0.76, y: 0.28, w: 0.16, h: 0.28, label: "MOTOR.SYS", lines: ["JOINTS: 48/48","TORQUE: 142%","TEMP: 38°C","SERVO: LOCK"], scanY: 0.5, col: "0,220,200" },
    ];

    // ── SCANNING LASER ────────────────────────────────────────────────────────
    let laserAngle = 0;

    // ── ENERGY ORBS ──────────────────────────────────────────────────────────
    const ORBS = Array.from({ length: 4 }, (_, i) => ({
      x: 0.15 + i * 0.23,
      y: 0.75 + Math.sin(i * 1.3) * 0.06,
      r: 8 + i * 3,
      phase: i * Math.PI * 0.5,
      col: ["0,245,255","80,180,255","0,200,180","120,200,255"][i],
    }));

    // ── DRAW FLOOR GRID ────────────────────────────────────────────────────────
    function drawFloor() {
      const fy = H * 0.72;
      // Dark reflective floor base
      const fg = ctx.createLinearGradient(0, fy, 0, H);
      fg.addColorStop(0, "#030c18"); fg.addColorStop(1, "#010609");
      ctx.fillStyle = fg; ctx.fillRect(0, fy, W, H - fy);

      // Perspective hex-ish grid
      const vp = { x: W * (0.5 + (mx-0.5)*0.06), y: fy };
      ctx.lineWidth = 0.5;
      for (let i = -20; i <= 20; i++) {
        const bx = W * 0.5 + i * W * 0.055;
        const a = Math.max(0, 0.09 - Math.abs(i) * 0.004);
        ctx.strokeStyle = `rgba(0,200,255,${a})`;
        ctx.beginPath(); ctx.moveTo(vp.x, vp.y); ctx.lineTo(bx, H + 20); ctx.stroke();
      }
      for (let j = 1; j <= 16; j++) {
        const frac = j / 16;
        const ly = fy + (H - fy) * frac;
        const lx = vp.x + (0 - vp.x) * frac;
        const rx = vp.x + (W - vp.x) * frac;
        ctx.strokeStyle = `rgba(0,180,255,${0.06 * (1 - frac)})`;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ly); ctx.stroke();
      }
      // Glowing center line
      const cl = ctx.createLinearGradient(vp.x - W*0.01, fy, vp.x - W*0.01, H);
      cl.addColorStop(0, "rgba(0,230,255,0.35)"); cl.addColorStop(1, "rgba(0,230,255,0)");
      ctx.strokeStyle = cl; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(vp.x, fy); ctx.lineTo(vp.x, H); ctx.stroke();
    }

    // ── DRAW BACKGROUND ───────────────────────────────────────────────────────
    function drawBg() {
      // Deep dark lab background
      const bg = ctx.createRadialGradient(W*(0.5+(mx-0.5)*0.08), H*(0.4+(my-0.5)*0.06), 0, W*0.5, H*0.5, Math.max(W,H)*0.95);
      bg.addColorStop(0, "#071422");
      bg.addColorStop(0.35, "#040e18");
      bg.addColorStop(0.7, "#020810");
      bg.addColorStop(1, "#010509");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // Ambient neon ambient from below
      const amb = ctx.createRadialGradient(W*0.5, H*0.85, 0, W*0.5, H*0.85, W*0.6);
      amb.addColorStop(0, "rgba(0,180,255,0.08)"); amb.addColorStop(1, "transparent");
      ctx.fillStyle = amb; ctx.fillRect(0, H*0.5, W, H*0.5);

      // Mouse-reactive spotlight
      const sl = ctx.createRadialGradient(mx*W, my*H, 0, mx*W, my*H, Math.min(W,H)*0.35);
      sl.addColorStop(0, "rgba(0,160,255,0.07)"); sl.addColorStop(1, "transparent");
      ctx.fillStyle = sl; ctx.fillRect(0, 0, W, H);
    }

    // ── DRAW CIRCUIT WALL ─────────────────────────────────────────────────────
    function drawCircuit() {
      // Edges
      EDGES.forEach(([i, j, seed]) => {
        const ni = NODES[i], nj = NODES[j];
        if (!ni.active || !nj.active) return;
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + seed * 10);
        // Animated data packet along edge
        const progress = (t * (0.3 + seed * 0.4)) % 1;
        ctx.strokeStyle = `rgba(0,200,255,${0.06 + pulse * 0.04})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(ni.x * W, ni.y * H);
        ctx.lineTo(nj.x * W, nj.y * H);
        ctx.stroke();
        // Traveling packet
        const px = ni.x + (nj.x - ni.x) * progress;
        const py = ni.y + (nj.y - ni.y) * progress;
        ctx.beginPath(); ctx.arc(px * W, py * H, 2.5, 0, Math.PI*2);
        ctx.fillStyle = `rgba(0,240,255,${0.7 * pulse})`; ctx.fill();
      });
      // Nodes
      NODES.forEach(n => {
        if (!n.active) return;
        n.pulse += 0.016 * n.pulseSpd;
        const p = 0.4 + 0.6 * Math.abs(Math.sin(n.pulse));
        // Glow halo
        const ng = ctx.createRadialGradient(n.x*W, n.y*H, 0, n.x*W, n.y*H, n.r*4);
        ng.addColorStop(0, `rgba(${n.col},${0.35*p})`); ng.addColorStop(1, "transparent");
        ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(n.x*W, n.y*H, n.r*4, 0, Math.PI*2); ctx.fill();
        // Core
        ctx.shadowColor = `rgba(${n.col},1)`; ctx.shadowBlur = 8*p;
        ctx.beginPath(); ctx.arc(n.x*W, n.y*H, n.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${n.col},${0.8*p})`; ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    // ── DRAW DATA STREAMS ─────────────────────────────────────────────────────
    function drawDataStreams(dt) {
      ctx.font = `bold ${Math.round(H*0.013)}px 'Share Tech Mono',monospace`;
      ctx.textAlign = "center";
      STREAMS.forEach(s => {
        s.y += s.spd * dt * 60;
        if (s.y > 1.1) { s.y = -0.1; s.chars = Array.from({length:8},()=>String.fromCharCode(0x30A0+Math.floor(Math.random()*96))); }
        s.charT += dt;
        if (s.charT > 0.12) { s.charT=0; s.chars[Math.floor(Math.random()*8)]=String.fromCharCode(0x30A0+Math.floor(Math.random()*96)); }
        s.chars.forEach((ch, ci) => {
          const cy = (s.y + ci * 0.055) * H;
          if (cy < 0 || cy > H * 0.72) return;
          const fade = 1 - Math.abs(ci - 3) / 5;
          ctx.fillStyle = `rgba(0,230,255,${fade * 0.18})`;
          ctx.fillText(ch, s.x * W, cy);
        });
      });
      ctx.textAlign = "left";
    }

    // ── DRAW HOLOGRAPHIC DISPLAY ──────────────────────────────────────────────
    function drawHolos() {
      HOLOS.forEach(h => {
        h.scanY = (h.scanY + 0.004) % 1;
        const hx = h.x * W, hy = h.y * H, hw = h.w * W, hh = h.h * H;
        const pulse = 0.7 + 0.3 * Math.sin(t * 1.4);

        // Outer glow
        ctx.shadowColor = `rgba(${h.col},0.9)`; ctx.shadowBlur = 18*pulse;
        // Frame
        ctx.strokeStyle = `rgba(${h.col},${0.55*pulse})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.roundRect(hx, hy, hw, hh, 4); ctx.stroke();
        ctx.shadowBlur = 0;

        // Panel bg
        ctx.fillStyle = `rgba(0,10,22,0.72)`;
        ctx.beginPath(); ctx.roundRect(hx, hy, hw, hh, 4); ctx.fill();

        // Scan line
        const sy = hy + h.scanY * hh;
        const sg = ctx.createLinearGradient(hx, sy-8, hx, sy+8);
        sg.addColorStop(0,"transparent"); sg.addColorStop(0.5,`rgba(${h.col},0.35)`); sg.addColorStop(1,"transparent");
        ctx.fillStyle = sg; ctx.fillRect(hx, sy-8, hw, 16);

        // Corner brackets
        [[hx,hy],[hx+hw,hy],[hx,hy+hh],[hx+hw,hy+hh]].forEach(([cx,cy],ci)=>{
          const sx2 = ci%2===0?1:-1, sy2 = ci<2?1:-1, bl = 12;
          ctx.strokeStyle = `rgba(${h.col},0.9)`; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx+sx2*bl, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy+sy2*bl); ctx.stroke();
        });

        // Label
        ctx.font = `700 ${Math.round(H*0.012)}px 'Orbitron','Share Tech Mono',monospace`;
        ctx.fillStyle = `rgba(${h.col},0.9)`;
        ctx.fillText("▸ "+h.label, hx+10, hy+18);

        // Bar charts — animated
        const barW = (hw - 20) / h.lines.length;
        h.lines.forEach((ln, li) => {
          const barVal = 0.3 + 0.5 * Math.abs(Math.sin(t * 0.6 + li * 1.3));
          ctx.fillStyle = `rgba(${h.col},0.12)`;
          ctx.fillRect(hx+10+li*barW, hy+hh-28, barW-3, 18);
          ctx.fillStyle = `rgba(${h.col},${0.5*pulse})`;
          ctx.fillRect(hx+10+li*barW, hy+hh-28+(1-barVal)*18, barW-3, barVal*18);
          ctx.font = `500 ${Math.round(H*0.010)}px 'Share Tech Mono',monospace`;
          ctx.fillStyle = `rgba(${h.col},0.55)`;
          ctx.fillText(ln.split(":")[0], hx+10+li*barW, hy+30+li*14);
        });

        // Line chart
        ctx.beginPath(); ctx.strokeStyle = `rgba(${h.col},0.6)`; ctx.lineWidth=1;
        for (let xi=0;xi<=hw-20;xi+=3) {
          const yv = hy+hh*0.55 + Math.sin(t*1.2+xi*0.05)*hh*0.07 + Math.sin(t*2.5+xi*0.03)*hh*0.03;
          xi===0?ctx.moveTo(hx+10+xi,yv):ctx.lineTo(hx+10+xi,yv);
        }
        ctx.stroke();
      });
    }

    // ── DRAW ROBOTIC ARM ──────────────────────────────────────────────────────
    function updateArm(dt) {
      ARM.modeT += dt;
      // Cycle through poses
      if (ARM.modeT > 4) {
        ARM.modeT = 0;
        ARM.mode = ["reach","retract","scan","idle"][Math.floor(Math.random()*4)];
        if (ARM.mode==="reach") { ARM.ta1=-0.8+mx*0.6; ARM.ta2=0.3+my*0.4; ARM.ta3=-0.6; ARM.tGripOpen=1; }
        else if (ARM.mode==="retract") { ARM.ta1=-1.4; ARM.ta2=0.9; ARM.ta3=-0.2; ARM.tGripOpen=0; }
        else if (ARM.mode==="scan") { ARM.ta1=-1.0+Math.sin(t*0.5)*0.4; ARM.ta2=0.5; ARM.ta3=-0.8; ARM.tGripOpen=0.5; }
        else { ARM.ta1=-1.2; ARM.ta2=0.6; ARM.ta3=-0.4; ARM.tGripOpen=0; }
      }
      // Mouse tracking in reach mode
      if (ARM.mode==="reach") { ARM.ta1=-0.8+mx*0.5; ARM.ta2=0.3+my*0.35; }
      const lp = 1 - Math.pow(0.85, dt * 60);
      ARM.a1 += (ARM.ta1-ARM.a1)*lp;
      ARM.a2 += (ARM.ta2-ARM.a2)*lp;
      ARM.a3 += (ARM.ta3-ARM.a3)*lp;
      ARM.gripOpen += (ARM.tGripOpen-ARM.gripOpen)*lp;
    }

    function drawArm() {
      const bx = ARM.baseX * W, by = ARM.baseY * H;
      const l1=ARM.seg1*H, l2=ARM.seg2*H, l3=ARM.seg3*H;
      const a1=ARM.a1, a2=ARM.a1+ARM.a2, a3=ARM.a1+ARM.a2+ARM.a3;

      const j1x = bx + Math.cos(a1)*l1, j1y = by + Math.sin(a1)*l1;
      const j2x = j1x + Math.cos(a2)*l2, j2y = j1y + Math.sin(a2)*l2;
      const j3x = j2x + Math.cos(a3)*l3, j3y = j2y + Math.sin(a3)*l3;

      function drawSegment(x1,y1,x2,y2,w,col) {
        // Shadow/depth
        ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = w+3; ctx.lineCap="round";
        ctx.beginPath(); ctx.moveTo(x1+2,y1+2); ctx.lineTo(x2+2,y2+2); ctx.stroke();
        // Main body gradient
        const sg = ctx.createLinearGradient(x1,y1,x2,y2);
        sg.addColorStop(0,"#1a3550"); sg.addColorStop(0.4,"#0e2236"); sg.addColorStop(1,"#071520");
        ctx.strokeStyle = sg; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        // Neon edge
        ctx.strokeStyle = `rgba(${col},0.65)`; ctx.lineWidth = 1.2;
        ctx.shadowColor = `rgba(${col},1)`; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        ctx.shadowBlur = 0;
      }

      function drawJoint(x,y,r,col) {
        ctx.fillStyle = "#0a1e32";
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = `rgba(${col},0.8)`; ctx.lineWidth=1.5;
        ctx.shadowColor=`rgba(${col},1)`; ctx.shadowBlur=10;
        ctx.stroke();
        ctx.shadowBlur=0;
        // Inner ring
        ctx.strokeStyle=`rgba(${col},0.35)`; ctx.lineWidth=0.7;
        ctx.beginPath(); ctx.arc(x,y,r*0.55,0,Math.PI*2); ctx.stroke();
      }

      // Base mount
      ctx.fillStyle="#0d1e30";
      ctx.beginPath(); ctx.roundRect(bx-18,by-10,36,16,3); ctx.fill();
      ctx.strokeStyle="rgba(0,200,255,0.5)"; ctx.lineWidth=1;
      ctx.stroke();

      drawSegment(bx,by,j1x,j1y,12,"0,200,255");
      drawJoint(j1x,j1y,8,"0,200,255");
      drawSegment(j1x,j1y,j2x,j2y,9,"0,220,200");
      drawJoint(j2x,j2y,6,"0,220,200");
      drawSegment(j2x,j2y,j3x,j3y,6,"0,240,180");
      drawJoint(j3x,j3y,5,"0,240,180");

      // Gripper
      const go = ARM.gripOpen * 12;
      const gAng = a3;
      const perp = gAng + Math.PI*0.5;
      for (const side of [-1,1]) {
        const gx = j3x + Math.cos(perp)*side*go + Math.cos(gAng)*14;
        const gy = j3y + Math.sin(perp)*side*go + Math.sin(gAng)*14;
        const fx = j3x + Math.cos(perp)*side*(go+6) + Math.cos(gAng)*24;
        const fy = j3y + Math.sin(perp)*side*(go+6) + Math.sin(gAng)*24;
        ctx.strokeStyle="#0d2236"; ctx.lineWidth=6; ctx.lineCap="round";
        ctx.beginPath(); ctx.moveTo(j3x,j3y); ctx.lineTo(gx,gy); ctx.lineTo(fx,fy); ctx.stroke();
        ctx.strokeStyle=`rgba(0,230,180,0.7)`; ctx.lineWidth=1.2;
        ctx.shadowColor="rgba(0,230,180,0.9)"; ctx.shadowBlur=6;
        ctx.beginPath(); ctx.moveTo(j3x,j3y); ctx.lineTo(gx,gy); ctx.lineTo(fx,fy); ctx.stroke();
        ctx.shadowBlur=0;
      }

      // Gripper tip glow
      const tg = ctx.createRadialGradient(j3x+Math.cos(a3)*24,j3y+Math.sin(a3)*24,0,j3x+Math.cos(a3)*24,j3y+Math.sin(a3)*24,20);
      tg.addColorStop(0,"rgba(0,255,180,0.3)"); tg.addColorStop(1,"transparent");
      ctx.fillStyle=tg; ctx.beginPath();
      ctx.arc(j3x+Math.cos(a3)*24,j3y+Math.sin(a3)*24,20,0,Math.PI*2); ctx.fill();
    }

    // ── DRAW SCANNING LASER ───────────────────────────────────────────────────
    function drawLaser(dt) {
      laserAngle += dt * 0.8 + (mx-0.5)*0.01;
      const lx = W*0.5, ly = H*0.1;
      const la = laserAngle;
      const len = H * 0.7;
      const ex = lx + Math.sin(la)*len, ey = ly + Math.cos(la)*len;
      const lg = ctx.createLinearGradient(lx,ly,ex,ey);
      lg.addColorStop(0,"rgba(0,255,180,0.0)"); lg.addColorStop(0.2,"rgba(0,255,180,0.35)"); lg.addColorStop(1,"rgba(0,255,180,0.0)");
      ctx.strokeStyle=lg; ctx.lineWidth=1;
      ctx.shadowColor="rgba(0,255,180,0.8)"; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(ex,ey); ctx.stroke();
      ctx.shadowBlur=0;
      // Origin dot
      ctx.beginPath(); ctx.arc(lx,ly,4,0,Math.PI*2);
      ctx.fillStyle="rgba(0,255,180,0.8)"; ctx.fill();
    }

    // ── DRAW ENERGY ORBS ─────────────────────────────────────────────────────
    function drawOrbs(dt) {
      ORBS.forEach(o => {
        o.phase += dt * 0.9;
        const ox = (o.x + Math.sin(o.phase*0.7)*0.012)*W;
        const oy = (o.y + Math.cos(o.phase*0.5)*0.018)*H;
        const pulse = 0.6 + 0.4*Math.sin(o.phase*2);
        // Outer glow
        const og = ctx.createRadialGradient(ox,oy,0,ox,oy,o.r*3.5);
        og.addColorStop(0,`rgba(${o.col},${0.35*pulse})`);
        og.addColorStop(0.5,`rgba(${o.col},${0.10*pulse})`);
        og.addColorStop(1,"transparent");
        ctx.fillStyle=og; ctx.beginPath(); ctx.arc(ox,oy,o.r*3.5,0,Math.PI*2); ctx.fill();
        // Core
        ctx.shadowColor=`rgba(${o.col},1)`; ctx.shadowBlur=12*pulse;
        ctx.beginPath(); ctx.arc(ox,oy,o.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${o.col},${0.85*pulse})`; ctx.fill();
        // Ring
        ctx.beginPath(); ctx.arc(ox,oy,o.r*2,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${o.col},${0.3*pulse})`; ctx.lineWidth=0.8; ctx.stroke();
        ctx.shadowBlur=0;
      });
    }

    // ── DRAW PARTICLES ────────────────────────────────────────────────────────
    function drawParticles(dt) {
      PARTICLES.forEach(p => {
        p.x += p.vx * dt * 60 + (mx-0.5)*0.00008;
        p.y += p.vy * dt * 60;
        p.life += dt * 0.3;
        if (p.y < -0.02 || p.life > 1) { p.y=1.0; p.x=Math.random(); p.life=0; }
        const fa = Math.sin(p.life*Math.PI)*p.a;
        ctx.shadowColor=`rgba(${p.col},0.9)`; ctx.shadowBlur=4;
        ctx.beginPath(); ctx.arc(p.x*W, p.y*H, p.r, 0, Math.PI*2);
        ctx.fillStyle=`rgba(${p.col},${fa})`; ctx.fill();
        ctx.shadowBlur=0;
      });
    }

    // ── DRAW WALL PANELS ─────────────────────────────────────────────────────
    function drawWallPanels() {
      // Left wall panel with metallic sheen
      const lwg = ctx.createLinearGradient(0,0,W*0.05,0);
      lwg.addColorStop(0,"#04101e"); lwg.addColorStop(1,"#06141e");
      ctx.fillStyle=lwg; ctx.fillRect(0,0,W*0.05,H);
      ctx.strokeStyle="rgba(0,180,255,0.12)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(W*0.05,0); ctx.lineTo(W*0.05,H); ctx.stroke();

      // Right wall panel
      const rwg = ctx.createLinearGradient(W*0.95,0,W,0);
      rwg.addColorStop(0,"#06141e"); rwg.addColorStop(1,"#04101e");
      ctx.fillStyle=rwg; ctx.fillRect(W*0.95,0,W*0.05,H);
      ctx.strokeStyle="rgba(0,180,255,0.12)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(W*0.95,0); ctx.lineTo(W*0.95,H); ctx.stroke();

      // Ceiling strip lights
      for (let i=0;i<6;i++) {
        const lx = W*(0.1+i*0.16);
        const la = 0.4+0.2*Math.sin(t*1.2+i*0.8);
        const lg = ctx.createLinearGradient(lx,0,lx,H*0.04);
        lg.addColorStop(0,`rgba(0,200,255,${la})`); lg.addColorStop(1,"transparent");
        ctx.fillStyle=lg; ctx.fillRect(lx-2,0,4,H*0.05);
        // Ceiling glow pool
        const cg = ctx.createRadialGradient(lx,0,0,lx,0,H*0.18);
        cg.addColorStop(0,`rgba(0,200,255,${0.08*la})`); cg.addColorStop(1,"transparent");
        ctx.fillStyle=cg; ctx.fillRect(lx-H*0.18,0,H*0.36,H*0.18);
      }
    }

    // ── VIGNETTE ─────────────────────────────────────────────────────────────
    function drawVignette() {
      const vg = ctx.createRadialGradient(W*0.5,H*0.45,H*0.12,W*0.5,H*0.5,Math.max(W,H)*0.88);
      vg.addColorStop(0,"transparent");
      vg.addColorStop(0.5,"rgba(0,0,8,0.12)");
      vg.addColorStop(0.8,"rgba(0,0,14,0.5)");
      vg.addColorStop(1,"rgba(0,0,20,0.82)");
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
      // Dark overlay for text
      ctx.fillStyle="rgba(0,3,10,0.28)"; ctx.fillRect(0,0,W,H);
    }

    let lastTs = 0;
    function frame(ts) {
      const dt = Math.min((ts-lastTs)/1000, 0.05); lastTs=ts; t+=dt;
      ctx.clearRect(0,0,W,H);
      drawBg();
      drawWallPanels();
      drawCircuit();
      drawDataStreams(dt);
      drawFloor();
      drawLaser(dt);
      drawOrbs(dt);
      drawParticles(dt);
      drawHolos();
      updateArm(dt);
      drawArm();
      drawVignette();
      rafId=requestAnimationFrame(frame);
    }
    rafId=requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:2}} />;
}

// ─── CINEMATIC SPACE BACKGROUND ───────────────────────────────────────────────
function CinematicSpace() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let W, H, rafId;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);

    // Mouse / scroll state
    let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
    let scrollY = 0, tScrollY = 0, scrollVel = 0;
    const onMouse = e => { tmx = e.clientX / window.innerWidth; tmy = e.clientY / window.innerHeight; };
    const onScroll = () => { const ns = window.scrollY; scrollVel = ns - scrollY; tScrollY = ns; };
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const T = () => performance.now() / 1000;

    // ── Stars (3 depth layers) ──────────────────────────────────────────────
    const mkStars = (n, rMin, rMax, aMin, aMax, parallax) =>
      Array.from({ length: n }, () => ({
        x: Math.random(), y: Math.random(),
        r: rMin + Math.random() * (rMax - rMin),
        a: aMin + Math.random() * (aMax - aMin),
        tp: Math.random() * Math.PI * 2,
        ts: 0.3 + Math.random() * 0.8,
        parallax,
        col: Math.random() > 0.9 ? "200,180,255" : Math.random() > 0.85 ? "180,220,255" : "255,255,255",
      }));
    const starsDeep = mkStars(320, 0.2, 0.8, 0.15, 0.55, 0.004);
    const starsMid  = mkStars(180, 0.5, 1.4, 0.25, 0.75, 0.012);
    const starsNear = mkStars(60,  1.2, 2.8, 0.4,  0.9,  0.028);

    // ── Nebulas ─────────────────────────────────────────────────────────────
    const NEBS = [
      { x:.18, y:.22, rx:.55, ry:.28, col:"20,0,60",  a:.055, spd:.00008, phase:0 },
      { x:.82, y:.15, rx:.48, ry:.32, col:"0,20,80",  a:.065, spd:.00012, phase:1.2 },
      { x:.5,  y:.7,  rx:.62, ry:.25, col:"40,0,100", a:.045, spd:.00006, phase:2.4 },
      { x:.08, y:.65, rx:.38, ry:.22, col:"80,0,40",  a:.04,  spd:.00009, phase:0.8 },
      { x:.88, y:.72, rx:.42, ry:.28, col:"0,60,120", a:.05,  spd:.00011, phase:3.1 },
    ];

    // ── Meteor streaks ──────────────────────────────────────────────────────
    const meteors = [];
    const spawnMeteor = () => {
      if (meteors.length > 5) return;
      const angle = Math.PI / 6 + Math.random() * Math.PI / 6;
      meteors.push({
        x: Math.random() * W * 1.2 - W * 0.1,
        y: -30,
        vx: Math.cos(angle) * (8 + Math.random() * 14),
        vy: Math.sin(angle) * (8 + Math.random() * 14),
        len: 80 + Math.random() * 180,
        alpha: 0,
        life: 0, maxLife: 0.6 + Math.random() * 0.8,
        col: Math.random() > 0.6 ? "200,220,255" : "180,255,240",
      });
    };
    let lastMeteor = 0;

    // ── Ship state ──────────────────────────────────────────────────────────
    const ship = {
      x: 0.68, y: 0.72,
      tx: 0.68, ty: 0.72,
      scale: 1, tScale: 1,
      roll: 0, pitch: 0,
      // multi-layer float
      floatT: 0,
      floatX: 0, floatY: 0,
      floatRoll: 0, floatPitch: 0,
      // breathing tilt
      breathT: 0,
      drift: 0, driftSpd: 0.0007,
      enginePulse: 0,
      particleT: 0,
    };

    // Engine particles
    const eParts = Array.from({ length: 80 }, () => ({ life: 0, maxLife: 0, x: 0, y: 0, vx: 0, vy: 0, r: 0, col: "" }));
    let epIdx = 0;
    const spawnEP = (bx, by, col, intensity) => {
      const p = eParts[epIdx % eParts.length]; epIdx++;
      p.life = 1; p.maxLife = 0.4 + Math.random() * 0.5;
      p.x = bx; p.y = by;
      const spread = 1.8 + intensity * 2;
      p.vx = (Math.random() - 0.5) * spread;
      p.vy = (Math.random() - 0.5) * spread + intensity * 1.5;
      p.r = 1.2 + Math.random() * 2.5;
      p.col = col;
    };

    // Lens flares
    const FLARES = [
      { ox: -0.08, oy: -0.06, r: 80, a: 0.18, col: "0,245,255" },
      { ox:  0.12, oy: -0.1,  r: 50, a: 0.12, col: "168,85,247" },
      { ox: -0.15, oy:  0.04, r: 35, a: 0.10, col: "0,200,255" },
    ];

    // ── 3D perspective projection helper ────────────────────────────────────
    // Projects a 3D point [x,y,z] rotated by yaw/pitch/roll onto 2D canvas
    function project3D(px, py, pz, yaw, ptch, rll, fov, cx2, cy2) {
      // roll
      let rx = px * Math.cos(rll) - py * Math.sin(rll);
      let ry = px * Math.sin(rll) + py * Math.cos(rll);
      let rz = pz;
      // pitch
      let py2 = ry * Math.cos(ptch) - rz * Math.sin(ptch);
      let pz2 = ry * Math.sin(ptch) + rz * Math.cos(ptch);
      let px2 = rx;
      // yaw
      let fx = px2 * Math.cos(yaw) + pz2 * Math.sin(yaw);
      let fy = py2;
      let fz = -px2 * Math.sin(yaw) + pz2 * Math.cos(yaw);
      const d = fov / (fov + fz + 0.001);
      return { sx: cx2 + fx * d, sy: cy2 + fy * d, d, z: fz };
    }

    // Draw a 3D polygon face given array of [x,y,z] verts
    function drawFace3D(verts, yaw, ptch, rll, fov, cx2, cy2, fillStyle, strokeStyle, lw) {
      const pts = verts.map(([px,py,pz]) => project3D(px,py,pz,yaw,ptch,rll,fov,cx2,cy2));
      ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy));
      ctx.closePath();
      if (fillStyle)   { ctx.fillStyle   = fillStyle;   ctx.fill();   }
      if (strokeStyle) { ctx.strokeStyle = strokeStyle; ctx.lineWidth = lw || 1; ctx.stroke(); }
      return pts;
    }

    // ── Draw 3D spaceship ───────────────────────────────────────────────────
    function drawShip(cx2, cy2, s, t, yaw, ptch, rll) {
      const fov  = s * 5.5;
      const ep   = 0.5 + 0.5 * Math.sin(ship.enginePulse * 2.2);
      const ep2  = 0.5 + 0.5 * Math.sin(ship.enginePulse * 1.6 + 1);

      // ── AMBIENT GLOW (pre-draw) ──
      const gG = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, s * 2.2);
      gG.addColorStop(0, "rgba(0,180,255,0.10)");
      gG.addColorStop(0.4, "rgba(0,80,200,0.04)");
      gG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(cx2, cy2, s * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = gG; ctx.fill();

      // ── ENGINE PLUMES (draw behind hull) ──
      const nozzles3D = [[-s*0.55, s*0.18, 0], [0, s*0.22, 0], [s*0.55, s*0.18, 0]];
      nozzles3D.forEach(([nx, ny, nz], ni) => {
        const np = project3D(nx, ny, nz, yaw, ptch, rll, fov, cx2, cy2);
        const plumeL = s * (1.1 + (ni===1?0.4:0) + ep * 0.35) * np.d;
        const plumeW = s * (ni===1?0.18:0.10) * np.d;
        const pG = ctx.createLinearGradient(np.sx, np.sy, np.sx, np.sy + plumeL);
        pG.addColorStop(0, "rgba(255,255,255,0.95)");
        pG.addColorStop(0.08, "rgba(0,220,255,0.90)");
        pG.addColorStop(0.3, "rgba(0,120,220,0.55)");
        pG.addColorStop(0.6, "rgba(120,60,255,0.25)");
        pG.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.moveTo(np.sx - plumeW*0.5, np.sy);
        ctx.bezierCurveTo(np.sx - plumeW, np.sy + plumeL*0.35, np.sx - plumeW*0.3, np.sy + plumeL*0.75, np.sx + (Math.random()-0.5)*plumeW*0.3, np.sy + plumeL);
        ctx.bezierCurveTo(np.sx + plumeW*0.3, np.sy + plumeL*0.75, np.sx + plumeW, np.sy + plumeL*0.35, np.sx + plumeW*0.5, np.sy);
        ctx.closePath(); ctx.fillStyle = pG; ctx.fill();
        // Hot core
        const cG2 = ctx.createRadialGradient(np.sx, np.sy + plumeL*0.1, 0, np.sx, np.sy + plumeL*0.1, plumeW*0.8);
        cG2.addColorStop(0, "rgba(255,255,255,0.9)"); cG2.addColorStop(0.5, "rgba(0,220,255,0.4)"); cG2.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.ellipse(np.sx, np.sy + plumeL*0.1, plumeW*0.8, plumeL*0.15, 0, 0, Math.PI*2);
        ctx.fillStyle = cG2; ctx.fill();
      });

      // ── SHADOW UNDERNEATH ──
      const shadowP = project3D(0, s*0.35, 0, yaw, ptch, rll, fov, cx2, cy2);
      const shG = ctx.createRadialGradient(shadowP.sx, shadowP.sy + s*0.18, 0, shadowP.sx, shadowP.sy + s*0.18, s*1.2);
      shG.addColorStop(0, "rgba(0,20,60,0.45)"); shG.addColorStop(1, "transparent");
      ctx.save(); ctx.scale(1, 0.22);
      ctx.beginPath(); ctx.arc(shadowP.sx, (shadowP.sy + s*0.18) / 0.22, s*1.1, 0, Math.PI*2);
      ctx.fillStyle = shG; ctx.fill(); ctx.restore();

      // ── LOWER VENTRAL PLATE (belly) ──
      const belly = [
        [-s*0.22, s*0.12, -s*0.08], [s*0.22, s*0.12, -s*0.08],
        [s*0.26, s*0.1,   s*0.2 ],  [-s*0.26, s*0.1, s*0.2 ],
      ];
      const bellyLight = 0.25 + 0.1 * Math.sin(t*0.8 + 1);
      drawFace3D(belly, yaw, ptch, rll, fov, cx2, cy2,
        `rgba(8,18,38,${bellyLight})`, "rgba(0,180,255,0.18)", 0.7);

      // ── WING ROOT CONNECTORS ──
      [[-1],[1]].forEach(([fl]) => {
        const wConn = [
          [fl*s*0.22, s*0.0,  -s*0.05], [fl*s*0.65, s*0.02, -s*0.1],
          [fl*s*0.65, s*0.12, s*0.05],   [fl*s*0.22, s*0.1,  s*0.08],
        ];
        const wLight = 0.4 + 0.12 * fl * Math.sin(yaw);
        drawFace3D(wConn, yaw, ptch, rll, fov, cx2, cy2,
          `rgba(18,32,56,${wLight})`, "rgba(0,200,255,0.25)", 0.8);
      });

      // ── MAIN WINGS ──
      [[-1],[1]].forEach(([fl]) => {
        // Wing top face
        const wingTop = [
          [fl*s*0.22,  s*0.0,  -s*0.05],
          [fl*s*1.52,  s*0.04, -s*0.15],
          [fl*s*1.52,  s*0.08,  s*0.0 ],
          [fl*s*0.22,  s*0.06,  s*0.12],
        ];
        const wl = 0.55 - fl*0.12*Math.sin(yaw)*0.5;
        drawFace3D(wingTop, yaw, ptch, rll, fov, cx2, cy2,
          `rgba(22,40,70,${wl})`, "rgba(0,200,255,0.28)", 0.9);

        // Wing bottom face (slightly darker)
        const wingBot = [
          [fl*s*0.22,  s*0.06,  s*0.12],
          [fl*s*1.52,  s*0.08,  s*0.0 ],
          [fl*s*1.52,  s*0.16, -s*0.0 ],
          [fl*s*0.22,  s*0.14,  s*0.1 ],
        ];
        drawFace3D(wingBot, yaw, ptch, rll, fov, cx2, cy2,
          `rgba(10,20,40,${wl*0.7})`, "rgba(0,150,255,0.15)", 0.6);

        // Wing panel engravings
        ctx.strokeStyle = "rgba(0,200,255,0.12)"; ctx.lineWidth = 0.5;
        [[0.35],[0.6],[0.82]].forEach(([u]) => {
          const p1 = project3D(fl*s*(0.22+u*1.3), s*0.02,  -s*0.08 + u*s*0.06, yaw, ptch, rll, fov, cx2, cy2);
          const p2 = project3D(fl*s*(0.22+u*1.3), s*0.12, s*0.08, yaw, ptch, rll, fov, cx2, cy2);
          ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
        });

        // Wing tip nacelle
        const nacPos = project3D(fl*s*1.52, s*0.1, -s*0.06, yaw, ptch, rll, fov, cx2, cy2);
        const nacR = s * 0.065 * nacPos.d;
        const nacG2 = ctx.createRadialGradient(nacPos.sx, nacPos.sy, 0, nacPos.sx, nacPos.sy, nacR);
        nacG2.addColorStop(0, "#2a4a70"); nacG2.addColorStop(1, "#0a1825");
        ctx.beginPath(); ctx.ellipse(nacPos.sx, nacPos.sy, nacR * 1.4, nacR * 0.55, fl*yaw*0.3, 0, Math.PI*2);
        ctx.fillStyle = nacG2; ctx.fill();
        ctx.strokeStyle = "rgba(0,220,255,0.7)"; ctx.lineWidth = 0.9; ctx.stroke();
        // Nacelle light
        const nacLit = (Math.floor(T()*2 + fl) % 2) === 0;
        ctx.shadowColor = "rgba(0,255,180,1)"; ctx.shadowBlur = nacLit ? 12 : 2;
        ctx.beginPath(); ctx.arc(nacPos.sx, nacPos.sy, nacR*0.3*(nacLit?1:0.4), 0, Math.PI*2);
        ctx.fillStyle = `rgba(0,255,180,${nacLit?0.95:0.15})`; ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ── CENTRAL ENGINE BLOCK (rear) ──
      const engFaces = [
        // back plate
        [[-s*0.22,s*0.08,s*0.22],[s*0.22,s*0.08,s*0.22],[s*0.22,s*0.24,s*0.22],[-s*0.22,s*0.24,s*0.22]],
        // top
        [[-s*0.22,s*0.08,-s*0.0],[s*0.22,s*0.08,-s*0.0],[s*0.22,s*0.08,s*0.22],[-s*0.22,s*0.08,s*0.22]],
        // left
        [[-s*0.22,s*0.08,-s*0.0],[-s*0.22,s*0.08,s*0.22],[-s*0.22,s*0.24,s*0.22],[-s*0.22,s*0.24,-s*0.0]],
        // right
        [[s*0.22,s*0.08,-s*0.0],[s*0.22,s*0.08,s*0.22],[s*0.22,s*0.24,s*0.22],[s*0.22,s*0.24,-s*0.0]],
      ];
      const engColors = ["rgba(12,24,50,0.95)","rgba(20,38,70,0.85)","rgba(10,20,44,0.75)","rgba(10,20,44,0.75)"];
      engFaces.forEach((f, i) => drawFace3D(f, yaw, ptch, rll, fov, cx2, cy2, engColors[i], "rgba(0,160,255,0.22)", 0.7));

      // ── MAIN FUSELAGE (box-shaped hull with 5 faces) ──
      const hulFaces = [
        // nose-top ramp
        [[0,-s*0.9,-s*0.14],[-s*0.2,s*0.0,-s*0.06],[s*0.2,s*0.0,-s*0.06]],
        // nose-left
        [[0,-s*0.9,-s*0.14],[-s*0.2,s*0.0,-s*0.06],[-s*0.22,s*0.08,s*0.12],[0,-s*0.4,s*0.18]],
        // nose-right
        [[0,-s*0.9,-s*0.14],[s*0.2,s*0.0,-s*0.06],[s*0.22,s*0.08,s*0.12],[0,-s*0.4,s*0.18]],
        // dorsal (top)
        [[-s*0.2,s*0.0,-s*0.06],[s*0.2,s*0.0,-s*0.06],[s*0.22,s*0.08,-s*0.0],[-s*0.22,s*0.08,-s*0.0]],
        // port side (left)
        [[-s*0.2,s*0.0,-s*0.06],[-s*0.22,s*0.08,-s*0.0],[-s*0.22,s*0.08,s*0.22],[-s*0.2,s*0.02,s*0.22]],
        // starboard (right)
        [[s*0.2,s*0.0,-s*0.06],[s*0.22,s*0.08,-s*0.0],[s*0.22,s*0.08,s*0.22],[s*0.2,s*0.02,s*0.22]],
        // aft plate
        [[-s*0.2,s*0.02,s*0.22],[s*0.2,s*0.02,s*0.22],[s*0.22,s*0.08,s*0.22],[-s*0.22,s*0.08,s*0.22]],
      ];
      // Lighting: simulate sun from upper-left
      const sunDir = [-0.55, -0.65, 0.5];
      const faceNormals = [
        [0,-0.9,-0.4],[-1,0,0],[1,0,0],[0,-1,0],[-1,0,0],[1,0,0],[0,0,1]
      ];
      const hulBaseColors = [
        [38,65,110],[28,52,88],[28,52,88],[40,70,118],[22,40,72],[22,40,72],[16,30,58]
      ];
      hulFaces.forEach((f, i) => {
        const n = faceNormals[i]||[0,1,0];
        const lum = Math.max(0, n[0]*sunDir[0]+n[1]*sunDir[1]+n[2]*sunDir[2]);
        const [r,g,b] = hulBaseColors[i]||[30,50,90];
        const lit = 0.45 + lum * 0.55;
        drawFace3D(f, yaw, ptch, rll, fov, cx2, cy2,
          `rgba(${Math.round(r*lit)},${Math.round(g*lit)},${Math.round(b*lit)},0.97)`,
          "rgba(0,200,255,0.22)", 0.8);
      });

      // Hull panel detail lines
      const panelLines = [
        [[-s*0.05, -s*0.5, -s*0.05],[s*0.05,-s*0.5,-s*0.05]],
        [[-s*0.1, -s*0.2, s*0.04],[s*0.1,-s*0.2,s*0.04]],
        [[-s*0.14, s*0.0, s*0.1],[s*0.14,s*0.0,s*0.1]],
      ];
      panelLines.forEach(([a,b]) => {
        const pa = project3D(...a, yaw, ptch, rll, fov, cx2, cy2);
        const pb = project3D(...b, yaw, ptch, rll, fov, cx2, cy2);
        ctx.beginPath(); ctx.moveTo(pa.sx,pa.sy); ctx.lineTo(pb.sx,pb.sy);
        ctx.strokeStyle="rgba(0,200,255,0.18)"; ctx.lineWidth=0.7; ctx.stroke();
      });

      // ── COCKPIT / CANOPY ──
      const cockCenter = project3D(0, -s*0.55, -s*0.16, yaw, ptch, rll, fov, cx2, cy2);
      const cR = s * 0.14 * cockCenter.d;
      const cG3 = ctx.createRadialGradient(cockCenter.sx - cR*0.3, cockCenter.sy - cR*0.3, 0, cockCenter.sx, cockCenter.sy, cR * 1.4);
      cG3.addColorStop(0, "rgba(160,240,255,0.95)");
      cG3.addColorStop(0.35, "rgba(60,180,255,0.6)");
      cG3.addColorStop(0.7, "rgba(10,80,200,0.3)");
      cG3.addColorStop(1, "rgba(0,20,80,0.05)");
      ctx.shadowColor = "rgba(100,230,255,0.9)"; ctx.shadowBlur = cR * 1.2;
      ctx.beginPath(); ctx.ellipse(cockCenter.sx, cockCenter.sy, cR * 1.35, cR, -0.2 + yaw*0.3, 0, Math.PI*2);
      ctx.fillStyle = cG3; ctx.fill();
      ctx.strokeStyle = "rgba(140,230,255,0.8)"; ctx.lineWidth = 1.1; ctx.stroke();
      // Canopy glare
      ctx.beginPath(); ctx.ellipse(cockCenter.sx - cR*0.3, cockCenter.sy - cR*0.25, cR*0.45, cR*0.22, -0.5, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255,255,255,0.38)"; ctx.fill();
      ctx.shadowBlur = 0;

      // ── SENSOR TOWER ──
      const sBase = project3D(0, -s*0.55, -s*0.08, yaw, ptch, rll, fov, cx2, cy2);
      const sTip  = project3D(0, -s*0.98, -s*0.13, yaw, ptch, rll, fov, cx2, cy2);
      ctx.shadowColor = "rgba(0,245,255,1)"; ctx.shadowBlur = 10;
      ctx.strokeStyle = "rgba(0,220,255,0.65)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(sBase.sx, sBase.sy); ctx.lineTo(sTip.sx, sTip.sy); ctx.stroke();
      const tipG2 = ctx.createRadialGradient(sTip.sx, sTip.sy, 0, sTip.sx, sTip.sy, s*0.035*sTip.d);
      tipG2.addColorStop(0, "rgba(0,245,255,1)"); tipG2.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(sTip.sx, sTip.sy, s*0.038*sTip.d, 0, Math.PI*2);
      ctx.fillStyle = tipG2; ctx.fill();
      // Side antennae
      [[-s*0.22,0],[s*0.22,0]].forEach(([ax]) => {
        const ab = project3D(ax, -s*0.5, -s*0.08, yaw, ptch, rll, fov, cx2, cy2);
        const at = project3D(ax, -s*0.78, -s*0.1, yaw, ptch, rll, fov, cx2, cy2);
        ctx.strokeStyle = "rgba(0,200,255,0.45)"; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(ab.sx,ab.sy); ctx.lineTo(at.sx,at.sy); ctx.stroke();
        ctx.beginPath(); ctx.arc(at.sx, at.sy, s*0.022*at.d, 0, Math.PI*2);
        ctx.fillStyle = "rgba(0,245,255,0.7)"; ctx.fill();
      });
      ctx.shadowBlur = 0;

      // ── RUNNING LIGHTS ──
      const runLights = [
        {pos:[-s*1.52,s*0.06,-s*0.06], col:"255,60,60"},
        {pos:[ s*1.52,s*0.06,-s*0.06], col:"0,255,100"},
        {pos:[0,-s*0.9,-s*0.14],        col:"255,255,255"},
        {pos:[-s*0.22,s*0.08,-s*0.02],  col:"0,200,255"},
        {pos:[ s*0.22,s*0.08,-s*0.02],  col:"0,200,255"},
      ];
      runLights.forEach(({pos, col}, ri) => {
        const rp = project3D(...pos, yaw, ptch, rll, fov, cx2, cy2);
        const lit = (Math.floor(T()*2.5 + ri*0.9) % 3) !== 0;
        const lr = s * 0.022 * rp.d;
        ctx.shadowColor = `rgb(${col})`; ctx.shadowBlur = lit ? lr*9 : 2;
        ctx.beginPath(); ctx.arc(rp.sx, rp.sy, lr*(lit?1:0.45), 0, Math.PI*2);
        ctx.fillStyle = `rgba(${col},${lit?0.95:0.18})`; ctx.fill();
      });
      ctx.shadowBlur = 0;

      // ── ENGINE NOZZLE GLOWS ──
      nozzles3D.forEach(([nx, ny, nz], ni) => {
        const np = project3D(nx, ny, nz, yaw, ptch, rll, fov, cx2, cy2);
        const nr = s * (ni===1?0.11:0.075) * np.d;
        const ep3 = 0.55 + 0.45 * Math.sin(ship.enginePulse * 3 + ni * 1.3);
        const ng2 = ctx.createRadialGradient(np.sx, np.sy, 0, np.sx, np.sy, nr * 2.2);
        ng2.addColorStop(0, `rgba(255,255,255,${0.9*ep3})`);
        ng2.addColorStop(0.25, `rgba(0,220,255,${0.7*ep3})`);
        ng2.addColorStop(0.6, `rgba(0,100,200,${0.3*ep3})`);
        ng2.addColorStop(1, "transparent");
        ctx.shadowColor = "rgba(0,220,255,1)"; ctx.shadowBlur = nr * 4;
        ctx.beginPath(); ctx.arc(np.sx, np.sy, nr * 2.2, 0, Math.PI*2);
        ctx.fillStyle = ng2; ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ── LENS FLARES ──
      FLARES.forEach(fl => {
        const flx = cx2 + fl.ox * s * 3.0, fly = cy2 + fl.oy * s * 2.5;
        const pulse = 0.7 + 0.3 * Math.sin(ship.enginePulse * 1.4);
        const fg = ctx.createRadialGradient(flx, fly, 0, flx, fly, fl.r * s * 0.022);
        fg.addColorStop(0, `rgba(${fl.col},${fl.a*pulse})`);
        fg.addColorStop(0.35, `rgba(${fl.col},${fl.a*0.3*pulse})`);
        fg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(flx, fly, fl.r*s*0.022, 0, Math.PI*2);
        ctx.fillStyle = fg; ctx.fill();
      });
    }

    // ── Draw engine particles ───────────────────────────────────────────────
    function drawEParts(dt) {
      eParts.forEach(p => {
        if (p.life <= 0) return;
        p.life -= dt / p.maxLife;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.life <= 0) return;
        const a = p.life * 0.75;
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (2 - p.life));
        pg.addColorStop(0, `rgba(${p.col},${a})`);
        pg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (2.2 - p.life), 0, Math.PI * 2);
        ctx.fillStyle = pg; ctx.fill();
      });
    }

    // ── Volumetric light rays ───────────────────────────────────────────────
    function drawLightRays(t) {
      ctx.save();
      const srcX = W * 0.15, srcY = H * 0.08;
      for (let i = 0; i < 8; i++) {
        const ang = -0.5 + i * 0.18 + Math.sin(t * 0.12 + i) * 0.04;
        const len = H * (0.7 + Math.sin(t * 0.08 + i * 0.7) * 0.2);
        const a = 0.012 + 0.007 * Math.sin(t * 0.15 + i);
        const rg = ctx.createLinearGradient(srcX, srcY, srcX + Math.sin(ang) * len, srcY + Math.cos(ang) * len);
        rg.addColorStop(0, `rgba(0,100,255,${a * 3})`);
        rg.addColorStop(0.3, `rgba(0,60,200,${a})`);
        rg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.moveTo(srcX, srcY);
        ctx.lineTo(srcX + Math.sin(ang - 0.06) * len, srcY + Math.cos(ang - 0.06) * len);
        ctx.lineTo(srcX + Math.sin(ang + 0.06) * len, srcY + Math.cos(ang + 0.06) * len);
        ctx.closePath();
        ctx.fillStyle = rg; ctx.fill();
      }
      ctx.restore();
    }

    // ── Black hole ──────────────────────────────────────────────────────────
    function drawBlackHole(t) {
      const bx = W * 0.12, by = H * 0.3, br = Math.min(W, H) * 0.055;
      // Accretion disk
      for (let i = 0; i < 3; i++) {
        const a = 0.02 - i * 0.005;
        const eg = ctx.createRadialGradient(bx, by, br * (0.8 + i * 0.4), bx, by, br * (2.2 + i * 0.8));
        eg.addColorStop(0, `rgba(255,120,30,${a * 2})`);
        eg.addColorStop(0.35, `rgba(255,60,0,${a})`);
        eg.addColorStop(0.7, `rgba(100,20,0,${a * 0.4})`);
        eg.addColorStop(1, "transparent");
        ctx.save();
        ctx.translate(bx, by); ctx.scale(1, 0.28 + i * 0.04); ctx.rotate(t * 0.08 + i * 0.5);
        ctx.beginPath(); ctx.arc(0, 0, br * (2.2 + i * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = eg; ctx.fill(); ctx.restore();
      }
      // Event horizon
      const hg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      hg.addColorStop(0, "rgba(0,0,0,1)");
      hg.addColorStop(0.65, "rgba(0,0,0,0.97)");
      hg.addColorStop(0.88, "rgba(10,0,20,0.5)");
      hg.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fillStyle = hg; ctx.fill();
      // Gravitational lensing ring
      ctx.beginPath(); ctx.arc(bx, by, br * 1.18, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,180,50,${0.18 + 0.08 * Math.sin(t * 1.2)})`; ctx.lineWidth = 1.5; ctx.stroke();
    }

    // ── Distant planet ──────────────────────────────────────────────────────
    function drawPlanet(t) {
      const px = W * 0.88, py = H * 0.18, pr = Math.min(W, H) * 0.062;
      ctx.save();
      // Atmosphere glow
      const atmG = ctx.createRadialGradient(px, py, pr * 0.85, px, py, pr * 1.55);
      atmG.addColorStop(0, "rgba(40,80,180,0)");
      atmG.addColorStop(0.4, "rgba(60,120,255,0.12)");
      atmG.addColorStop(0.75, "rgba(80,160,255,0.06)");
      atmG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(px, py, pr * 1.55, 0, Math.PI * 2); ctx.fillStyle = atmG; ctx.fill();

      // Planet body
      const pG = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 0, px, py, pr);
      pG.addColorStop(0, "#1a2d60"); pG.addColorStop(0.5, "#0d1a3a"); pG.addColorStop(1, "#040810");
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fillStyle = pG; ctx.fill();

      // Surface bands (rotating)
      ctx.save(); ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.clip();
      const bandRot = t * 0.012;
      for (let i = 0; i < 5; i++) {
        const by2 = py - pr + (i / 4) * pr * 2;
        const bh = pr * (0.08 + Math.sin(i * 1.3) * 0.06);
        ctx.save(); ctx.translate(px, by2); ctx.rotate(bandRot * (i % 2 === 0 ? 1 : -0.7));
        ctx.beginPath(); ctx.ellipse(0, 0, pr * 1.1, bh, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${i % 2 === 0 ? "30,60,120" : "20,40,90"},0.35)`; ctx.fill(); ctx.restore();
      }
      ctx.restore();

      // Ice cap
      const icG = ctx.createRadialGradient(px, py - pr * 0.7, 0, px, py - pr * 0.7, pr * 0.38);
      icG.addColorStop(0, "rgba(200,230,255,0.5)"); icG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(px, py - pr * 0.7, pr * 0.38, 0, Math.PI * 2); ctx.fillStyle = icG; ctx.fill();

      // Limb
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(80,160,255,0.25)"; ctx.lineWidth = 1.2; ctx.stroke();

      // Rings
      ctx.save(); ctx.translate(px, py); ctx.scale(1, 0.22); ctx.rotate(0.18);
      for (let ri = 0; ri < 3; ri++) {
        ctx.beginPath(); ctx.arc(0, 0, pr * (1.55 + ri * 0.28), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(140,180,255,${0.09 - ri * 0.02})`; ctx.lineWidth = pr * (0.045 - ri * 0.008); ctx.stroke();
      }
      ctx.restore(); ctx.restore();
    }

    let lastT2 = 0;
    function frame(ts) {
      const dt = Math.min((ts - lastT2) / 1000, 0.05); lastT2 = ts;
      const t = ts / 1000;

      // Lerp mouse
      mx += (tmx - mx) * 0.055; my += (tmy - my) * 0.055;
      scrollY += (tScrollY - scrollY) * 0.08;
      scrollVel *= 0.92;
      const scrollBoost = Math.min(Math.abs(scrollVel) * 0.008, 1);

      // Ship update
      ship.drift     += ship.driftSpd * dt * 60;
      ship.floatT    += dt;
      ship.breathT   += dt * 0.4;

      // Multi-layer organic float (3 sine waves at prime-ish frequencies)
      const fA = Math.sin(ship.floatT * 0.55) * 0.022;           // slow sway X
      const fB = Math.cos(ship.floatT * 0.38) * 0.014;           // slow sway X2
      const fC = Math.sin(ship.floatT * 0.71 + 1.2) * 0.018;     // bob Y
      const fD = Math.cos(ship.floatT * 0.47 + 2.4) * 0.012;     // bob Y2
      const fRoll  = Math.sin(ship.floatT * 0.42) * 0.12 + Math.cos(ship.floatT * 0.63) * 0.07;
      const fPitch = Math.cos(ship.floatT * 0.35) * 0.09 + Math.sin(ship.floatT * 0.58) * 0.05;

      ship.tx = 0.68 + (mx - 0.5) * 0.04 + fA + fB;
      ship.ty = 0.72 + (my - 0.5) * 0.025 + fC + fD;
      ship.x += (ship.tx - ship.x) * 0.018;
      ship.y += (ship.ty - ship.y) * 0.018;

      // Yaw & pitch blending mouse tilt + float
      ship.roll  += ((mx - 0.5) * 0.22 + fRoll  - ship.roll)  * 0.04;
      ship.pitch += ((my - 0.5) * 0.18 + fPitch - ship.pitch) * 0.04;

      ship.enginePulse += dt * (2.2 + scrollBoost * 4);
      ship.tScale = 1 + scrollBoost * 0.12;
      ship.scale += (ship.tScale - ship.scale) * 0.06;

      // Spawn engine particles
      ship.particleT += dt;
      if (ship.particleT > 0.022) {
        ship.particleT = 0;
        const sx = ship.x * W, sy = ship.y * H;
        const sz = Math.min(W, H) * 0.13 * ship.scale;
        [[-sz * 0.55, sz * 0.18], [0, sz * 0.22], [sz * 0.55, sz * 0.18]].forEach(([ox, oy]) => {
          for (let k = 0; k < 2; k++) spawnEP(sx + ox, sy + oy, k === 0 ? "0,200,255" : "168,85,247", 1 + scrollBoost * 2);
        });
      }

      // Meteor spawn
      if (t - lastMeteor > 2.5 + Math.random() * 6) { lastMeteor = t; spawnMeteor(); }

      ctx.clearRect(0, 0, W, H);

      // ── Deep space gradient ──
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, Math.max(W, H) * 1.1);
      bg.addColorStop(0, "#020818"); bg.addColorStop(0.35, "#010610"); bg.addColorStop(0.7, "#000408"); bg.addColorStop(1, "#000205");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // ── Nebulas ──
      NEBS.forEach(n => {
        n.phase += n.spd * dt * 60;
        const nx = (n.x + Math.sin(n.phase) * 0.015 + (mx - 0.5) * 0.03) * W;
        const ny = (n.y + Math.cos(n.phase * 0.7) * 0.01 + (my - 0.5) * 0.02) * H;
        const prl = 1 + scrollBoost * 0.04;
        ctx.save();
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.rx * W * prl);
        ng.addColorStop(0, `rgba(${n.col},${n.a * 2.2})`);
        ng.addColorStop(0.4, `rgba(${n.col},${n.a})`);
        ng.addColorStop(1, "transparent");
        ctx.translate(nx, ny); ctx.scale(1, n.ry / n.rx);
        ctx.beginPath(); ctx.arc(0, 0, n.rx * W * prl, 0, Math.PI * 2); ctx.fillStyle = ng; ctx.fill();
        ctx.restore();
      });

      drawLightRays(t);
      drawBlackHole(t);
      drawPlanet(t);

      // ── Stars ──
      [starsDeep, starsMid, starsNear].forEach(layer => {
        layer.forEach(st => {
          st.tp += dt * st.ts;
          const twinkle = 0.55 + 0.45 * Math.sin(st.tp);
          const sx = ((st.x + (mx - 0.5) * -st.parallax + scrollY * st.parallax * 0.001) % 1 + 1) % 1;
          const sy = (st.y + scrollBoost * st.parallax * 8 * dt) % 1;
          st.y = sy;

          if (scrollBoost > 0.1) {
            // Warp streak
            const strLen = st.r * 4 + scrollBoost * st.r * 30;
            const ang2 = Math.atan2(sy * H - H * 0.5, sx * W - W * 0.5);
            ctx.save(); ctx.translate(sx * W, sy * H);
            const sg = ctx.createLinearGradient(-Math.cos(ang2) * strLen, -Math.sin(ang2) * strLen, 0, 0);
            sg.addColorStop(0, "transparent"); sg.addColorStop(1, `rgba(${st.col},${st.a * twinkle})`);
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang2) * strLen * 0.3, Math.sin(ang2) * strLen * 0.3);
            ctx.strokeStyle = `rgba(${st.col},${st.a * twinkle})`; ctx.lineWidth = st.r * 0.6; ctx.stroke(); ctx.restore();
          } else {
            ctx.beginPath(); ctx.arc(sx * W, sy * H, st.r * twinkle, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${st.col},${st.a * twinkle})`; ctx.fill();
          }
        });
      });

      // ── Meteors ──
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life += dt; m.x += m.vx * dt * 60; m.y += m.vy * dt * 60;
        const lp = m.life / m.maxLife;
        m.alpha = lp < 0.15 ? lp / 0.15 : lp > 0.7 ? (1 - (lp - 0.7) / 0.3) : 1;
        const ang3 = Math.atan2(m.vy, m.vx);
        const mg = ctx.createLinearGradient(
          m.x, m.y,
          m.x - Math.cos(ang3) * m.len, m.y - Math.sin(ang3) * m.len
        );
        mg.addColorStop(0, `rgba(${m.col},${m.alpha * 0.95})`);
        mg.addColorStop(0.3, `rgba(${m.col},${m.alpha * 0.4})`);
        mg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - Math.cos(ang3) * m.len, m.y - Math.sin(ang3) * m.len);
        ctx.strokeStyle = mg; ctx.lineWidth = 1.8 + m.alpha * 1.2; ctx.stroke();
        // Glow head
        const mhg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 5);
        mhg.addColorStop(0, `rgba(255,255,255,${m.alpha * 0.9})`);
        mhg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(m.x, m.y, 5, 0, Math.PI * 2); ctx.fillStyle = mhg; ctx.fill();
        if (m.life >= m.maxLife) meteors.splice(i, 1);
      }

      // ── Cosmic dust / particles ──
      const dustT = t * 0.2;
      for (let i = 0; i < 55; i++) {
        const dx = ((Math.sin(i * 2.3 + dustT) * 0.5 + 0.5 + (mx - 0.5) * 0.04) % 1 + 1) % 1;
        const dy = ((Math.cos(i * 1.7 + dustT * 0.8) * 0.5 + 0.5 + scrollBoost * 0.1) % 1 + 1) % 1;
        const da = 0.06 + 0.04 * Math.sin(i + t);
        const dr = 0.5 + 0.5 * Math.abs(Math.sin(i * 0.5));
        ctx.beginPath(); ctx.arc(dx * W, dy * H, dr, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? `rgba(168,85,247,${da})` : `rgba(0,200,255,${da * 0.7})`; ctx.fill();
      }

      // ── Engine particles ──
      drawEParts(dt);

      // ── Spaceship ──
      const sz2 = Math.min(W, H) * 0.13 * ship.scale;
      drawShip(ship.x * W, ship.y * H, sz2, t, ship.roll * 0.18, ship.pitch * 0.12, 0);

      // ── Chromatic aberration vignette ──
      const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.3, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(0.7, "rgba(0,0,8,0.18)");
      vig.addColorStop(1, "rgba(0,0,16,0.72)");
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

      // Soft scan line
      const scanY = (t * 80) % H;
      const scanG = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      scanG.addColorStop(0, "transparent");
      scanG.addColorStop(0.5, "rgba(0,200,255,0.025)");
      scanG.addColorStop(1, "transparent");
      ctx.fillStyle = scanG; ctx.fillRect(0, scanY - 2, W, 4);

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }} />;
}

// ─── CURSOR ───────────────────────────────────────────────────────────────────
function Cursor() {
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
      if (["p","span","h1","h2","h3","h4","h5","h6","li","label"].includes(tag)) return "text";
      return "default";
    }

    function updateMagnet(mx,my) {
      const els=document.querySelectorAll("button,a,[class*='btn'],[class*='card']");
      let best=null,bestDist=90;
      els.forEach(el=>{
        const r=el.getBoundingClientRect();
        const cx=r.left+r.width/2, cy=r.top+r.height/2;
        const d=Math.hypot(mx-cx,my-cy);
        if(d<bestDist){bestDist=d;best={cx,cy,d};}
      });
      S.magnetTarget=best;
      if(best){
        const pull=Math.pow(1-best.d/90,2.5)*20;
        const ang=Math.atan2(best.cy-my,best.cx-mx);
        S.magnetX=mx+Math.cos(ang)*pull; S.magnetY=my+Math.sin(ang)*pull;
      } else { S.magnetX=mx; S.magnetY=my; }
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
      S.ix+=(S.magnetX-S.ix)*.28; S.iy+=(S.magnetY-S.iy)*.28;
      S.ox+=(S.magnetX-S.ox)*.13; S.oy+=(S.magnetY-S.oy)*.13;
      const spd=Math.hypot(S.vx,S.vy);
      S.modeProgress=Math.min(1,S.modeProgress+.07);
      const outerR={default:26,button:38,link:20,card:44,text:18}[S.mode]??26;
      const coreR={default:5,button:7,link:3,card:8,text:2.5}[S.mode]??5;
      const accentCol=S.mode==="card"?"138,46,255":"0,245,255";
      S.ringAngle+=.016*(2.2+spd*.04+(S.mode==="button"?1.5:0));
      S.radarAngle+=.016*1.6;

      // Trail
      if(spd>5){
        const steps=Math.min(6,Math.floor(spd*.5));
        for(let i=steps;i>=1;i--){
          const tr=i/steps, tx=S.ox+(S.mx-S.ox)*(1-tr*.8), ty=S.oy+(S.my-S.oy)*(1-tr*.8);
          ctx.beginPath(); ctx.arc(tx,ty,coreR*(.4+tr*.5),0,Math.PI*2);
          ctx.fillStyle=`rgba(0,245,255,${.05*tr})`; ctx.fill();
        }
      }

      // Ambient glow
      const glowR=outerR+28+Math.sin(t*2.2)*5;
      let gG=ctx.createRadialGradient(S.ox,S.oy,0,S.ox,S.oy,glowR);
      gG.addColorStop(0,`rgba(0,245,255,${.065+(spd>3?.03:0)})`); gG.addColorStop(.4,"rgba(0,119,255,.025)"); gG.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(S.ox,S.oy,glowR,0,Math.PI*2); ctx.fillStyle=gG; ctx.fill();
      let gG2=ctx.createRadialGradient(S.ox,S.oy,0,S.ox,S.oy,glowR*.7);
      gG2.addColorStop(0,"rgba(138,46,255,.03)"); gG2.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(S.ox,S.oy,glowR*.7,0,Math.PI*2); ctx.fillStyle=gG2; ctx.fill();

      // Outer ring segments
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

      // Counter-rotating dashed ring
      ctx.save(); ctx.translate(S.ox,S.oy); ctx.rotate(-S.ringAngle*.6);
      ctx.beginPath(); ctx.arc(0,0,outerR*.68,0,Math.PI*2);
      ctx.setLineDash([3,8]); ctx.strokeStyle=`rgba(${accentCol},.22)`; ctx.lineWidth=.8; ctx.shadowBlur=0; ctx.stroke();
      ctx.setLineDash([]); ctx.restore();

      // Radar sweep
      ctx.save(); ctx.translate(S.ox,S.oy); ctx.rotate(S.radarAngle);
      const sweepR=outerR*.66;
      for(let i=0;i<16;i++){
        const a=-(i/16)*Math.PI*.85;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,sweepR-2,a,a+.07); ctx.closePath();
        ctx.fillStyle=`rgba(0,245,255,${(1-i/16)*.16})`; ctx.fill();
      }
      ctx.restore();

      // Diamond tick
      ctx.save(); ctx.translate(S.ox,S.oy); ctx.rotate(S.ringAngle*1.25);
      const diam=outerR+8;
      ctx.beginPath(); ctx.moveTo(0,-diam-5); ctx.lineTo(3.5,-diam); ctx.lineTo(0,-diam+5); ctx.lineTo(-3.5,-diam); ctx.closePath();
      ctx.fillStyle="#00f5ff"; ctx.shadowColor="#00f5ff"; ctx.shadowBlur=14; ctx.fill();
      ctx.restore();

      // Inner core
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

      // Crosshair
      if(S.mode==="button"||S.mode==="card"){
        const len=outerR-7;
        ctx.strokeStyle=`rgba(${accentCol},${S.modeProgress*.5})`; ctx.lineWidth=.7; ctx.shadowBlur=0;
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{
          ctx.beginPath(); ctx.moveTo(dx*(coreR+3),dy*(coreR+3)); ctx.lineTo(dx*len,dy*len); ctx.stroke();
        });
      }
      // I-beam
      if(S.mode==="text"){
        ctx.strokeStyle="rgba(0,245,255,.9)"; ctx.lineWidth=1.5; ctx.shadowColor="#00f5ff"; ctx.shadowBlur=10;
        [[0,-13,0,13],[-4,-13,4,-13],[-4,13,4,13]].forEach(([x1,y1,x2,y2])=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();});
      }
      // Arrow
      if(S.mode==="link"){
        ctx.strokeStyle="rgba(255,44,251,.95)"; ctx.lineWidth=2; ctx.shadowColor="#ff2cfb"; ctx.shadowBlur=14;
        ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(8,0); ctx.lineTo(0,8); ctx.stroke();
      }
      ctx.restore();

      // Dashed connector line
      const dist=Math.hypot(S.ox-S.ix,S.oy-S.iy);
      if(dist>5){
        ctx.setLineDash([2,7]); ctx.strokeStyle="rgba(0,245,255,.16)"; ctx.lineWidth=.7; ctx.shadowBlur=0;
        ctx.beginPath(); ctx.moveTo(S.ox,S.oy); ctx.lineTo(S.ix,S.iy); ctx.stroke(); ctx.setLineDash([]);
      }

      // Button bloom
      if(S.mode==="button"&&S.magnetTarget){
        const {cx:bcx,cy:bcy}=S.magnetTarget, phase=(t*1.8)%1;
        const ba=phase<.5?phase*.14:(1-phase)*.14;
        const bG=ctx.createRadialGradient(bcx,bcy,0,bcx,bcy,58);
        bG.addColorStop(0,`rgba(0,245,255,${ba})`); bG.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(bcx,bcy,58,0,Math.PI*2); ctx.fillStyle=bG; ctx.fill();
      }

      // Sparks
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

// ─── HUD TIME ─────────────────────────────────────────────────────────────────
function HudTime() {
  const [t,setT]=useState("");
  useEffect(()=>{
    const tick=()=>{ const n=new Date(); setT("TIME: "+String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0")+":"+String(n.getSeconds()).padStart(2,"0")); };
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  },[]);
  return <>{t}</>;
}

// ─── COUNTDOWN ───────────────────────────────────────────────────────────────
function Countdown() {
  const TARGET = new Date("2026-05-19T05:00:00Z").getTime();
  const calc = () => {
    const diff = Math.max(0, TARGET - Date.now());
    return {
      d: String(Math.floor(diff/864e5)).padStart(2,"0"),
      h: String(Math.floor(diff%864e5/36e5)).padStart(2,"0"),
      m: String(Math.floor(diff%36e5/6e4)).padStart(2,"0"),
      s: String(Math.floor(diff%6e4/1e3)).padStart(2,"0"),
    };
  };
  const [cd,setCd]=useState({d:"00",h:"00",m:"00",s:"00"});
  useEffect(()=>{ setCd(calc()); const id=setInterval(()=>setCd(calc()),1000); return ()=>clearInterval(id); },[]);
  return (
    <div className="imp-hcd">
      {[["d","DAYS"],["h","HOURS"],["m","MINUTES"],["s","SECONDS"]].map(([k,l])=>(
        <div className="imp-cdi" key={k}>
          <span className="imp-cdn">{cd[k]}</span>
          <span className="imp-cdl">{l}</span>
        </div>
      ))}
    </div>
  );
}

// ─── NETWORK CANVAS ───────────────────────────────────────────────────────────
function NetworkCanvas() {
  const ref=useRef(null);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext("2d");
    let W,H;
    const resize=()=>{ W=c.width=c.parentElement?.offsetWidth||window.innerWidth; H=c.height=c.parentElement?.offsetHeight||window.innerHeight; };
    resize(); window.addEventListener("resize",resize);
    const pts=Array.from({length:55},()=>({ x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,vx:(Math.random()-.5)*.28,vy:(Math.random()-.5)*.28 }));
    let rafId;
    function frame() {
      ctx.clearRect(0,0,W,H);
      pts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1; });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++) {
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<115){ ctx.strokeStyle=`rgba(0,245,255,${0.055*(1-d/115)})`; ctx.lineWidth=.45; ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke(); }
      }
      rafId=requestAnimationFrame(frame);
    }
    rafId=requestAnimationFrame(frame);
    return ()=>{ cancelAnimationFrame(rafId); window.removeEventListener("resize",resize); };
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,zIndex:3,pointerEvents:"all"}} />;
}

// ─── PAGE WRAPPER ─────────────────────────────────────────────────────────────
function Page({id,active,className="",children,style={}}) {
  const ref=useRef(null);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    if(active) { el.style.display="flex"; requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add("visible"))); }
    else { el.classList.remove("visible"); const t=setTimeout(()=>{ el.style.display="none"; },420); return ()=>clearTimeout(t); }
  },[active]);
  return (
    <div ref={ref} id={id} className={`imp-page ${className}`} style={{display:"none",paddingTop:76,...style}}>
      {children}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function ImperiumPage() {
  const [loaderDone,setLoaderDone]=useState(false);
  const [page,setPage]=useState("pl");
  const [members,setMembers]=useState([false,false,false]);
  const [loginAlert,setLoginAlert]=useState(""); const [loginSucc,setLoginSucc]=useState("");
  const [regAlert,setRegAlert]=useState(""); const [regSucc,setRegSucc]=useState("");
  const [loginEmail,setLoginEmail]=useState(""); const [loginPwd,setLoginPwd]=useState("");
  const [regForm,setRegForm]=useState({tn:"",te:"",p1:"",p2:"",terms:false});
  const [memberData,setMemberData]=useState([{n:"",e:""},{n:"",e:""},{n:"",e:""},{n:"",e:""}]);
  const [loginLoading,setLoginLoading]=useState(false);
  const [regLoading,setRegLoading]=useState(false);

  useEffect(()=>{
    const s=document.createElement("style"); s.textContent=CSS; document.head.appendChild(s);
    return ()=>document.head.removeChild(s);
  },[]);

  const go=useCallback((id)=>{
    setPage(id);
    setLoginAlert(""); setLoginSucc(""); setRegAlert(""); setRegSucc("");
    window.scrollTo({top:0,behavior:"smooth"});
  },[]);

  function doLogin() {
    setLoginAlert(""); setLoginSucc("");
    if(!loginEmail||!loginPwd){setLoginAlert("⚠ FILL ALL REQUIRED FIELDS.");return;}
    if(loginEmail.length<3){setLoginAlert("⚠ USERNAME TOO SHORT.");return;}
    if(loginPwd.length<6){setLoginAlert("⚠ PASSWORD MUST BE AT LEAST 6 CHARACTERS.");return;}
    setLoginLoading(true);
    setTimeout(()=>{
      setLoginLoading(false);
      setLoginSucc("✓ AUTHENTICATION SUCCESSFUL. ENTERING IMPERIUM...");
      setTimeout(()=>go("pl"),2200);
    },1600);
  }

  function doRegister() {
    setRegAlert(""); setRegSucc("");
    if(!regForm.tn||!regForm.te||!regForm.p1||!regForm.p2){setRegAlert("⚠ FILL ALL REQUIRED FIELDS.");return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.te)){setRegAlert("⚠ INVALID EMAIL FORMAT.");return;}
    if(regForm.p1.length<6){setRegAlert("⚠ PASSWORD MUST BE AT LEAST 6 CHARACTERS.");return;}
    if(regForm.p1!==regForm.p2){setRegAlert("⚠ PASSWORDS DO NOT MATCH.");return;}
    if(!regForm.terms){setRegAlert("⚠ ACCEPT TERMS TO CONTINUE.");return;}
    setRegLoading(true);
    setTimeout(()=>{
      setRegLoading(false);
      setRegSucc("✓ TEAM REGISTERED. WELCOME TO THE RESISTANCE!");
      setTimeout(()=>go("plog"),2600);
    },1800);
  }

  function enableMember(idx) { setMembers(prev=>{const n=[...prev];n[idx-2]=true;return n;}); }
  const memberCount=1+members.filter(Boolean).length;

  return (
    <div className="imp-root">
      {!loaderDone && <Loader onDone={()=>setLoaderDone(true)} />}
      <Cursor />
      <div className="imp-scanlines"></div>
      <div className="imp-gbg"></div>
      <CinematicSpace />

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

      {/* ── LANDING ── */}
      <Page id="pl" active={page==="pl"} style={{alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
        <RoboticLab />
        <div className="imp-hero">
          <div className="imp-h-ather"><span className="imp-aico">◆</span>ATHERA PRESENTS<span className="imp-aico">◆</span></div>
          <h1 className="imp-htitle"><span className="imp-gt">IMPERIUM</span></h1>
          <div className="imp-hsub">— AN IMMERSIVE AI CHALLENGE EXPERIENCE —</div>
          <div className="imp-htag">BUILD · SOLVE · RESTORE · THE FUTURE IS IN YOUR CODE</div>
          <div className="imp-hcta">
            <button className="imp-btnp" onClick={()=>go("plog")}>LOGIN</button>
          </div>
          <Countdown />
        </div>
        <div className="imp-ticker-wrap">
          <div className="imp-ticker">
            {["⚡ IMPERIUM AWAKENS","HEALTHCARE: COMPROMISED","FINANCE: COMPROMISED","SECURITY: BREACHED","INFRASTRUCTURE: CRITICAL","ONLY YOUR CODE CAN SAVE US","REGISTRATION OPEN · JOIN THE RESISTANCE"].map((t,i)=>(
              <span key={i}>{t}<span className="imp-tsp"> ///</span></span>
            ))}
            {["⚡ IMPERIUM AWAKENS","HEALTHCARE: COMPROMISED","FINANCE: COMPROMISED","SECURITY: BREACHED","INFRASTRUCTURE: CRITICAL","ONLY YOUR CODE CAN SAVE US","REGISTRATION OPEN · JOIN THE RESISTANCE"].map((t,i)=>(
              <span key={"b"+i}>{t}<span className="imp-tsp"> ///</span></span>
            ))}
          </div>
        </div>


      </Page>

      {/* ── LOGIN ── */}
      <Page id="plog" active={page==="plog"} style={{alignItems:"center",justifyContent:"center",padding:"90px 24px 40px", position:"relative"}}>
        <RoboticLab />
        <div style={{position:"relative",zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:460}}>
          {/* Logo + title */}
          <svg viewBox="0 0 32 32" fill="none" style={{filter:"drop-shadow(0 0 14px #00f5ff)",width:44,height:44,marginBottom:8}}>
            <path d="M16 4L20 14L28 8L24 20H8L4 8L12 14L16 4Z" stroke="#00f5ff" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <rect x="8" y="22" width="16" height="4" rx="1" fill="rgba(0,245,255,.28)" stroke="#00f5ff" strokeWidth="1"/>
          </svg>
          <div className="imp-aclogo" style={{fontSize:"clamp(22px,3.5vw,32px)",letterSpacing:6}}>IMPERIUM</div>
          <div className="imp-acsub" style={{marginTop:4,marginBottom:18,fontSize:9}}>SECURE ACCESS TERMINAL · v2080</div>

          {/* Main card */}
          <div className="imp-apanel" style={{width:"100%",position:"relative",padding:"32px 30px 26px"}}>
            <div className="imp-pc imp-pc-tl"/><div className="imp-pc imp-pc-bl"/>
            <div className="imp-pc imp-pc-tr"/><div className="imp-pc imp-pc-br"/>

            {/* Header row */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <div>
                <div className="imp-apt" style={{color:"var(--c)",fontSize:18,letterSpacing:4}}>LOGIN</div>
                <div className="imp-aps" style={{marginBottom:0}}>WELCOME BACK, RECRUIT.</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"var(--grn)",letterSpacing:2}}>● SYSTEM ONLINE</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"var(--dim)",letterSpacing:1,marginTop:3}}>AUTH NODE: ALPHA-7</div>
              </div>
            </div>

            {/* Divider */}
            <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(0,245,255,.25),transparent)",margin:"12px 0 18px"}}/>

            {/* Alerts */}
            {loginAlert && <div className="imp-alert imp-show">{loginAlert}</div>}
            {loginSucc  && <div className="imp-succ imp-show">{loginSucc}</div>}

            {/* Username field */}
            <div className="imp-fg">
              <label className="imp-flabel" style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{color:"var(--c)",fontSize:9}}>▸</span> USERNAME
              </label>
              <div className="imp-iw">
                <span className="imp-iico" style={{fontSize:12,opacity:.5}}>⬡</span>
                <input
                  type="text"
                  className="imp-finput"
                  placeholder="Enter your username"
                  value={loginEmail}
                  onChange={e=>setLoginEmail(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&doLogin()}
                  style={{fontFamily:"'Share Tech Mono',monospace",letterSpacing:1}}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="imp-fg">
              <label className="imp-flabel" style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{color:"var(--c)",fontSize:9}}>▸</span> PASSWORD
              </label>
              <div className="imp-iw">
                <span className="imp-iico" style={{fontSize:12,opacity:.5}}>◈</span>
                <input
                  type="password"
                  className="imp-finput"
                  placeholder="••••••••••••"
                  value={loginPwd}
                  onChange={e=>setLoginPwd(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&doLogin()}
                  style={{fontFamily:"'Share Tech Mono',monospace",letterSpacing:3}}
                />
              </div>
            </div>

            {/* Remember + Forgot row */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,marginTop:-6}}>
              <label style={{display:"flex",alignItems:"center",gap:7,cursor:"none"}}>
                <input type="checkbox" style={{accentColor:"var(--c)",width:11,height:11}}/>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"var(--dim)",letterSpacing:1}}>REMEMBER DEVICE</span>
              </label>
              <button className="imp-flink" style={{margin:0,fontSize:8}}>FORGOT PASSWORD?</button>
            </div>

            {/* Login button */}
            <button
              className="imp-btnauth imp-btnc"
              onClick={doLogin}
              style={{opacity:loginLoading?0.6:1,fontSize:11,letterSpacing:4,padding:"13px 20px"}}
            >
              {loginLoading
                ? <span style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center"}}>
                    <span style={{display:"inline-block",width:10,height:10,border:"1.5px solid #020810",borderTop:"1.5px solid transparent",borderRadius:"50%",animation:"imp-spin .7s linear infinite"}}/>
                    AUTHENTICATING...
                  </span>
                : "INITIATE LOGIN"}
            </button>

            {/* Divider */}
            <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(0,245,255,.1),transparent)",margin:"18px 0 14px"}}/>

            {/* Bottom meta row */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <button className="imp-backlink" onClick={()=>go("pl")} style={{fontSize:8,letterSpacing:2}}>← BACK TO BASE</button>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"var(--dim)",letterSpacing:1,textAlign:"right"}}>
                NEW RECRUIT?{" "}
                <span style={{color:"var(--c)",cursor:"none",fontSize:7}}>REQUEST ACCESS</span>
              </div>
            </div>
          </div>

          {/* Security badge strip */}
          <div style={{display:"flex",gap:18,marginTop:14,alignItems:"center"}}>
            {["256-BIT ENCRYPT","BIOMETRIC READY","ZERO-TRUST AUTH"].map((badge,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:`rgba(0,${200+i*20},${180+i*25},0.7)`,boxShadow:`0 0 6px rgba(0,${200+i*20},${180+i*25},0.8)`}}/>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"var(--dim)",letterSpacing:1.5}}>{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spinner keyframe */}
        <style>{`@keyframes imp-spin{to{transform:rotate(360deg)}}`}</style>
      </Page>


    </div>
  );
}
