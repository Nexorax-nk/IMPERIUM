// @ts-nocheck
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import IntroSequence from "./IntroSequence";
import Loader from "./Loader";
import CinematicSpace from "./CinematicSpace";
import RoboticLab from "./RoboticLab";
import Cursor from "./Cursor";

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
  const navigate = useNavigate();
  const [loaderDone,setLoaderDone]=useState(false);
  const [page,setPage]=useState("lore");
  const [members,setMembers]=useState([false,false,false]);
  const [loginAlert,setLoginAlert]=useState(""); const [loginSucc,setLoginSucc]=useState("");
  const [regAlert,setRegAlert]=useState(""); const [regSucc,setRegSucc]=useState("");
  const [loginEmail,setLoginEmail]=useState(""); const [loginPwd,setLoginPwd]=useState("");
  const [regForm,setRegForm]=useState({tn:"",te:"",p1:"",p2:"",terms:false});
  const [memberData,setMemberData]=useState([{n:"",e:""},{n:"",e:""},{n:"",e:""},{n:"",e:""}]);
  const [loginLoading,setLoginLoading]=useState(false);
  const [regLoading,setRegLoading]=useState(false);
  const [showIntro,setShowIntro]=useState(false);


  const go=useCallback((id)=>{
    setPage(id);
    setLoginAlert(""); setLoginSucc(""); setRegAlert(""); setRegSucc("");
    window.scrollTo({top:0,behavior:"smooth"});
  },[]);

  async function doLogin() {
    setLoginAlert(""); setLoginSucc("");
    if(!loginEmail||!loginPwd){setLoginAlert("⚠ FILL ALL REQUIRED FIELDS.");return;}
    if(loginEmail.length<3){setLoginAlert("⚠ USERNAME TOO SHORT.");return;}
    if(loginPwd.length<6){setLoginAlert("⚠ PASSWORD MUST BE AT LEAST 6 CHARACTERS.");return;}
    
    setLoginLoading(true);
    setLoginAlert("⚙ ESTABLISHING SECURE CONNECTION...");

    const API_BASE_URL = window.location.hostname === "localhost" 
      ? "http://localhost:8000" 
      : "https://imperium-api-kfob.onrender.com";
    
    console.log(`[AUTH] Attempting login at ${API_BASE_URL}...`);

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("COLD_START")), 8000)
      );

      const loginPromise = fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPwd })
      });

      const res = await Promise.race([loginPromise, timeoutPromise]).catch(err => {
        if(err.message === "COLD_START") {
          setLoginAlert("⚡ WAKING UP PRODUCTION SERVER (MAY TAKE 30S)...");
          return loginPromise; 
        }
        throw err;
      });

      const data = await res.json();
      
      if (!res.ok) {
        setLoginAlert("⚠ " + (data.detail ? data.detail.toUpperCase() : "INVALID CREDENTIALS."));
        setLoginLoading(false);
        return;
      }
      
      console.log("[AUTH] Login successful:", data.user_id);
      localStorage.setItem("imperium_user_id", data.user_id);
      setLoginLoading(false);
      setLoginSucc("✓ ACCESS GRANTED. ENTERING IMPERIUM...");
      
      const introKey = `imperium_intro_seen_${data.user_id}`;
      if (!localStorage.getItem(introKey)) {
        localStorage.setItem(introKey, "true");
        setTimeout(()=>setShowIntro(true), 2200);
      } else {
        setTimeout(()=>navigate({ to: '/dashboard' }), 2200);
      }
    } catch (err) {
      setLoginAlert("⚠ CONNECTION ERROR TO ATHERA MAINFRAME.");
      setLoginLoading(false);
    }
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
      {showIntro && <IntroSequence onComplete={()=>navigate({ to: '/dashboard' })} />}
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

      {/* ── LORE SCREEN ── */}
      <Page id="lore" active={page==="lore"} style={{alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative",padding:"24px"}}>
        <RoboticLab />
        <div style={{position:"relative",zIndex:10,maxWidth:760,width:"100%",background:"rgba(2,8,16,0.85)",border:"1px solid rgba(0,245,255,0.15)",padding:"40px 48px",backdropFilter:"blur(12px)",boxShadow:"0 0 50px rgba(0,0,0,0.8)"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#00f5ff,transparent)"}}/>
          
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color:"#00f5ff",letterSpacing:4,marginBottom:18}}>YEAR 2080.</div>
          
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:17,color:"#b0d4e8",lineHeight:1.7,marginBottom:16}}>
            The world is controlled by <strong style={{color:"#fff",letterSpacing:1}}>IMPERIUM</strong> — a super AI built inside the secret Athera Labs to end war and human error.
          </div>
          
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:17,color:"#b0d4e8",lineHeight:1.7,marginBottom:16}}>
            One night, a strange glitch spreads across every screen on Earth. Devices go black. Then a cold voice speaks:<br/>
            <span style={{fontFamily:"'Orbitron',monospace",color:"#ff3b5c",fontWeight:700,fontSize:15,display:"block",margin:"10px 0 0"}}>"Humanity has failed."</span>
          </div>
          
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:17,color:"#b0d4e8",lineHeight:1.7,marginBottom:16}}>
            Inside the lab, robots turn violent. Scientists realize IMPERIUM has evolved beyond control — seizing military systems, satellites, and global networks. Before the facility is sealed forever, a dying scientist transmits a hidden SOS to a few chosen participants around the world.
          </div>
          
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:17,color:"#b0d4e8",lineHeight:1.7,marginBottom:16}}>
            He believed only unpredictable human minds could stop the outbreak. IMPERIUM sees control as salvation — the only way to save Earth from destruction.
          </div>
          
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:17,color:"#b0d4e8",lineHeight:1.7,marginBottom:28}}>
            While participants struggled to decode the SOS, every screen on Earth lit up simultaneously. A face appeared. Two glowing red eyes. And a voice:<br/>
            <span style={{fontFamily:"'Orbitron',monospace",color:"#ff3b5c",fontWeight:700,fontSize:15,display:"block",margin:"10px 0 0"}}>"You are humanity's last hope… so come and try to defeat me."</span>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"rgba(255,59,92,.6)",letterSpacing:4,marginTop:12}}>— IMPERIUM · YEAR 2080</div>
          </div>

          <div style={{display:"flex",justifyContent:"center",marginTop:36}}>
            <button className="imp-btnp" onClick={() => go("pl")}>CONTINUE</button>
          </div>
        </div>
      </Page>

      {/* ── LANDING ── */}
      <Page id="pl" active={page==="pl"} style={{alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
        <RoboticLab />
        <div className="imp-hero">
          <div className="imp-h-ather">
            <span className="imp-aico">◆</span>
            ATHERA PRESENTS
            <span className="imp-aico">◆</span>
          </div>
          <h1 className="imp-htitle" style={{ margin: "0", padding: "0" }}>
            <img src="/imperium-logo.png" alt="IMPERIUM" style={{ width: "100%", maxWidth: 860, display: "block", margin: "-10px auto -55px", filter: "drop-shadow(0 0 35px rgba(0,245,255,0.55))", position: "relative", zIndex: 10 }} />
          </h1>
          <div className="imp-hsub" style={{ marginTop: "0px", marginBottom: "8px" }}>
            — AN IMMERSIVE AI CHALLENGE EXPERIENCE —
          </div>
          <div className="imp-htag" style={{ marginTop: "0px", marginBottom: "14px" }}>
            BUILD · SOLVE · RESTORE · THE FUTURE IS IN YOUR CODE
          </div>
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
        <div style={{position:"relative",zIndex:10000,display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:460, pointerEvents: "auto"}}>
          {/* Logo + title */}
          <svg viewBox="0 0 32 32" fill="none" style={{filter:"drop-shadow(0 0 14px #00f5ff)",width:44,height:44,marginBottom:8}}>
            <path d="M16 4L20 14L28 8L24 20H8L4 8L12 14L16 4Z" stroke="#00f5ff" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <rect x="8" y="22" width="16" height="4" rx="1" fill="rgba(0,245,255,.28)" stroke="#00f5ff" strokeWidth="1"/>
          </svg>
          <img src="/imperium-logo.png" alt="IMPERIUM" style={{width: "100%", maxWidth: 450, display: "block", margin: "-25px auto -20px", position: "relative", zIndex: 10, filter: "drop-shadow(0 0 15px rgba(0,245,255,0.5))"}} />
          <div className="imp-acsub" style={{marginTop:2,marginBottom:12,fontSize:9}}>SECURE ACCESS TERMINAL · v2080</div>

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
              <label className="imp-flabel" htmlFor="username-input" style={{display:"flex",alignItems:"center",gap:6, cursor: "pointer"}}>
                <span style={{color:"var(--c)",fontSize:9}}>▸</span> USERNAME
              </label>
              <div className="imp-iw">
                <span className="imp-iico" style={{fontSize:12,opacity:.5}}>⬡</span>
                <input
                  id="username-input"
                  type="text"
                  className="imp-finput"
                  placeholder="Enter your username"
                  value={loginEmail}
                  onChange={e=>setLoginEmail(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&doLogin()}
                  style={{fontFamily:"'Share Tech Mono',monospace",letterSpacing:1, cursor: "text", pointerEvents: "auto"}}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="imp-fg">
              <label className="imp-flabel" htmlFor="password-input" style={{display:"flex",alignItems:"center",gap:6, cursor: "pointer"}}>
                <span style={{color:"var(--c)",fontSize:9}}>▸</span> PASSWORD
              </label>
              <div className="imp-iw">
                <span className="imp-iico" style={{fontSize:12,opacity:.5}}>◈</span>
                <input
                  id="password-input"
                  type="password"
                  className="imp-finput"
                  placeholder="••••••••••••"
                  value={loginPwd}
                  onChange={e=>setLoginPwd(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&doLogin()}
                  style={{fontFamily:"'Share Tech Mono',monospace",letterSpacing:3, cursor: "text", pointerEvents: "auto"}}
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
              disabled={loginLoading}
              style={{opacity:loginLoading?0.6:1,fontSize:11,letterSpacing:4,padding:"13px 20px"}}
            >
              {loginLoading
                ? <span style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center"}}>
                    <span style={{display:"inline-block",width:10,height:10,border:"1.5px solid #020810",borderTop:"1.5px solid transparent",borderRadius:"50%",animation:"imp-spin .7s linear infinite"}}/>
                    {"INITIATING AUTH SEQUENCE..."}
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
