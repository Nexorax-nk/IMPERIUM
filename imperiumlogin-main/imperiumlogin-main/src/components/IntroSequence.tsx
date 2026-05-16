// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Cursor from "./Cursor";


function GlitchScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState("normal");
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    
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
          try { const img = ctx.getImageData(0, y, W, h); ctx.putImageData(img, shift, y); } catch {}
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
      rafRef.current = requestAnimationFrame(draw) as any;
    };
    rafRef.current = requestAnimationFrame(draw) as any;
    return () => cancelAnimationFrame(rafRef.current as any);
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
  const [phase, setPhase] = useState("blackout");
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
      {/* scanlines */}
      {scanlines && <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.18) 2px,rgba(0,0,0,.18) 3px)",zIndex:2}}/>}
      {/* red flash */}
      {redFlash && <div style={{position:"absolute",inset:0,background:"rgba(255,30,30,.08)",zIndex:3,pointerEvents:"none"}}/>}
      {/* grid bg */}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,245,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,.012) 1px,transparent 1px)",backgroundSize:"50px 50px",zIndex:0}}/>

      {/* GLITCH phase */}
      {phase==="glitch" && (
        <div style={{textAlign:"center",zIndex:10}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#ff3b5c",letterSpacing:4,animation:"flicker .12s infinite",marginBottom:16}}>{rg(28)}</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:"#ff3b5c",letterSpacing:8,textShadow:"0 0 30px #ff3b5c",animation:"flicker .15s infinite"}}>SIGNAL LOST</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"rgba(255,59,92,.6)",letterSpacing:4,marginTop:10}}>{rg(20)}</div>
          <style>{`@keyframes flicker{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
        </div>
      )}

      {/* TRANSMISSION phase */}
      {phase==="transmission" && (
        <div style={{zIndex:10,width:"100%",maxWidth:700,padding:"0 24px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
          {/* IMPERIUM face */}
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
                onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(255,59,92,.1)";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 0 40px rgba(255,59,92,.5)";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="transparent";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 0 20px rgba(255,59,92,.2)";}}>
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

export default function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState("glitch"); // glitch → story → done

  useEffect(() => {
    if (stage === "done" && onComplete) {
      onComplete();
    }
  }, [stage, onComplete]);

  if (stage === "done") return null;

  return (
    <div style={{background:"#000",minHeight:"100vh",position:"fixed",inset:0,zIndex:999999}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');`}</style>
      <Cursor />
      {stage === "glitch" && <GlitchScreen onDone={() => setStage("story")} />}
      {stage === "story" && <StoryIntro onEnter={() => setStage("done")} />}
    </div>
  );
}
