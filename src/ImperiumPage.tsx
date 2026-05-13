import type React from "react";
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
    0 0 32px rgba(0,245,255,.9),
    0 0 64px rgba(0,245,255,.45),
    0 0 128px rgba(0,245,255,.18);
  animation: title-flicker 6s ease-in-out infinite;
}
@keyframes title-flicker {
  0%,100% { text-shadow: 0 0 32px rgba(0,245,255,.9),0 0 64px rgba(0,245,255,.45); }
  89%,92%  { text-shadow: 0 0 32px rgba(0,245,255,.9),0 0 64px rgba(0,245,255,.45); }
  90%      { text-shadow: 0 0 6px rgba(0,245,255,.2); }
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
function Loader({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const warpRef = useRef<HTMLCanvasElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const barFillRef = useRef<HTMLDivElement | null>(null);
  const barPctRef = useRef<HTMLSpanElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);

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

    // ── Progress system ──────────────────────────────────────────────────────
    const TOTAL_DUR = 28000, BASE_SPD = 1 / TOTAL_DUR, HELD_SPD = BASE_SPD * 14;
    let held = false, progress = 0, done = false;

    const STATUSES = [
      "▸ INITIALIZING NEURAL CORTEX...",
      "▸ LOADING MOTOR SYSTEMS...",
      "▸ CALIBRATING OPTICAL SENSORS...",
      "▸ ACTIVATING POWER CORE...",
      "▸ SYNCING HOLOGRAPHIC HUD...",
      "▸ RUNNING THREAT ASSESSMENT...",
      "▸ CIRCUIT MATRIX ONLINE...",
      "▸ AI CONSCIOUSNESS BOOTING...",
      "✓ UNIT ONLINE — ENTERING IMPERIUM",
    ];
    let lastStatIdx = -1;
    const updateStatus = () => {
      if (!statusEl) return;
      const idx = Math.min(Math.floor(progress * (STATUSES.length - 1)), STATUSES.length - 2);
      if (progress >= 0.98) { statusEl.textContent = STATUSES[STATUSES.length - 1]; }
      else if (idx !== lastStatIdx) {
        statusEl.style.opacity = "0";
        setTimeout(() => { if (statusEl) { statusEl.textContent = STATUSES[idx]; statusEl.style.opacity = "1"; } }, 140);
        lastStatIdx = idx;
      }
    };

    // ── Floating data panels ──────────────────────────────────────────────────
    const DATA_PANELS = [
      { x: 0.08, y: 0.28, w: 160, h: 90, label: "NEURAL.NET", lines: ["CORTEX: ONLINE","MEMORY: 98.4%","LATENCY: 2ms"], col: "0,245,255", phase: 0 },
      { x: 0.84, y: 0.22, w: 150, h: 80, label: "POWER CORE", lines: ["OUTPUT: 142%","TEMP: 38°C","STATUS: PRIME"], col: "168,85,247", phase: 1.2 },
      { x: 0.06, y: 0.6,  w: 140, h: 75, label: "MOTOR SYS", lines: ["JOINTS: 48/48","SERVO: LOCKED","FORCE: MAX"], col: "0,255,136", phase: 2.1 },
      { x: 0.86, y: 0.62, w: 155, h: 80, label: "THREAT SCAN", lines: ["TARGETS: NONE","RANGE: 500m","ALERT: LOW"], col: "255,180,0", phase: 0.7 },
    ];

    // ── Circuit spark particles ───────────────────────────────────────────────
    const circuitSparks = [];
    function spawnSpark(x, y, col) {
      for (let i = 0; i < 4; i++) {
        const ang = Math.random() * Math.PI * 2;
        circuitSparks.push({ x, y, vx: Math.cos(ang)*(1+Math.random()*3), vy: Math.sin(ang)*(1+Math.random()*3), life: 1, col, r: 1+Math.random()*2 });
      }
    }

    // ── Robot state ──────────────────────────────────────────────────────────
    let robotPulse = 0, eyeFlicker = 0, circuitPhase = 0, bootPhase = 0;

    // ── Draw lab floor grid ───────────────────────────────────────────────────
    function drawLabFloor() {
      const fy = H * 0.82;
      ctx.save();
      ctx.strokeStyle = "rgba(0,245,255,0.06)"; ctx.lineWidth = 0.7;
      // Perspective grid
      const vp = { x: W*0.5, y: fy - H*0.12 };
      const cols = 22, rows = 10;
      for (let c = 0; c <= cols; c++) {
        const bx = W * (c / cols);
        ctx.beginPath(); ctx.moveTo(bx, fy + 80); ctx.lineTo(vp.x, vp.y); ctx.stroke();
      }
      for (let r = 1; r <= rows; r++) {
        const t = r / rows;
        const lx = vp.x + (0 - vp.x) * t, rx = vp.x + (W - vp.x) * t;
        const ly = vp.y + (fy + 80 - vp.y) * t;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ly); ctx.stroke();
      }
      // Floor glow
      const fg = ctx.createRadialGradient(W*0.5, fy, 0, W*0.5, fy, W*0.45);
      fg.addColorStop(0, "rgba(0,245,255,0.06)"); fg.addColorStop(1, "transparent");
      ctx.fillStyle = fg; ctx.fillRect(0, fy - 20, W, 120);
      ctx.restore();
    }

    // ── Draw volumetric light beams ───────────────────────────────────────────
    function drawVolumetricLight(prog) {
      ctx.save();
      const cx2 = W*0.5, ty = H*0.05;
      // Main top beam
      const beamA = 0.06 + prog * 0.14;
      const bg2 = ctx.createLinearGradient(cx2, ty, cx2, H*0.7);
      bg2.addColorStop(0, `rgba(0,245,255,${beamA})`);
      bg2.addColorStop(0.3, `rgba(0,180,255,${beamA*0.4})`);
      bg2.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.moveTo(cx2 - 8, ty); ctx.lineTo(cx2 + 8, ty);
      ctx.lineTo(cx2 + W*0.22, H*0.75); ctx.lineTo(cx2 - W*0.22, H*0.75);
      ctx.closePath(); ctx.fillStyle = bg2; ctx.fill();

      // Side beams
      [[-1,1],[1,1]].forEach(([sx]) => {
        const bx = cx2 + sx * W*0.38;
        const sbg = ctx.createLinearGradient(bx, ty*2, cx2, H*0.65);
        sbg.addColorStop(0, `rgba(168,85,247,${beamA*0.5})`);
        sbg.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.moveTo(bx - 3, ty*2); ctx.lineTo(bx + 3, ty*2);
        ctx.lineTo(cx2 + sx*50, H*0.65); ctx.lineTo(cx2 - sx*10, H*0.65);
        ctx.closePath(); ctx.fillStyle = sbg; ctx.fill();
      });
      ctx.restore();
    }

    // ── Draw HUD diagnostics floating around robot ─────────────────────────
    function drawHUDPanels(cx2, baseY, S, prog) {
      if (prog < 0.2) return;
      const pa = Math.min(1, (prog - 0.2) / 0.35);
      const t2 = performance.now() / 1000;
      const panels = [
        { ox: -S*1.05, oy: -S*0.85, w: 110, h: 72, label: "NEURAL.BOOT", lines: ["CORTEX: LOADING","SYNAPSES: 47%","LATENCY: 3ms"], col: "0,245,255" },
        { ox:  S*0.75,  oy: -S*0.9,  w: 105, h: 68, label: "POWER CORE",  lines: ["OUTPUT: 142%","TEMP: 38°C","ARC: STABLE"],   col: "0,200,255" },
        { ox: -S*1.1,  oy: -S*0.3,  w: 100, h: 60, label: "MOTOR SYS",   lines: ["SERVO: LOCK","JOINTS: 48/48","TORQUE: MAX"],  col: "0,180,255" },
        { ox:  S*0.82,  oy: -S*0.28, w: 108, h: 62, label: "THREAT SCAN", lines: ["RANGE: 800m","TARGETS: 0","ALERT: LOW"],     col: "0,220,255" },
        { ox: -S*0.55, oy: -S*1.38, w: 130, h: 30, label: "SYS STATUS",  lines: ["BOOT SEQ: "+Math.min(100,Math.round(prog*100))+"%"], col:"0,245,255" },
      ];
      panels.forEach((p, i) => {
        const bob = Math.sin(t2 * 0.55 + i * 1.3) * 5;
        const px = cx2 + p.ox, py = baseY + p.oy + bob;
        const alpha = pa * (0.7 + 0.2 * Math.sin(t2 * 0.8 + i));
        ctx.save(); ctx.globalAlpha = alpha;
        // panel bg
        ctx.fillStyle = "rgba(0,6,20,0.82)";
        ctx.strokeStyle = `rgba(${p.col},0.65)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(px, py, p.w, p.h, 3); ctx.fill(); ctx.stroke();
        // top accent bar
        ctx.fillStyle = `rgba(${p.col},0.18)`;
        ctx.beginPath(); ctx.roundRect(px, py, p.w, 14, [3,3,0,0]); ctx.fill();
        // label
        ctx.font = "700 8px 'Share Tech Mono',monospace";
        ctx.fillStyle = `rgba(${p.col},0.95)`; ctx.textAlign = "left";
        ctx.fillText("▸ " + p.label, px + 6, py + 10);
        // lines
        p.lines.forEach((ln, li) => {
          ctx.font = "500 7.5px 'Share Tech Mono',monospace";
          ctx.fillStyle = `rgba(${p.col},0.65)`;
          ctx.fillText(ln, px + 6, py + 24 + li * 13);
          // mini bar
          const bw = (p.w - 12) * (0.3 + ((li * 0.23 + prog * 0.5) % 0.65));
          ctx.fillStyle = `rgba(${p.col},0.12)`; ctx.fillRect(px+6, py+26+li*13, p.w-12, 2);
          ctx.fillStyle = `rgba(${p.col},0.5)`;  ctx.fillRect(px+6, py+26+li*13, bw, 2);
        });
        // dashed connector line to robot center
        ctx.setLineDash([2,5]); ctx.strokeStyle = `rgba(${p.col},0.2)`; ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(px + p.w*0.5, py + p.h*0.5); ctx.lineTo(cx2, baseY - S*0.4); ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1; ctx.restore();
      });
    }

    // ── Draw fog / atmospheric haze ────────────────────────────────────────
    function drawFog(cx2, baseY, prog) {
      const fa = Math.min(0.55, prog * 0.7);
      // Ground fog layer
      const fg = ctx.createRadialGradient(cx2, baseY + 10, 0, cx2, baseY + 10, W * 0.55);
      fg.addColorStop(0, `rgba(0,40,80,${fa * 0.5})`);
      fg.addColorStop(0.4, `rgba(0,20,50,${fa * 0.22})`);
      fg.addColorStop(1, "transparent");
      ctx.fillStyle = fg; ctx.fillRect(0, baseY - 30, W, 80);
      // Side atmospheric fog
      [[0, 0.35], [1, 0.35]].forEach(([side]) => {
        const fx = side === 0 ? 0 : W;
        const sfg = ctx.createRadialGradient(fx, baseY - 100, 0, fx, baseY - 100, W * 0.45);
        sfg.addColorStop(0, `rgba(0,30,70,${fa * 0.3})`);
        sfg.addColorStop(1, "transparent");
        ctx.fillStyle = sfg; ctx.fillRect(0, 0, W, H);
      });
    }

    // ── Draw robot ────────────────────────────────────────────────────────────
    function drawRobot(prog, isHeld) {
      robotPulse += 0.04 * (isHeld ? 2.5 : 1);
      eyeFlicker += 0.12;
      circuitPhase += 0.025 * (isHeld ? 3 : 1);
      bootPhase = prog;

      const cx2 = W * 0.5;
      const baseY = H * 0.78;
      const S = Math.min(W, H) * 0.44 * Math.min(1, 0.25 + prog * 1.05);
      const ep = 0.5 + 0.5 * Math.sin(robotPulse * 2);
      const eyeA = prog > 0.12 ? Math.min(1, (prog - 0.12) / 0.18) * (0.9 + 0.1 * Math.sin(eyeFlicker)) : 0;
      const eyeCol = isHeld ? "0,255,220" : "0,220,255";
      const circA = Math.min(1, prog * 2.8);

      // Draw fog before robot
      drawFog(cx2, baseY, prog);
      // Draw HUD panels
      drawHUDPanels(cx2, baseY, S, prog);

      ctx.save();
      ctx.translate(cx2, baseY);

      // ── REFLECTIVE FLOOR POOL ──
      const pedW = S * 0.6;
      // Reflection glow (metallic floor)
      const refG = ctx.createRadialGradient(0, 10, 0, 0, 10, pedW * 1.3);
      refG.addColorStop(0, `rgba(${eyeCol},${0.18 * ep})`);
      refG.addColorStop(0.35, `rgba(0,80,160,${0.09})`);
      refG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.ellipse(0, 12, pedW * 1.3, pedW * 0.28, 0, 0, Math.PI*2);
      ctx.fillStyle = refG; ctx.fill();
      // Pedestal rings
      for (let r = 0; r < 3; r++) {
        const rr = pedW * (0.55 + r * 0.22) * (1 + 0.06 * ep);
        ctx.beginPath(); ctx.ellipse(0, 8, rr, rr * 0.18, 0, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(${eyeCol},${(0.35 - r * 0.1) * ep})`; ctx.lineWidth = 1 - r * 0.25; ctx.stroke();
      }
      // Shadow
      const shadowG = ctx.createRadialGradient(0, 4, 0, 0, 4, pedW * 1.1);
      shadowG.addColorStop(0, "rgba(0,0,0,0.75)"); shadowG.addColorStop(1, "transparent");
      ctx.save(); ctx.scale(1, 0.18);
      ctx.beginPath(); ctx.arc(0, 0, pedW * 1.1, 0, Math.PI*2); ctx.fillStyle = shadowG; ctx.fill();
      ctx.restore();

      const by = -S * 0.02;

      // ── LEGS – titanium-carbon panels ──
      [[-1],[1]].forEach(([fl]) => {
        const lx = fl * S * 0.155, ly = by;
        // Outer titanium highlight
        const thG = ctx.createLinearGradient(lx - S*0.08, ly - S*0.44, lx + S*0.08, ly - S*0.14);
        thG.addColorStop(0, fl > 0 ? "#2a3d55" : "#1c2e44");
        thG.addColorStop(0.4, "#0e1e30");
        thG.addColorStop(1, "#070f1c");
        // Thigh outer plate
        ctx.beginPath(); ctx.roundRect(lx - S*0.075, ly - S*0.44, S*0.145, S*0.3, [6,6,3,3]);
        ctx.fillStyle = thG; ctx.fill();
        ctx.strokeStyle = `rgba(${eyeCol},0.28)`; ctx.lineWidth = 0.9; ctx.stroke();
        // Thigh metallic sheen
        const sheen = ctx.createLinearGradient(lx - S*0.075, ly - S*0.44, lx, ly - S*0.14);
        sheen.addColorStop(0, `rgba(180,220,255,${fl>0?0.08:0.04})`); sheen.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.roundRect(lx - S*0.075, ly - S*0.44, S*0.145, S*0.3, [6,6,3,3]);
        ctx.fillStyle = sheen; ctx.fill();
        // Neural circuit on thigh
        if (circA > 0.25) {
          const lp = Math.min(1, (circA - 0.25) / 0.4);
          ctx.save();
          ctx.strokeStyle = `rgba(${eyeCol},${lp * 0.8})`; ctx.lineWidth = 1.2;
          ctx.shadowColor = `rgba(${eyeCol},1)`; ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(lx, ly - S*0.44); ctx.lineTo(lx, ly - S*0.28);
          ctx.lineTo(lx + fl*S*0.04, ly - S*0.22); ctx.lineTo(lx + fl*S*0.04, ly - S*0.16);
          ctx.stroke(); ctx.shadowBlur = 0; ctx.restore();
          // Circuit nodes
          [[lx, ly-S*0.36],[lx+fl*S*0.04, ly-S*0.22]].forEach(([nx,ny])=>{
            ctx.beginPath(); ctx.arc(nx,ny,2.5,0,Math.PI*2);
            ctx.fillStyle=`rgba(${eyeCol},${lp*0.9})`; ctx.fill();
          });
        }
        // Knee joint – spherical
        const kc = ctx.createRadialGradient(lx, ly-S*0.14, 0, lx, ly-S*0.14, S*0.06);
        kc.addColorStop(0, "#2a4060"); kc.addColorStop(0.5, "#0d1e30"); kc.addColorStop(1, "#050d18");
        ctx.beginPath(); ctx.arc(lx, ly - S*0.14, S*0.052, 0, Math.PI*2);
        ctx.fillStyle = kc; ctx.fill();
        ctx.strokeStyle = `rgba(${eyeCol},0.6)`; ctx.lineWidth = 1.1; ctx.stroke();
        if (prog > 0.35) {
          const kg = ctx.createRadialGradient(lx, ly-S*0.14, 0, lx, ly-S*0.14, S*0.07);
          kg.addColorStop(0, `rgba(${eyeCol},${0.55*ep})`); kg.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(lx, ly-S*0.14, S*0.07, 0, Math.PI*2); ctx.fillStyle=kg; ctx.fill();
        }
        // Shin – carbon-fiber texture suggestion
        const shG2 = ctx.createLinearGradient(lx-S*0.07, ly-S*0.13, lx+S*0.07, ly+S*0.12);
        shG2.addColorStop(0, "#16263a"); shG2.addColorStop(0.5, "#0c1824"); shG2.addColorStop(1, "#080f1a");
        ctx.beginPath(); ctx.roundRect(lx - S*0.07, ly-S*0.13, S*0.13, S*0.27, [3,3,4,4]);
        ctx.fillStyle = shG2; ctx.fill();
        ctx.strokeStyle = `rgba(${eyeCol},0.2)`; ctx.lineWidth = 0.8; ctx.stroke();
        // Shin panel line
        ctx.strokeStyle=`rgba(${eyeCol},0.1)`; ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.moveTo(lx-S*0.065,ly); ctx.lineTo(lx+S*0.055,ly); ctx.stroke();
        // Foot – wide angular
        const ftG = ctx.createLinearGradient(lx-S*0.1, ly+S*0.13, lx+S*0.1, ly+S*0.2);
        ftG.addColorStop(0, "#18283e"); ftG.addColorStop(1, "#080f1c");
        ctx.beginPath(); ctx.roundRect(lx - S*0.1, ly+S*0.12, S*0.2, S*0.08, [2,2,4,4]);
        ctx.fillStyle = ftG; ctx.fill();
        ctx.strokeStyle=`rgba(${eyeCol},0.4)`; ctx.lineWidth=1; ctx.stroke();
        // Foot glow strip
        if(prog>0.3){
          ctx.fillStyle=`rgba(${eyeCol},${0.3*ep})`; ctx.fillRect(lx-S*0.09,ly+S*0.195,S*0.18,1.5);
          ctx.shadowColor=`rgba(${eyeCol},1)`; ctx.shadowBlur=6;
          ctx.fillRect(lx-S*0.09,ly+S*0.195,S*0.18,1.5); ctx.shadowBlur=0;
        }
      });

      // ── TORSO – titanium carbon body ──
      const torsoY = by - S*0.46, torsoH = S*0.4, torsoW = S*0.4;
      // Main body gradient – metallic titanium
      const tG = ctx.createLinearGradient(-torsoW*0.55, torsoY, torsoW*0.55, torsoY+torsoH);
      tG.addColorStop(0, "#1e3350"); tG.addColorStop(0.18, "#152840"); tG.addColorStop(0.5, "#0c1e32"); tG.addColorStop(0.82, "#091628"); tG.addColorStop(1, "#050e1c");
      ctx.beginPath(); ctx.roundRect(-torsoW*0.5, torsoY, torsoW, torsoH, [8,8,5,5]);
      ctx.fillStyle = tG; ctx.fill();
      // Metallic rim light (right edge sheen)
      const rimG = ctx.createLinearGradient(torsoW*0.35, torsoY, torsoW*0.5, torsoY+torsoH*0.5);
      rimG.addColorStop(0, "rgba(160,210,255,0.14)"); rimG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.roundRect(-torsoW*0.5, torsoY, torsoW, torsoH, [8,8,5,5]);
      ctx.fillStyle = rimG; ctx.fill();
      ctx.strokeStyle = `rgba(${eyeCol},0.35)`; ctx.lineWidth = 1.3; ctx.stroke();

      // Torso panel segments (horizontal dividers)
      ctx.strokeStyle=`rgba(${eyeCol},0.1)`; ctx.lineWidth=0.7;
      [0.3, 0.58, 0.78].forEach(t3 => {
        const py3 = torsoY + t3 * torsoH;
        ctx.beginPath(); ctx.moveTo(-torsoW*0.44, py3); ctx.lineTo(torsoW*0.44, py3); ctx.stroke();
      });
      // Vertical center seam
      ctx.beginPath(); ctx.moveTo(0, torsoY+torsoH*0.05); ctx.lineTo(0, torsoY+torsoH*0.92);
      ctx.strokeStyle=`rgba(${eyeCol},0.07)`; ctx.stroke();

      // ── POWER CORE – arc reactor style ──
      const coreY = torsoY + torsoH * 0.38;
      if (prog > 0.25) {
        const cA = Math.min(1, (prog-0.25)/0.25);
        // Outer glow halo
        const cHalo = ctx.createRadialGradient(0,coreY,0,0,coreY,S*0.18);
        cHalo.addColorStop(0,`rgba(${eyeCol},${cA*0.55*(0.7+0.3*ep)})`);
        cHalo.addColorStop(0.5,`rgba(${eyeCol},${cA*0.15})`);
        cHalo.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(0,coreY,S*0.18,0,Math.PI*2); ctx.fillStyle=cHalo; ctx.fill();
        // Outer ring
        ctx.beginPath(); ctx.arc(0,coreY,S*0.085,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${eyeCol},${cA*0.9})`; ctx.lineWidth=1.5;
        ctx.shadowColor=`rgba(${eyeCol},1)`; ctx.shadowBlur=16*cA; ctx.stroke(); ctx.shadowBlur=0;
        // Hex segments
        ctx.save(); ctx.translate(0,coreY);
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3-Math.PI/6+circuitPhase*0.3, ea=a+Math.PI/3-0.12;
          ctx.beginPath(); ctx.arc(0,0,S*0.065,a,ea);
          ctx.strokeStyle=`rgba(${eyeCol},${cA*(0.6+0.4*Math.sin(circuitPhase+i))})`; ctx.lineWidth=2.2;
          ctx.shadowColor=`rgba(${eyeCol},1)`; ctx.shadowBlur=10; ctx.stroke();
        }
        ctx.shadowBlur=0; ctx.restore();
        // Inner glowing core
        const cInner=ctx.createRadialGradient(0,coreY,0,0,coreY,S*0.038);
        cInner.addColorStop(0,"rgba(255,255,255,1)"); cInner.addColorStop(0.4,`rgba(${eyeCol},0.9)`); cInner.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(0,coreY,S*0.038,0,Math.PI*2); ctx.fillStyle=cInner; ctx.fill();
      }

      // ── NEURAL CIRCUIT TRACES ──
      if(circA > 0.18){
        const ctp = Math.min(1,(circA-0.18)/0.5);
        ctx.save();
        ctx.lineWidth=1; ctx.shadowColor=`rgba(${eyeCol},1)`; ctx.shadowBlur=7;
        // Left tree
        const lPath=[[-torsoW*0.35,torsoY+torsoH*0.12],[-torsoW*0.35,torsoY+torsoH*0.5],
                     [-torsoW*0.18,torsoY+torsoH*0.5],[-torsoW*0.18,torsoY+torsoH*0.65],
                     [-torsoW*0.28,torsoY+torsoH*0.72]];
        ctx.strokeStyle=`rgba(${eyeCol},${ctp*0.7})`; ctx.beginPath();
        lPath.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)); ctx.stroke();
        // Right tree
        const rPath=[[torsoW*0.35,torsoY+torsoH*0.15],[torsoW*0.35,torsoY+torsoH*0.55],
                     [torsoW*0.18,torsoY+torsoH*0.55],[torsoW*0.18,torsoY+torsoH*0.7],
                     [torsoW*0.28,torsoY+torsoH*0.76]];
        ctx.beginPath(); rPath.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)); ctx.stroke();
        ctx.shadowBlur=0;
        // Nodes
        [...lPath,...rPath].forEach(([nx,ny])=>{
          ctx.beginPath(); ctx.arc(nx,ny,2,0,Math.PI*2);
          ctx.fillStyle=`rgba(${eyeCol},${ctp*0.85})`; ctx.fill();
          if(Math.random()<0.008) spawnSpark(cx2+nx,baseY+ny,eyeCol);
        });
        ctx.restore();
      }

      // ── ARMS – segmented titanium ──
      [[-1],[1]].forEach(([fl]) => {
        const ax = fl*(torsoW*0.5+S*0.045);
        const shY = torsoY + S*0.06;
        // Shoulder sphere
        const sphG=ctx.createRadialGradient(ax-fl*S*0.02,shY-S*0.015,0,ax,shY,S*0.075);
        sphG.addColorStop(0,"#2a4060"); sphG.addColorStop(0.6,"#0d1e30"); sphG.addColorStop(1,"#050c18");
        ctx.beginPath(); ctx.arc(ax,shY,S*0.072,0,Math.PI*2);
        ctx.fillStyle=sphG; ctx.fill(); ctx.strokeStyle=`rgba(${eyeCol},0.5)`; ctx.lineWidth=1.1; ctx.stroke();
        // Upper arm
        const armAng=fl*(0.1+0.03*Math.sin(robotPulse*0.6));
        ctx.save(); ctx.translate(ax,shY); ctx.rotate(armAng);
        const uaG=ctx.createLinearGradient(-S*0.06,0,S*0.06,S*0.28);
        uaG.addColorStop(0,fl>0?"#1e3454":"#162844"); uaG.addColorStop(1,"#090f1e");
        ctx.beginPath(); ctx.roundRect(-S*0.058,0,S*0.108,S*0.28,[5,5,3,3]);
        ctx.fillStyle=uaG; ctx.fill(); ctx.strokeStyle=`rgba(${eyeCol},0.22)`; ctx.lineWidth=0.9; ctx.stroke();
        // Arm sheen
        ctx.fillStyle=`rgba(180,220,255,${fl>0?0.07:0.03})`; ctx.beginPath();
        ctx.roundRect(-S*0.058,0,S*0.108,S*0.28,[5,5,3,3]); ctx.fill();
        // Elbow
        const elbG=ctx.createRadialGradient(0,S*0.28,0,0,S*0.28,S*0.048);
        elbG.addColorStop(0,"#253850"); elbG.addColorStop(1,"#050c18");
        ctx.beginPath(); ctx.arc(0,S*0.28,S*0.045,0,Math.PI*2);
        ctx.fillStyle=elbG; ctx.fill(); ctx.strokeStyle=`rgba(${eyeCol},0.55)`; ctx.lineWidth=1; ctx.stroke();
        // Forearm
        ctx.beginPath(); ctx.roundRect(-S*0.05,S*0.28,S*0.095,S*0.24,[3,3,4,4]);
        ctx.fillStyle="#111e30"; ctx.fill(); ctx.strokeStyle=`rgba(${eyeCol},0.2)`; ctx.lineWidth=0.8; ctx.stroke();
        // Hand – clawed
        ctx.beginPath(); ctx.roundRect(-S*0.062,S*0.51,S*0.12,S*0.095,[4,4,6,6]);
        ctx.fillStyle="#0c1828"; ctx.fill(); ctx.strokeStyle=`rgba(${eyeCol},0.45)`; ctx.lineWidth=1; ctx.stroke();
        // Finger tips glow
        if(prog>0.55){
          const fp=Math.min(1,(prog-0.55)/0.3);
          for(let fi=0;fi<3;fi++){
            const fx2=-S*0.045+fi*S*0.042;
            ctx.beginPath(); ctx.roundRect(fx2,S*0.595,S*0.028,S*0.035,[0,0,3,3]);
            ctx.fillStyle=`rgba(${eyeCol},${fp*(0.5+0.3*Math.sin(eyeFlicker*2+fi))})`; ctx.fill();
            ctx.shadowColor=`rgba(${eyeCol},1)`; ctx.shadowBlur=8*fp; ctx.fill(); ctx.shadowBlur=0;
          }
        }
        // Arm neural circuit
        if(circA>0.45){
          const ap=Math.min(1,(circA-0.45)/0.4);
          ctx.strokeStyle=`rgba(${eyeCol},${ap*0.65})`; ctx.lineWidth=0.9;
          ctx.shadowColor=`rgba(${eyeCol},1)`; ctx.shadowBlur=6;
          ctx.beginPath(); ctx.moveTo(fl*S*0.018,S*0.04); ctx.lineTo(fl*S*0.018,S*0.5); ctx.stroke();
          ctx.shadowBlur=0;
        }
        ctx.restore();
      });

      // ── NECK – titanium segments ──
      const neckY = torsoY - S*0.07;
      // Neck segments
      for(let ni=0;ni<3;ni++){
        const nw=S*(0.13-ni*0.015), nh=S*0.035, ny2=neckY+ni*S*0.038;
        ctx.beginPath(); ctx.roundRect(-nw*0.5,ny2,nw,nh,2);
        ctx.fillStyle=`rgba(${12+ni*4},${24+ni*4},${40+ni*4},1)`; ctx.fill();
        ctx.strokeStyle=`rgba(${eyeCol},${0.25+ni*0.05})`; ctx.lineWidth=0.8; ctx.stroke();
      }
      if(circA>0.55){
        const np=Math.min(1,(circA-0.55)/0.3);
        ctx.shadowColor=`rgba(${eyeCol},1)`; ctx.shadowBlur=7;
        ctx.strokeStyle=`rgba(${eyeCol},${np*0.8})`; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(0,neckY); ctx.lineTo(0,neckY+S*0.1); ctx.stroke();
        ctx.shadowBlur=0;
      }

      // ── HEAD – angular cyberpunk skull ──
      const headY=torsoY-S*0.3, headW=S*0.34, headH=S*0.26;
      // Head base – titanium-carbon
      const hG=ctx.createLinearGradient(-headW*0.5,headY,headW*0.5,headY+headH);
      hG.addColorStop(0,"#1e3254"); hG.addColorStop(0.3,"#152642"); hG.addColorStop(0.65,"#0c1b32"); hG.addColorStop(1,"#06101e");
      ctx.beginPath(); ctx.roundRect(-headW*0.5,headY,headW,headH,[14,14,8,8]);
      ctx.fillStyle=hG; ctx.fill();
      // Metallic rim highlight
      const hRim=ctx.createLinearGradient(-headW*0.5,headY,headW*0.5,headY);
      hRim.addColorStop(0,"rgba(100,180,255,0.04)"); hRim.addColorStop(0.4,"rgba(180,220,255,0.14)"); hRim.addColorStop(1,"rgba(80,160,255,0.04)");
      ctx.beginPath(); ctx.roundRect(-headW*0.5,headY,headW,headH*0.5,[14,14,0,0]); ctx.fillStyle=hRim; ctx.fill();
      ctx.strokeStyle=`rgba(${eyeCol},0.45)`; ctx.lineWidth=1.4; ctx.stroke();
      // Head center seam
      ctx.strokeStyle=`rgba(${eyeCol},0.08)`; ctx.lineWidth=0.6;
      ctx.beginPath(); ctx.moveTo(0,headY+headH*0.12); ctx.lineTo(0,headY+headH*0.92); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-headW*0.5,headY+headH*0.55); ctx.lineTo(headW*0.5,headY+headH*0.55); ctx.stroke();

      // Head side panels (cheek plates)
      [[-1],[1]].forEach(([fl]) => {
        const cpx=fl*(headW*0.28), cpy=headY+headH*0.15;
        ctx.beginPath(); ctx.roundRect(cpx-S*0.025,cpy,S*0.05,headH*0.35,2);
        ctx.strokeStyle=`rgba(${eyeCol},0.2)`; ctx.lineWidth=0.7; ctx.stroke();
      });

      // ── ANTENNA ──
      const antX=0, antBY=headY-S*0.01, antTY=headY-S*0.1;
      ctx.beginPath(); ctx.moveTo(antX,antBY); ctx.lineTo(antX,antTY);
      ctx.strokeStyle=`rgba(${eyeCol},0.5)`; ctx.lineWidth=1.2; ctx.stroke();
      if(prog>0.45){
        const antA=Math.min(1,(prog-0.45)/0.3);
        // Side fins
        [[-1],[1]].forEach(([fl])=>{
          ctx.beginPath(); ctx.moveTo(antX,antBY-S*0.03);
          ctx.lineTo(antX+fl*S*0.06,headY+S*0.005);
          ctx.strokeStyle=`rgba(${eyeCol},${antA*0.4})`; ctx.lineWidth=0.8; ctx.stroke();
        });
        ctx.beginPath(); ctx.arc(antX,antTY,S*0.015,0,Math.PI*2);
        ctx.fillStyle=`rgba(${eyeCol},${antA*(0.8+0.2*Math.sin(eyeFlicker*2))})`; ctx.fill();
        ctx.shadowColor=`rgba(${eyeCol},1)`; ctx.shadowBlur=12*antA; ctx.fill(); ctx.shadowBlur=0;
      }

      // ── EYES – neon blue awakening ──
      const eyeY=headY+headH*0.38;
      [[-1],[1]].forEach(([fl]) => {
        const ex2=fl*headW*0.26;
        // Eye recess
        ctx.beginPath(); ctx.roundRect(ex2-S*0.065,eyeY-S*0.035,S*0.12,S*0.065,5);
        ctx.fillStyle="#020810"; ctx.fill();
        ctx.strokeStyle=`rgba(${eyeCol},0.35)`; ctx.lineWidth=0.9; ctx.stroke();
        if(eyeA>0){
          // Full iris glow fill
          const eyeG2=ctx.createRadialGradient(ex2,eyeY,0,ex2,eyeY,S*0.06);
          eyeG2.addColorStop(0,"rgba(255,255,255,1)");
          eyeG2.addColorStop(0.2,`rgba(${eyeCol},${eyeA})`);
          eyeG2.addColorStop(0.65,`rgba(${eyeCol},${eyeA*0.5})`);
          eyeG2.addColorStop(1,"transparent");
          ctx.save(); ctx.beginPath(); ctx.roundRect(ex2-S*0.06,eyeY-S*0.03,S*0.11,S*0.06,4); ctx.clip();
          ctx.beginPath(); ctx.arc(ex2,eyeY,S*0.06,0,Math.PI*2); ctx.fillStyle=eyeG2; ctx.fill();
          ctx.restore();
          // Neon outer glow – cinematic bloom
          for(let g=0;g<3;g++){
            ctx.shadowColor=`rgba(${eyeCol},1)`; ctx.shadowBlur=(12+g*10)*eyeA;
            ctx.beginPath(); ctx.arc(ex2,eyeY,S*(0.022-g*0.004),0,Math.PI*2);
            ctx.fillStyle=`rgba(${eyeCol},${eyeA*(0.9-g*0.2)})`; ctx.fill();
          }
          ctx.shadowBlur=0;
          // Pupil scan line
          if(Math.sin(eyeFlicker*3+fl)>0.2){
            ctx.save(); ctx.beginPath(); ctx.roundRect(ex2-S*0.06,eyeY-S*0.03,S*0.11,S*0.06,4); ctx.clip();
            const sX=ex2-S*0.05+(((Date.now()*0.0025)%1)*S*0.1);
            ctx.fillStyle="rgba(255,255,255,0.4)"; ctx.fillRect(sX-1.5,eyeY-S*0.03,3,S*0.06);
            ctx.restore();
          }
        }
      });

      // ── HEAD NEURAL CIRCUITS ──
      if(circA>0.65){
        const hcp=Math.min(1,(circA-0.65)/0.28);
        ctx.save(); ctx.shadowColor=`rgba(${eyeCol},0.9)`; ctx.shadowBlur=5;
        ctx.strokeStyle=`rgba(${eyeCol},${hcp*0.6})`; ctx.lineWidth=0.8;
        [[-headW*0.42,headY+headH*0.18,-headW*0.16,headY+headH*0.18],
         [-headW*0.42,headY+headH*0.75,-headW*0.18,headY+headH*0.75],
         [ headW*0.42,headY+headH*0.18, headW*0.16,headY+headH*0.18],
         [ headW*0.42,headY+headH*0.75, headW*0.18,headY+headH*0.75]].forEach(([x1,y1,x2,y2])=>{
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        });
        ctx.shadowBlur=0; ctx.restore();
      }

      // ── HOLOGRAPHIC HUD VISOR ──
      if(prog>0.42){
        const hp=Math.min(1,(prog-0.42)/0.38);
        ctx.save();
        ctx.beginPath(); ctx.roundRect(-headW*0.5,headY,headW,headH,[14,14,8,8]); ctx.clip();
        // Visor tinted glass overlay
        ctx.fillStyle=`rgba(0,60,120,${hp*0.08})`;
        ctx.fillRect(-headW*0.5,headY,headW,headH);
        // Scan sweep line
        const vscan=((Date.now()*0.0007)%1)*headH;
        const vsg=ctx.createLinearGradient(0,headY+vscan-10,0,headY+vscan+10);
        vsg.addColorStop(0,"transparent"); vsg.addColorStop(0.5,`rgba(${eyeCol},${hp*0.15})`); vsg.addColorStop(1,"transparent");
        ctx.fillStyle=vsg; ctx.fillRect(-headW*0.5,headY+vscan-10,headW,20);
        ctx.restore();
        // Targeting reticle above head
        const retY2=headY+headH*0.38;
        ctx.save(); ctx.translate(0,retY2);
        ctx.strokeStyle=`rgba(${eyeCol},${hp*0.35})`; ctx.lineWidth=0.7;
        ctx.beginPath(); ctx.arc(0,0,headW*0.52,0,Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0,0,headW*0.3,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${eyeCol},${hp*0.18})`; ctx.stroke();
        // Corner brackets
        [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([bx,by2])=>{
          const r=headW*0.52, bl=r*0.22;
          const ang=Math.atan2(by2,bx);
          ctx.strokeStyle=`rgba(${eyeCol},${hp*0.7})`; ctx.lineWidth=1.2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang)*r, Math.sin(ang)*r);
          ctx.lineTo(Math.cos(ang-bx*0.35)*(r-bl), Math.sin(ang)*(r));
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang)*r, Math.sin(ang)*r);
          ctx.lineTo(Math.cos(ang)*(r), Math.sin(ang-by2*0.35)*(r-bl));
          ctx.stroke();
        });
        ctx.restore();
      }

      // ── FULL BODY CINEMATIC GLOW ──
      if(prog>0.18){
        const ga=Math.min(1,(prog-0.18)/0.45)*0.14*(0.65+0.35*ep);
        const bodyG2=ctx.createRadialGradient(0,torsoY+torsoH*0.5,0,0,torsoY+torsoH*0.5,S*0.9);
        bodyG2.addColorStop(0,`rgba(${eyeCol},${ga})`);
        bodyG2.addColorStop(0.5,`rgba(0,80,160,${ga*0.4})`);
        bodyG2.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(0,torsoY+torsoH*0.5,S*0.9,0,Math.PI*2); ctx.fillStyle=bodyG2; ctx.fill();
      }

      ctx.restore();
    }

    // ── Draw floating HUD data panels ─────────────────────────────────────────
    function drawDataPanels(prog, dt) {
      if(prog<0.3) return;
      const pa=Math.min(1,(prog-0.3)/0.4);
      DATA_PANELS.forEach((p,i)=>{
        p.phase+=dt*0.6;
        const px=(p.x+Math.sin(p.phase*0.4)*0.012)*W;
        const py=(p.y+Math.cos(p.phase*0.3)*0.008)*H;
        const alpha=pa*(0.7+0.3*Math.sin(p.phase+i));
        ctx.save();
        // Panel background
        ctx.globalAlpha=alpha*0.9;
        ctx.fillStyle=`rgba(0,8,20,0.85)`;
        ctx.strokeStyle=`rgba(${p.col},0.6)`;
        ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(px,py,p.w,p.h,4); ctx.fill(); ctx.stroke();
        // Top label bar
        ctx.fillStyle=`rgba(${p.col},0.15)`; ctx.beginPath(); ctx.roundRect(px,py,p.w,16,[4,4,0,0]); ctx.fill();
        ctx.globalAlpha=alpha;
        ctx.font=`700 9px 'Share Tech Mono',monospace`;
        ctx.fillStyle=`rgba(${p.col},0.9)`; ctx.textAlign="left";
        ctx.fillText("▸ "+p.label, px+7, py+11);
        // Data lines
        p.lines.forEach((ln,li)=>{
          const lineA=Math.min(1,alpha*(1+li*0.1));
          ctx.globalAlpha=lineA*0.85;
          ctx.font=`500 8px 'Share Tech Mono',monospace`;
          ctx.fillStyle=`rgba(${p.col},0.7)`;
          ctx.fillText(ln, px+8, py+30+li*15);
          // Value bar
          const barW=(p.w-16)*0.6*((0.4+li*0.2)%1+0.3);
          ctx.fillStyle=`rgba(${p.col},0.15)`;
          ctx.fillRect(px+8,py+32+li*15,p.w-16,3);
          ctx.fillStyle=`rgba(${p.col},0.5)`;
          ctx.fillRect(px+8,py+32+li*15,barW,3);
        });
        // Connecting line to robot center
        ctx.globalAlpha=alpha*0.15;
        ctx.strokeStyle=`rgba(${p.col},1)`; ctx.lineWidth=0.6;
        ctx.setLineDash([3,5]);
        ctx.beginPath(); ctx.moveTo(px+p.w*0.5,py+p.h*0.5); ctx.lineTo(W*0.5,H*0.55); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
      });
    }

    // ── Circuit spark update ──────────────────────────────────────────────────
    function updateSparks(dt) {
      for(let i=circuitSparks.length-1;i>=0;i--){
        const s=circuitSparks[i];
        s.x+=s.vx*dt*60; s.y+=s.vy*dt*60; s.vy+=0.05*dt*60;
        s.life-=dt*2.5;
        if(s.life<=0){circuitSparks.splice(i,1);continue;}
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2);
        ctx.fillStyle=`rgba(${s.col},${s.life*0.8})`; ctx.fill();
      }
    }

    // ── Portal end sequence ────────────────────────────────────────────────────
    let endPhase = 0;
    function drawPortalEnd(dt) {
      endPhase = Math.min(1, endPhase + dt * 0.003);
      warpCtx.clearRect(0,0,W,H);
      const cx2=W*0.5, cy2=H*0.5, mR=Math.max(W,H)*0.95;
      for (let i=0;i<12;i++) {
        const r = mR*((endPhase + i*0.085)%1);
        const a = (1-(endPhase + i*0.085)%1)*0.75;
        warpCtx.beginPath(); warpCtx.arc(cx2,cy2,r,0,Math.PI*2);
        warpCtx.strokeStyle = i%2===0?`rgba(0,245,255,${a})`:`rgba(168,85,247,${a*0.7})`;
        warpCtx.lineWidth = 2.5 - r/mR*2.2; warpCtx.stroke();
      }
      if (endPhase > 0.55) {
        const tp = (endPhase-0.55)/0.45;
        warpCtx.save(); warpCtx.globalAlpha = tp;
        warpCtx.font = `900 ${Math.min(W*0.11,76)}px Orbitron,monospace`;
        warpCtx.textAlign="center"; warpCtx.textBaseline="middle";
        warpCtx.fillStyle=`rgba(255,255,255,${tp})`;
        warpCtx.shadowColor="rgba(0,245,255,1)"; warpCtx.shadowBlur=50*tp;
        warpCtx.fillText("UNIT ONLINE",cx2,cy2-48*tp);
        warpCtx.fillText("IMPERIUM",cx2,cy2+12*tp);
        warpCtx.restore();
      }
      return endPhase >= 1;
    }

    // ── Main loop ─────────────────────────────────────────────────────────────
    let lastT=0, rafId;
    function frame(ts) {
      const dt = Math.min(ts - lastT, 50); lastT = ts;
      if (!done) progress = Math.min(1, progress + (held ? HELD_SPD : BASE_SPD)*dt);
      const pct = Math.round(progress*100);
      if (barFill) barFill.style.width = pct+"%";
      if (barPct)  barPct.textContent  = pct;
      updateStatus();

      const dtS = dt / 1000;
      ctx.clearRect(0,0,W,H);

      // Dark cyberpunk lab background
      const bg = ctx.createRadialGradient(W*0.5,H*0.4,0,W*0.5,H*0.5,Math.max(W,H)*0.9);
      bg.addColorStop(0,"#04101e"); bg.addColorStop(0.4,"#020b14"); bg.addColorStop(0.75,"#01060e"); bg.addColorStop(1,"#000306");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      // Subtle wall panels (background architecture)
      ctx.strokeStyle="rgba(0,245,255,0.04)"; ctx.lineWidth=0.8;
      for(let px=0;px<W;px+=W/8){ ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,H); ctx.stroke(); }
      for(let py=0;py<H;py+=H/10){ ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(W,py); ctx.stroke(); }

      drawVolumetricLight(progress);
      drawLabFloor();
      drawDataPanels(progress, dtS);
      updateSparks(dtS);
      drawRobot(progress, held);

      if (progress >= 1 && !done) { done=true; startEnd(); return; }
      rafId = requestAnimationFrame(frame);
    }

    function startEnd() {
      let prev=0;
      function ef(ts) {
        const dt=Math.min(ts-prev,50)/1000; prev=ts;
        ctx.clearRect(0,0,W,H);
        const bg=ctx.createRadialGradient(W*0.5,H*0.4,0,W*0.5,H*0.5,Math.max(W,H)*0.8);
        bg.addColorStop(0,"#04101e"); bg.addColorStop(1,"#000306");
        ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
        drawVolumetricLight(1);
        drawLabFloor();
        drawDataPanels(1, dt);
        drawRobot(1.0, false);
        const fin = drawPortalEnd(dt*1000);
        if (fin) {
          const el=document.getElementById("imp-loader");
          if (el) el.classList.add("fade-out");
          setTimeout(()=>onDone(), 1800);
        } else requestAnimationFrame(ef);
      }
      requestAnimationFrame(ef);
    }

    function setHeld(v) {
      held = v;
      if (btn) v ? btn.classList.add("held") : btn.classList.remove("held");
    }
    const md=()=>setHeld(true), mu=()=>setHeld(false);
    const ts2=(e)=>{e.preventDefault();setHeld(true);};
    if (btn) { btn.addEventListener("mousedown",md); btn.addEventListener("touchstart",ts2,{passive:false}); }
    window.addEventListener("mouseup",mu); window.addEventListener("touchend",mu);
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mouseup", mu);
      window.removeEventListener("touchend", mu);
    };
  }, [onDone]);

  return (
    <div id="imp-loader">
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />
      <div id="imp-loader-title">IMPERIUM</div>
      <div id="imp-loader-sub">INITIALIZING NEURAL UPLINK · 2080</div>
      <div id="imp-loader-status" ref={statusRef}>▸ SCANNING SECTOR ALPHA...</div>
      <canvas ref={warpRef} id="imp-warp-overlay" />
      <button id="imp-hold-btn" ref={btnRef}>
        <span className="imp-btn-ring"></span>
        HOLD TO ACCELERATE
      </button>
      <div id="imp-hold-hint">PRESS &amp; HOLD · PLASMA BOOST ENGAGED</div>
      <div id="imp-loader-bar-wrap">
        <div id="imp-loader-bar-label">APPROACH VECTOR: <span ref={barPctRef}>0</span>%</div>
        <div id="imp-loader-bar-track">
          <div id="imp-loader-bar-fill" ref={barFillRef} style={{width:"0%"}}></div>
          <div id="imp-loader-bar-seg"></div>
        </div>
      </div>
    </div>
  );
}

