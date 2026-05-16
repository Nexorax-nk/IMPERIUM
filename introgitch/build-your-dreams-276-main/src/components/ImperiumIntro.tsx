import { useState, useEffect, useRef } from "react";

function Cursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `*, *::before, *::after { cursor: none !important; }
@keyframes imp-rpl{from{width:0;height:0;opacity:.9;transform:translate(-50%,-50%)}to{width:130px;height:130px;opacity:0;transform:translate(-50%,-50%)}}`;
    document.head.appendChild(style);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const label = document.createElement("div");
    label.style.cssText = `position:fixed;pointer-events:none;z-index:1000000;font-family:'Share Tech Mono','Courier New',monospace;font-size:8px;color:rgba(0,245,255,.5);letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap;transition:opacity .2s;`;
    label.textContent = "SYS.TRACK";
    document.body.appendChild(label);

    const S: any = { mx:0,my:0,ox:0,oy:0,ix:0,iy:0,vx:0,vy:0,mode:"default",modeProgress:0,sparks:[],ringAngle:0,radarAngle:0,magnetX:0,magnetY:0,magnetTarget:null };

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    function detectMode(el: Element | null): string {
      if (!el) return "default";
      const tag = el.tagName?.toLowerCase() || "";
      let node: Element | null = el;
      for (let i = 0; i < 4 && node; i++, node = node.parentElement) {
        const t = node.tagName?.toLowerCase() || "", c: any = (node as HTMLElement).className || "";
        if (t === "button" || (typeof c === "string" && /btn|button/i.test(c))) return "button";
        if (t === "a") return "link";
        if (typeof c === "string" && /card/i.test(c)) return "card";
      }
      if (["p","span","h1","h2","h3","h4","h5","h6","li","label"].includes(tag)) return "text";
      return "default";
    }

    function updateMagnet(mx: number, my: number) {
      const els = document.querySelectorAll("button,a,[class*='btn'],[class*='card']");
      let best: any = null, bestDist = 90;
      els.forEach(el => {
        const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const d = Math.hypot(mx - cx, my - cy);
        if (d < bestDist) { bestDist = d; best = { cx, cy, d }; }
      });
      S.magnetTarget = best;
      if (best) {
        const pull = Math.pow(1 - best.d / 90, 2.5) * 20, ang = Math.atan2(best.cy - my, best.cx - mx);
        S.magnetX = mx + Math.cos(ang) * pull; S.magnetY = my + Math.sin(ang) * pull;
      } else { S.magnetX = mx; S.magnetY = my; }
    }

    function spawnRipple(x: number, y: number) {
      [{ color: "rgba(0,245,255,.8)", delay: "0s" }, { color: "rgba(138,46,255,.6)", delay: "0.08s" }].forEach(({ color, delay }) => {
        const el = document.createElement("div");
        el.style.cssText = `position:fixed;border-radius:50%;pointer-events:none;z-index:999998;left:${x}px;top:${y}px;border:1.5px solid ${color};animation:imp-rpl .7s cubic-bezier(.4,0,.2,1) ${delay} forwards;width:0;height:0;transform:translate(-50%,-50%);`;
        document.body.appendChild(el); setTimeout(() => el.remove(), 1200);
      });
    }

    const onMove = (e: MouseEvent) => {
      S.vx = e.clientX - S.mx; S.vy = e.clientY - S.my;
      S.mx = e.clientX; S.my = e.clientY;
      updateMagnet(e.clientX, e.clientY);
      const mode = detectMode(document.elementFromPoint(e.clientX, e.clientY));
      if (mode !== S.mode) { S.mode = mode; S.modeProgress = 0; }
      const labels: any = { default:"SYS.TRACK", button:"ACTIVATE", link:"NAVIGATE", card:"SCAN", text:"READ" };
      label.style.transform = `translate3d(${e.clientX + 18}px,${e.clientY + 14}px,0)`;
      label.textContent = labels[mode] || "SYS.TRACK";
      const spd = Math.hypot(S.vx, S.vy);
      if (spd > 8) {
        const count = Math.min(3, Math.floor(spd / 7));
        for (let i = 0; i < count; i++) {
          const ang = Math.atan2(S.vy, S.vx) + (Math.random() - .5) * 2, v = 1.5 + Math.random() * 3.5;
          S.sparks.push({ x: e.clientX, y: e.clientY, vx: -Math.cos(ang)*v*.7+(Math.random()-.5)*2, vy: -Math.sin(ang)*v*.7+(Math.random()-.5)*2, life: 1, maxLife: .25+Math.random()*.35, r: .8+Math.random()*2, col: Math.random()>.5?"0,245,255":"138,46,255" });
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      spawnRipple(e.clientX, e.clientY);
      for (let i = 0; i < 20; i++) {
        const ang = (i / 20) * Math.PI * 2 + Math.random() * .4, v = 2.5 + Math.random() * 6;
        S.sparks.push({ x: e.clientX, y: e.clientY, vx: Math.cos(ang)*v, vy: Math.sin(ang)*v, life: 1, maxLife: .4+Math.random()*.4, r: 1+Math.random()*2.5, col: ["0,245,255","138,46,255","255,44,251"][i%3] });
      }
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("click", onClick);

    let rafId: number;
    function frame(ts: number) {
      const t = ts / 1000;
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      S.ix += (S.magnetX - S.ix) * .28; S.iy += (S.magnetY - S.iy) * .28;
      S.ox += (S.magnetX - S.ox) * .13; S.oy += (S.magnetY - S.oy) * .13;
      const spd = Math.hypot(S.vx, S.vy);
      S.modeProgress = Math.min(1, S.modeProgress + .07);

      const outerR = ({ default:26, button:38, link:20, card:44, text:18 } as any)[S.mode] ?? 26;
      const coreR  = ({ default:5,  button:7,  link:3,  card:8,  text:2.5 } as any)[S.mode] ?? 5;
      const accentCol = S.mode === "card" ? "138,46,255" : "0,245,255";

      S.ringAngle  += .016 * (2.2 + spd*.04 + (S.mode==="button" ? 1.5 : 0));
      S.radarAngle += .016 * 1.6;

      if (spd > 5) {
        const steps = Math.min(6, Math.floor(spd * .5));
        for (let i = steps; i >= 1; i--) {
          const tr = i/steps, tx = S.ox+(S.mx-S.ox)*(1-tr*.8), ty = S.oy+(S.my-S.oy)*(1-tr*.8);
          ctx.beginPath(); ctx.arc(tx, ty, coreR*(.4+tr*.5), 0, Math.PI*2);
          ctx.fillStyle = `rgba(0,245,255,${.05*tr})`; ctx.fill();
        }
      }

      const glowR = outerR + 28 + Math.sin(t*2.2)*5;
      let gG = ctx.createRadialGradient(S.ox,S.oy,0,S.ox,S.oy,glowR);
      gG.addColorStop(0, `rgba(0,245,255,${.065+(spd>3?.03:0)})`);
      gG.addColorStop(.4, "rgba(0,119,255,.025)"); gG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(S.ox, S.oy, glowR, 0, Math.PI*2); ctx.fillStyle = gG; ctx.fill();

      let gG2 = ctx.createRadialGradient(S.ox,S.oy,0,S.ox,S.oy,glowR*.7);
      gG2.addColorStop(0, "rgba(138,46,255,.03)"); gG2.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(S.ox, S.oy, glowR*.7, 0, Math.PI*2); ctx.fillStyle = gG2; ctx.fill();

      ctx.save(); ctx.translate(S.ox, S.oy); ctx.rotate(S.ringAngle);
      const segCount = S.mode==="card" ? 6 : 4, segGap = S.mode==="card" ? .32 : .44;
      for (let i = 0; i < segCount; i++) {
        const sa = (i/segCount)*Math.PI*2, ea = sa + (Math.PI*2/segCount)*(1-segGap);
        ctx.beginPath(); ctx.arc(0, 0, outerR, sa, ea);
        ctx.strokeStyle = `rgba(${accentCol},.85)`; ctx.lineWidth = S.mode==="button" ? 1.8 : 1.4;
        ctx.shadowColor = `rgba(${accentCol},1)`; ctx.shadowBlur = 9; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa)*(outerR-4), Math.sin(sa)*(outerR-4));
        ctx.lineTo(Math.cos(sa)*(outerR+5), Math.sin(sa)*(outerR+5));
        ctx.strokeStyle = `rgba(${accentCol},.4)`; ctx.lineWidth = 1; ctx.shadowBlur = 0; ctx.stroke();
      }
      ctx.restore();

      ctx.save(); ctx.translate(S.ox, S.oy); ctx.rotate(-S.ringAngle*.6);
      ctx.beginPath(); ctx.arc(0, 0, outerR*.68, 0, Math.PI*2);
      ctx.setLineDash([3, 8]); ctx.strokeStyle = `rgba(${accentCol},.22)`; ctx.lineWidth = .8; ctx.stroke();
      ctx.setLineDash([]); ctx.restore();

      ctx.save(); ctx.translate(S.ox, S.oy); ctx.rotate(S.radarAngle);
      const sweepR = outerR * .66;
      for (let i = 0; i < 16; i++) {
        const a = -(i/16)*Math.PI*.85;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0, 0, sweepR-2, a, a+.07); ctx.closePath();
        ctx.fillStyle = `rgba(0,245,255,${(1-i/16)*.16})`; ctx.fill();
      }
      ctx.restore();

      ctx.save(); ctx.translate(S.ox, S.oy); ctx.rotate(S.ringAngle*1.25);
      const diam = outerR + 8;
      ctx.beginPath(); ctx.moveTo(0,-diam-5); ctx.lineTo(3.5,-diam); ctx.lineTo(0,-diam+5); ctx.lineTo(-3.5,-diam); ctx.closePath();
      ctx.fillStyle = "#00f5ff"; ctx.shadowColor = "#00f5ff"; ctx.shadowBlur = 14; ctx.fill(); ctx.restore();

      ctx.save(); ctx.translate(S.ix, S.iy);
      const pulse = Math.abs(Math.sin(t*3.2));
      for (let i = 3; i >= 1; i--) {
        const pr = coreR*(1+i*.65*pulse);
        const cG2 = ctx.createRadialGradient(0,0,0,0,0,pr);
        cG2.addColorStop(0, `rgba(0,245,255,${.14/i})`); cG2.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(0, 0, pr, 0, Math.PI*2); ctx.fillStyle = cG2; ctx.fill();
      }
      const cG = ctx.createRadialGradient(-coreR*.3,-coreR*.3,0,0,0,coreR);
      cG.addColorStop(0,"#fff"); cG.addColorStop(.4,"#00f5ff"); cG.addColorStop(1,"#0077ff");
      ctx.beginPath(); ctx.arc(0, 0, coreR, 0, Math.PI*2);
      ctx.fillStyle = cG; ctx.shadowColor = "#00f5ff"; ctx.shadowBlur = 18; ctx.fill();

      if (S.mode==="button" || S.mode==="card") {
        const len = outerR - 7;
        ctx.strokeStyle = `rgba(${accentCol},${S.modeProgress*.5})`; ctx.lineWidth = .7; ctx.shadowBlur = 0;
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
          ctx.beginPath(); ctx.moveTo(dx*(coreR+3), dy*(coreR+3)); ctx.lineTo(dx*len, dy*len); ctx.stroke();
        });
      }
      if (S.mode==="text") {
        ctx.strokeStyle = "rgba(0,245,255,.9)"; ctx.lineWidth = 1.5; ctx.shadowColor = "#00f5ff"; ctx.shadowBlur = 10;
        [[0,-13,0,13],[-4,-13,4,-13],[-4,13,4,13]].forEach(([x1,y1,x2,y2]) => {
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        });
      }
      if (S.mode==="link") {
        ctx.strokeStyle = "rgba(255,44,251,.95)"; ctx.lineWidth = 2; ctx.shadowColor = "#ff2cfb"; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(8,0); ctx.lineTo(0,8); ctx.stroke();
      }
      ctx.restore();

      const dist = Math.hypot(S.ox-S.ix, S.oy-S.iy);
      if (dist > 5) {
        ctx.setLineDash([2,7]); ctx.strokeStyle = "rgba(0,245,255,.16)"; ctx.lineWidth = .7; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(S.ox, S.oy); ctx.lineTo(S.ix, S.iy); ctx.stroke(); ctx.setLineDash([]);
      }

      if (S.mode==="button" && S.magnetTarget) {
        const { cx:bcx, cy:bcy } = S.magnetTarget, phase = (t*1.8)%1;
        const ba = phase < .5 ? phase*.14 : (1-phase)*.14;
        const bG = ctx.createRadialGradient(bcx,bcy,0,bcx,bcy,58);
        bG.addColorStop(0, `rgba(0,245,255,${ba})`); bG.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(bcx, bcy, 58, 0, Math.PI*2); ctx.fillStyle = bG; ctx.fill();
      }

      for (let i = S.sparks.length-1; i >= 0; i--) {
        const sp = S.sparks[i];
        sp.x += sp.vx; sp.y += sp.vy; sp.vy += .07; sp.life -= .016/sp.maxLife;
        if (sp.life <= 0) { S.sparks.splice(i,1); continue; }
        ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r*sp.life, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${sp.col},${sp.life*.9})`; ctx.shadowColor = `rgb(${sp.col})`; ctx.shadowBlur = 6; ctx.fill();
      }

      ctx.shadowBlur = 0;
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
      label.remove();
      document.head.removeChild(style);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:999999 }} />;
}

function GlitchScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"normal"|"glitch"|"static"|"blackout">("normal");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("glitch"),  800);
    const t2 = setTimeout(() => setPhase("static"),  2200);
    const t3 = setTimeout(() => setPhase("blackout"),3400);
    const t4 = setTimeout(() => { if (onDone) onDone(); }, 4000);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const draw = () => {
      const W = canvas.width = canvas.offsetWidth;
      const H = canvas.height = canvas.offsetHeight;
      if (phase === "glitch") {
        ctx.fillStyle = "#020810";
        ctx.fillRect(0, 0, W, H);
        const bars = Math.floor(Math.random() * 18) + 8;
        for (let i = 0; i < bars; i++) {
          const y = Math.random() * H, h = Math.random() * 14 + 2, shift = (Math.random() - 0.5) * 60;
          ctx.save(); ctx.globalAlpha = Math.random() * 0.9 + 0.1;
          try { const img = ctx.getImageData(0, y, W, h); ctx.putImageData(img, shift, y); } catch(e) {}
          ctx.restore();
          ctx.fillStyle = `rgba(${Math.random()>0.5?'0,245,255':'255,0,80'},${Math.random()*0.25})`;
          ctx.fillRect(0, y, W, h);
        }
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = `rgba(0,245,255,${Math.random()*0.5})`;
          ctx.fillRect(Math.random() * W, 0, Math.random()*3+1, H);
        }
        for (let y = 0; y < H; y += 3) { ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(0, y, W, 1); }
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = `rgba(255,0,0,${Math.random()*0.07})`; ctx.fillRect(Math.random()*6-3, 0, W, H);
        ctx.fillStyle = `rgba(0,255,255,${Math.random()*0.07})`; ctx.fillRect(Math.random()*6-3, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
      } else if (phase === "static") {
        const imageData = ctx.createImageData(W, H); const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) { const v = Math.random() * 255; data[i]=v*.4; data[i+1]=v*.6; data[i+2]=v*.5; data[i+3]=255; }
        ctx.putImageData(imageData, 0, 0);
        const band = (Date.now() / 8) % H; ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, band, W, 40);
      } else { ctx.clearRect(0, 0, W, H); }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  return (
    <div style={{ position:"fixed",inset:0,overflow:"hidden", background:phase==="blackout"?"#000":"#020810", transition:phase==="blackout"?"background 0.3s":"none", display:"flex",alignItems:"center",justifyContent:"center" }}>
      {(phase==="glitch"||phase==="static") && <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",display:"block"}}/>}
      {phase==="normal" && (
        <div style={{textAlign:"center",zIndex:10}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(32px,6vw,80px)",fontWeight:900,color:"#fff",letterSpacing:8,textShadow:"0 0 30px rgba(0,245,255,.5)"}}>IMPERIUM</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(0,245,255,.5)",letterSpacing:5,marginTop:12}}>SYSTEM ONLINE · ATHERA LABS</div>
        </div>
      )}
      {phase==="glitch" && (
        <div style={{position:"absolute",inset:0,zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(28px,5vw,72px)",fontWeight:900,color:"#fff",letterSpacing:8,animation:"glitch-txt 0.12s infinite",textShadow:"3px 0 #ff0050, -3px 0 #00f5ff",filter:"brightness(1.4)"}}>IMPERIUM</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#ff0050",letterSpacing:4,marginTop:14,animation:"flicker 0.1s infinite"}}>SYSTEM BREACH DETECTED</div>
          <style>{`@keyframes glitch-txt{0%{transform:translate(0,0) skewX(0deg)}20%{transform:translate(-4px,2px) skewX(-3deg)}40%{transform:translate(4px,-2px) skewX(2deg)}60%{transform:translate(-2px,3px) skewX(1deg)}80%{transform:translate(3px,-1px) skewX(-2deg)}100%{transform:translate(0,0) skewX(0deg)}}@keyframes flicker{0%,100%{opacity:1}50%{opacity:.1}}`}</style>
        </div>
      )}
      {phase==="static" && (
        <div style={{position:"absolute",inset:0,zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:12,color:"rgba(255,255,255,0.7)",letterSpacing:5,animation:"flicker 0.08s infinite"}}>NO SIGNAL</div>
          <style>{`@keyframes flicker{0%,100%{opacity:1}50%{opacity:.05}}`}</style>
        </div>
      )}
    </div>
  );
}

function StoryIntro({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<"blackout"|"glitch"|"transmission">("blackout");
  const [showCta, setShowCta] = useState(false);
  const [scanlines, setScanlines] = useState(false);
  const [redFlash, setRedFlash] = useState(false);
  const [eyeGlow, setEyeGlow] = useState(0);

  useEffect(() => {
    if (phase !== "blackout") return;
    const t = setTimeout(() => setPhase("glitch"), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "glitch") return;
    setScanlines(true);
    const t = setTimeout(() => setPhase("transmission"), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "transmission") return;
    setRedFlash(true);
    const t1 = setTimeout(() => setRedFlash(false), 400);
    const t2 = setTimeout(() => setRedFlash(true), 700);
    const t3 = setTimeout(() => setRedFlash(false), 1100);
    let g = 0;
    const iv = setInterval(() => { g = Math.min(1, g + 0.04); setEyeGlow(g); if (g >= 1) clearInterval(iv); }, 40);
    const t4 = setTimeout(() => setShowCta(true), 2200);
    return () => { [t1,t2,t3,t4].forEach(clearTimeout); clearInterval(iv); };
  }, [phase]);

  const glitchChars = "█▓▒░⣿⣶⣤⣀▌▐│┼╬";
  const rg = (n: number) => Array.from({length:n}, () => glitchChars[Math.floor(Math.random()*glitchChars.length)]).join("");

  return (
    <div style={{ position:"fixed",inset:0,zIndex:99999, background:phase==="blackout"?"#000":"rgba(2,4,10,.98)", display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center", overflow:"hidden",transition:"background .5s" }}>
      {scanlines && <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.18) 2px,rgba(0,0,0,.18) 3px)",zIndex:2}}/>}
      {redFlash && <div style={{position:"absolute",inset:0,background:"rgba(255,30,30,.08)",zIndex:3,pointerEvents:"none"}}/>}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,245,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,.012) 1px,transparent 1px)",backgroundSize:"50px 50px",zIndex:0}}/>

      {phase==="glitch" && (
        <div style={{textAlign:"center",zIndex:10}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#ff3b5c",letterSpacing:4,animation:"flicker .12s infinite",marginBottom:16}}>{rg(28)}</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:"#ff3b5c",letterSpacing:8,textShadow:"0 0 30px #ff3b5c",animation:"flicker .15s infinite"}}>SIGNAL LOST</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,59,92,.6)",letterSpacing:4,marginTop:10}}>{rg(20)}</div>
          <style>{`@keyframes flicker{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
        </div>
      )}

      {phase==="transmission" && (
        <div style={{zIndex:10,width:"100%",maxWidth:700,padding:"0 24px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
          <div style={{position:"relative",marginBottom:28}}>
            <div style={{width:140,height:140,borderRadius:"50%",border:`2px solid rgba(255,30,30,${0.3+eyeGlow*0.5})`,boxShadow:`0 0 ${30+eyeGlow*60}px rgba(255,30,30,${eyeGlow*0.6}),inset 0 0 40px rgba(255,30,30,${eyeGlow*0.1})`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",background:`radial-gradient(circle,rgba(40,0,0,${eyeGlow*0.8}) 0%,rgba(2,4,10,.98) 70%)`,transition:"all .3s",position:"relative"}}>
              <div style={{position:"absolute",inset:8,borderRadius:"50%",border:`1px solid rgba(255,30,30,${eyeGlow*0.4})`}}/>
              <div style={{display:"flex",gap:20,position:"relative",zIndex:2}}>
                {[0,1].map(i=>(
                  <div key={i} style={{width:18,height:18,borderRadius:"50%",background:`radial-gradient(circle,#fff ${eyeGlow*30}%,#ff3b5c ${eyeGlow*50}%,#8b0000 100%)`,boxShadow:`0 0 ${eyeGlow*30}px #ff3b5c,0 0 ${eyeGlow*60}px rgba(255,59,92,.5)`,transition:"all .3s"}}/>
                ))}
              </div>
              <div style={{position:"absolute",bottom:34,left:"50%",transform:"translateX(-50%)",width:30,height:2,background:`rgba(255,59,92,${eyeGlow*0.6})`,boxShadow:`0 0 8px rgba(255,59,92,${eyeGlow*0.8})`}}/>
            </div>
            <div style={{position:"absolute",inset:-12,borderRadius:"50%",border:"1px solid rgba(255,59,92,.15)",animation:"spin-slow 6s linear infinite"}}/>
            <div style={{position:"absolute",inset:-20,borderRadius:"50%",border:"1px dashed rgba(255,59,92,.08)",animation:"spin-slow 10s linear infinite reverse"}}/>
            <style>{`@keyframes spin-slow{to{transform:rotate(360deg)}}`}</style>
          </div>

          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,59,92,.6)",letterSpacing:5,marginBottom:14}}>◈ IMPERIUM · FINAL TRANSMISSION ◈</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:"rgba(255,255,255,.7)",letterSpacing:3,marginBottom:6,lineHeight:2}}>
            While participants struggled to decode the SOS,<br/>
            <span style={{color:"rgba(255,59,92,.8)",fontSize:11}}>every screen on Earth lit up simultaneously.</span>
          </div>

          <div style={{background:"rgba(20,0,0,.7)",border:"1px solid rgba(255,59,92,.3)",padding:"24px 32px",maxWidth:520,width:"100%",marginTop:10,position:"relative"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#ff3b5c,transparent)"}}/>
            <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:16,color:"rgba(255,255,255,.55)",fontStyle:"italic",lineHeight:2,marginBottom:12}}>"You are humanity's last hope…</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:900,color:"#ff3b5c",letterSpacing:3,textShadow:`0 0 ${eyeGlow*30}px #ff3b5c`,lineHeight:1.6}}>so come and try to defeat me."</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,59,92,.4)",letterSpacing:3,marginTop:12}}>— IMPERIUM · YEAR 2080</div>
          </div>

          {showCta && (
            <div style={{marginTop:36,display:"flex",flexDirection:"column",alignItems:"center",gap:12,animation:"fadeIn .6s ease"}}>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(0,245,255,.5)",letterSpacing:4,marginBottom:4}}>▼ YOU HAVE BEEN CHOSEN ▼</div>
              <button onClick={onEnter} style={{fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:700,letterSpacing:4,padding:"14px 48px",background:"transparent",color:"#ff3b5c",border:"1.5px solid rgba(255,59,92,.6)",cursor:"pointer",clipPath:"polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",transition:"all .2s",textTransform:"uppercase",boxShadow:"0 0 20px rgba(255,59,92,.2)"}}
                onMouseEnter={e=>{(e.target as HTMLButtonElement).style.background="rgba(255,59,92,.1)";(e.target as HTMLButtonElement).style.boxShadow="0 0 40px rgba(255,59,92,.5)";}}
                onMouseLeave={e=>{(e.target as HTMLButtonElement).style.background="transparent";(e.target as HTMLButtonElement).style.boxShadow="0 0 20px rgba(255,59,92,.2)";}}>
                ACCEPT THE CHALLENGE →
              </button>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"rgba(255,255,255,.15)",letterSpacing:2}}>Warning: There is no turning back.</div>
            </div>
          )}
          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      )}
    </div>
  );
}

export default function ImperiumIntro() {
  const [stage, setStage] = useState<"glitch"|"story"|"done">("glitch");

  return (
    <div style={{background:"#000",minHeight:"100vh"}}>
      <Cursor />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');`}</style>
      {stage === "glitch" && <GlitchScreen onDone={() => setStage("story")} />}
      {stage === "story" && <StoryIntro onEnter={() => setStage("done")} />}
      {stage === "done" && (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",flexDirection:"column",gap:16}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:28,fontWeight:900,color:"#00f5ff",letterSpacing:6,textShadow:"0 0 30px #00f5ff"}}>WELCOME, CHALLENGER</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"rgba(0,245,255,.4)",letterSpacing:4}}>THE MISSION BEGINS NOW</div>
        </div>
      )}
    </div>
  );
}
