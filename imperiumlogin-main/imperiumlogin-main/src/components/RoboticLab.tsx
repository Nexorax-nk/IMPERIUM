// @ts-nocheck
import React, { useEffect, useRef } from "react";

export default function RoboticLab() {
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
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:2,pointerEvents:"none"}} />;
}