// ─── CINEMATIC SPACE BACKGROUND ───────────────────────────────────────────────
function CinematicSpace() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let W, H, rafId;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);

    // Mouse / scroll state
    let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
    let scrollY = 0, tScrollY = 0, scrollVel = 0;
    const onMouse = (e: MouseEvent) => { tmx = e.clientX / window.innerWidth; tmy = e.clientY / window.innerHeight; };
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

    function detectMode(el: Element | null): string {
      if (!el) return "default";
      const tag = el.tagName?.toLowerCase()||"";
      let node: Element | null = el;
      for (let i=0;i<4&&node;i++,node=node.parentElement) {
        const t=node.tagName?.toLowerCase()||"", c=node.className||"";
        if (t==="button"||(typeof c==="string"&&/btn|button/i.test(c))) return "button";
        if (t==="a") return "link";
        if (typeof c==="string"&&/card/i.test(c)) return "card";
      }
      if (["p","span","h1","h2","h3","h4","h5","h6","li","label"].includes(tag)) return "text";
      return "default";
    }

    function updateMagnet(mx: number, my: number) {
      const els = document.querySelectorAll("button,a,[class*='btn'],[class*='card']");
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
  const ref = useRef<HTMLCanvasElement | null>(null);
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
  return <canvas ref={ref} style={{position:"absolute",inset:0,zIndex:3,pointerEvents:"none"}} />;
}

// ─── PAGE WRAPPER ─────────────────────────────────────────────────────────────
function Page({
  id,
  active,
  className = "",
  children,
  style = {},
}: {
  id: string;
  active: boolean;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
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
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)){setLoginAlert("⚠ INVALID EMAIL FORMAT.");return;}
    if(loginPwd.length<6){setLoginAlert("⚠ PASSWORD TOO SHORT.");return;}
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
        <NetworkCanvas />
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
      <Page id="plog" active={page==="plog"} style={{alignItems:"center",justifyContent:"center",padding:"100px 24px 40px"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24,width:"100%",maxWidth:440}}>
          <svg viewBox="0 0 32 32" fill="none" style={{filter:"drop-shadow(0 0 12px var(--c))",width:48,height:48}}>
            <path d="M16 4L20 14L28 8L24 20H8L4 8L12 14L16 4Z" stroke="#00f5ff" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <rect x="8" y="22" width="16" height="4" rx="1" fill="rgba(0,245,255,.28)" stroke="#00f5ff" strokeWidth="1"/>
          </svg>
          <div className="imp-aclogo">IMPERIUM</div>
          <div className="imp-acsub" style={{marginTop:-16}}>AN IMMERSIVE AI CHALLENGE</div>
          <div className="imp-apanel" style={{width:"100%",position:"relative"}}>
            <div className="imp-pc imp-pc-tl"></div><div className="imp-pc imp-pc-bl"></div>
            <div className="imp-pc imp-pc-tr"></div><div className="imp-pc imp-pc-br"></div>
            <div className="imp-apt" style={{color:"var(--c)"}}>LOGIN</div>
            <div className="imp-aps">WELCOME BACK, RECRUIT.</div>
            {loginAlert && <div className="imp-alert imp-show">{loginAlert}</div>}
            {loginSucc  && <div className="imp-succ imp-show">{loginSucc}</div>}
            <div className="imp-fg">
              <label className="imp-flabel">EMAIL ADDRESS</label>
              <div className="imp-iw">
                <span className="imp-iico">📧</span>
                <input type="email" className="imp-finput" placeholder="Enter your email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} />
              </div>
            </div>
            <div className="imp-fg">
              <label className="imp-flabel">PASSWORD</label>
              <div className="imp-iw">
                <span className="imp-iico">🔒</span>
                <input type="password" className="imp-finput" placeholder="Enter your password" value={loginPwd} onChange={e=>setLoginPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} />
              </div>
              <button className="imp-flink">FORGOT PASSWORD?</button>
            </div>
            <button className="imp-btnauth imp-btnc" onClick={doLogin} style={{opacity:loginLoading?.6:1}}>
              {loginLoading ? "AUTHENTICATING..." : "LOGIN"}
            </button>
            <div style={{textAlign:"center",marginTop:16}}><button className="imp-backlink" onClick={()=>go("pl")}>← BACK TO BASE</button></div>
          </div>
        </div>
      </Page>


    </div>
  );
}
