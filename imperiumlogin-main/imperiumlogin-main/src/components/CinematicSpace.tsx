// @ts-nocheck
import React, { useEffect, useRef } from "react";

export default function CinematicSpace() {
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
    function project3D(px, py, pz, yaw, ptch, rll, fov, cx2, cy2) {
      let rx = px * Math.cos(rll) - py * Math.sin(rll);
      let ry = px * Math.sin(rll) + py * Math.cos(rll);
      let rz = pz;
      let py2 = ry * Math.cos(ptch) - rz * Math.sin(ptch);
      let pz2 = ry * Math.sin(ptch) + rz * Math.cos(ptch);
      let px2 = rx;
      let fx = px2 * Math.cos(yaw) + pz2 * Math.sin(yaw);
      let fy = py2;
      let fz = -px2 * Math.sin(yaw) + pz2 * Math.cos(yaw);
      const d = fov / (fov + fz + 0.001);
      return { sx: cx2 + fx * d, sy: cy2 + fy * d, d, z: fz };
    }

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

      const gG = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, s * 2.2);
      gG.addColorStop(0, "rgba(0,180,255,0.10)");
      gG.addColorStop(0.4, "rgba(0,80,200,0.04)");
      gG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(cx2, cy2, s * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = gG; ctx.fill();

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
        const cG2 = ctx.createRadialGradient(np.sx, np.sy + plumeL*0.1, 0, np.sx, np.sy + plumeL*0.1, plumeW*0.8);
        cG2.addColorStop(0, "rgba(255,255,255,0.9)"); cG2.addColorStop(0.5, "rgba(0,220,255,0.4)"); cG2.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.ellipse(np.sx, np.sy + plumeL*0.1, plumeW*0.8, plumeL*0.15, 0, 0, Math.PI*2);
        ctx.fillStyle = cG2; ctx.fill();
      });

      const shadowP = project3D(0, s*0.35, 0, yaw, ptch, rll, fov, cx2, cy2);
      const shG = ctx.createRadialGradient(shadowP.sx, shadowP.sy + s*0.18, 0, shadowP.sx, shadowP.sy + s*0.18, s*1.2);
      shG.addColorStop(0, "rgba(0,20,60,0.45)"); shG.addColorStop(1, "transparent");
      ctx.save(); ctx.scale(1, 0.22);
      ctx.beginPath(); ctx.arc(shadowP.sx, (shadowP.sy + s*0.18) / 0.22, s*1.1, 0, Math.PI*2);
      ctx.fillStyle = shG; ctx.fill(); ctx.restore();

      const belly = [
        [-s*0.22, s*0.12, -s*0.08], [s*0.22, s*0.12, -s*0.08],
        [s*0.26, s*0.1,   s*0.2 ],  [-s*0.26, s*0.1, s*0.2 ],
      ];
      const bellyLight = 0.25 + 0.1 * Math.sin(t*0.8 + 1);
      drawFace3D(belly, yaw, ptch, rll, fov, cx2, cy2, `rgba(8,18,38,${bellyLight})`, "rgba(0,180,255,0.18)", 0.7);

      [[-1],[1]].forEach(([fl]) => {
        const wConn = [[fl*s*0.22, s*0.0, -s*0.05], [fl*s*0.65, s*0.02, -s*0.1], [fl*s*0.65, s*0.12, s*0.05], [fl*s*0.22, s*0.1, s*0.08]];
        const wLight = 0.4 + 0.12 * fl * Math.sin(yaw);
        drawFace3D(wConn, yaw, ptch, rll, fov, cx2, cy2, `rgba(18,32,56,${wLight})`, "rgba(0,200,255,0.25)", 0.8);
      });

      [[-1],[1]].forEach(([fl]) => {
        const wingTop = [[fl*s*0.22, s*0.0, -s*0.05], [fl*s*1.52, s*0.04, -s*0.15], [fl*s*1.52, s*0.08, s*0.0 ], [fl*s*0.22, s*0.06, s*0.12]];
        const wl = 0.55 - fl*0.12*Math.sin(yaw)*0.5;
        drawFace3D(wingTop, yaw, ptch, rll, fov, cx2, cy2, `rgba(22,40,70,${wl})`, "rgba(0,200,255,0.28)", 0.9);
        const wingBot = [[fl*s*0.22, s*0.06, s*0.12], [fl*s*1.52, s*0.08, s*0.0 ], [fl*s*1.52, s*0.16, -s*0.0 ], [fl*s*0.22, s*0.14, s*0.1 ]];
        drawFace3D(wingBot, yaw, ptch, rll, fov, cx2, cy2, `rgba(10,20,40,${wl*0.7})`, "rgba(0,150,255,0.15)", 0.6);

        ctx.strokeStyle = "rgba(0,200,255,0.12)"; ctx.lineWidth = 0.5;
        [[0.35],[0.6],[0.82]].forEach(([u]) => {
          const p1 = project3D(fl*s*(0.22+u*1.3), s*0.02, -s*0.08 + u*s*0.06, yaw, ptch, rll, fov, cx2, cy2);
          const p2 = project3D(fl*s*(0.22+u*1.3), s*0.12, s*0.08, yaw, ptch, rll, fov, cx2, cy2);
          ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
        });

        const nacPos = project3D(fl*s*1.52, s*0.1, -s*0.06, yaw, ptch, rll, fov, cx2, cy2);
        const nacR = s * 0.065 * nacPos.d;
        const nacG2 = ctx.createRadialGradient(nacPos.sx, nacPos.sy, 0, nacPos.sx, nacPos.sy, nacR);
        nacG2.addColorStop(0, "#2a4a70"); nacG2.addColorStop(1, "#0a1825");
        ctx.beginPath(); ctx.ellipse(nacPos.sx, nacPos.sy, nacR * 1.4, nacR * 0.55, fl*yaw*0.3, 0, Math.PI*2);
        ctx.fillStyle = nacG2; ctx.fill();
        ctx.strokeStyle = "rgba(0,220,255,0.7)"; ctx.lineWidth = 0.9; ctx.stroke();
        const nacLit = (Math.floor(T()*2 + fl) % 2) === 0;
        ctx.shadowColor = "rgba(0,255,180,1)"; ctx.shadowBlur = nacLit ? 12 : 2;
        ctx.beginPath(); ctx.arc(nacPos.sx, nacPos.sy, nacR*0.3*(nacLit?1:0.4), 0, Math.PI*2);
        ctx.fillStyle = `rgba(0,255,180,${nacLit?0.95:0.15})`; ctx.fill(); ctx.shadowBlur = 0;
      });

      const engFaces = [
        [[-s*0.22,s*0.08,s*0.22],[s*0.22,s*0.08,s*0.22],[s*0.22,s*0.24,s*0.22],[-s*0.22,s*0.24,s*0.22]],
        [[-s*0.22,s*0.08,-s*0.0],[s*0.22,s*0.08,-s*0.0],[s*0.22,s*0.08,s*0.22],[-s*0.22,s*0.08,s*0.22]],
        [[-s*0.22,s*0.08,-s*0.0],[-s*0.22,s*0.08,s*0.22],[-s*0.22,s*0.24,s*0.22],[-s*0.22,s*0.24,-s*0.0]],
        [[s*0.22,s*0.08,-s*0.0],[s*0.22,s*0.08,s*0.22],[s*0.22,s*0.24,s*0.22],[s*0.22,s*0.24,-s*0.0]],
      ];
      const engColors = ["rgba(12,24,50,0.95)","rgba(20,38,70,0.85)","rgba(10,20,44,0.75)","rgba(10,20,44,0.75)"];
      engFaces.forEach((f, i) => drawFace3D(f, yaw, ptch, rll, fov, cx2, cy2, engColors[i], "rgba(0,160,255,0.22)", 0.7));

      const hulFaces = [
        [[0,-s*0.9,-s*0.14],[-s*0.2,s*0.0,-s*0.06],[s*0.2,s*0.0,-s*0.06]],
        [[0,-s*0.9,-s*0.14],[-s*0.2,s*0.0,-s*0.06],[-s*0.22,s*0.08,s*0.12],[0,-s*0.4,s*0.18]],
        [[0,-s*0.9,-s*0.14],[s*0.2,s*0.0,-s*0.06],[s*0.22,s*0.08,s*0.12],[0,-s*0.4,s*0.18]],
        [[-s*0.2,s*0.0,-s*0.06],[s*0.2,s*0.0,-s*0.06],[s*0.22,s*0.08,-s*0.0],[-s*0.22,s*0.08,-s*0.0]],
        [[-s*0.2,s*0.0,-s*0.06],[-s*0.22,s*0.08,-s*0.0],[-s*0.22,s*0.08,s*0.22],[-s*0.2,s*0.02,s*0.22]],
        [[s*0.2,s*0.0,-s*0.06],[s*0.22,s*0.08,-s*0.0],[s*0.22,s*0.08,s*0.22],[s*0.2,s*0.02,s*0.22]],
        [[-s*0.2,s*0.02,s*0.22],[s*0.2,s*0.02,s*0.22],[s*0.22,s*0.08,s*0.22],[-s*0.22,s*0.08,s*0.22]],
      ];
      const sunDir = [-0.55, -0.65, 0.5];
      const faceNormals = [[0,-0.9,-0.4],[-1,0,0],[1,0,0],[0,-1,0],[-1,0,0],[1,0,0],[0,0,1]];
      const hulBaseColors = [[38,65,110],[28,52,88],[28,52,88],[40,70,118],[22,40,72],[22,40,72],[16,30,58]];
      hulFaces.forEach((f, i) => {
        const n = faceNormals[i]||[0,1,0];
        const lum = Math.max(0, n[0]*sunDir[0]+n[1]*sunDir[1]+n[2]*sunDir[2]);
        const [r,g,b] = hulBaseColors[i]||[30,50,90];
        const lit = 0.45 + lum * 0.55;
        drawFace3D(f, yaw, ptch, rll, fov, cx2, cy2, `rgba(${Math.round(r*lit)},${Math.round(g*lit)},${Math.round(b*lit)},0.97)`, "rgba(0,200,255,0.22)", 0.8);
      });

      const panelLines = [[[-s*0.05, -s*0.5, -s*0.05],[s*0.05,-s*0.5,-s*0.05]], [[-s*0.1, -s*0.2, s*0.04],[s*0.1,-s*0.2,s*0.04]], [[-s*0.14, s*0.0, s*0.1],[s*0.14,s*0.0,s*0.1]]];
      panelLines.forEach(([a,b]) => {
        const pa = project3D(...a, yaw, ptch, rll, fov, cx2, cy2);
        const pb = project3D(...b, yaw, ptch, rll, fov, cx2, cy2);
        ctx.beginPath(); ctx.moveTo(pa.sx,pa.sy); ctx.lineTo(pb.sx,pb.sy);
        ctx.strokeStyle="rgba(0,200,255,0.18)"; ctx.lineWidth=0.7; ctx.stroke();
      });

      const cockCenter = project3D(0, -s*0.55, -s*0.16, yaw, ptch, rll, fov, cx2, cy2);
      const cR = s * 0.14 * cockCenter.d;
      const cG3 = ctx.createRadialGradient(cockCenter.sx - cR*0.3, cockCenter.sy - cR*0.3, 0, cockCenter.sx, cockCenter.sy, cR * 1.4);
      cG3.addColorStop(0, "rgba(160,240,255,0.95)"); cG3.addColorStop(0.35, "rgba(60,180,255,0.6)"); cG3.addColorStop(0.7, "rgba(10,80,200,0.3)"); cG3.addColorStop(1, "rgba(0,20,80,0.05)");
      ctx.shadowColor = "rgba(100,230,255,0.9)"; ctx.shadowBlur = cR * 1.2;
      ctx.beginPath(); ctx.ellipse(cockCenter.sx, cockCenter.sy, cR * 1.35, cR, -0.2 + yaw*0.3, 0, Math.PI*2);
      ctx.fillStyle = cG3; ctx.fill(); ctx.strokeStyle = "rgba(140,230,255,0.8)"; ctx.lineWidth = 1.1; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cockCenter.sx - cR*0.3, cockCenter.sy - cR*0.25, cR*0.45, cR*0.22, -0.5, 0, Math.PI*2);
      ctx.fillStyle = "rgba(255,255,255,0.38)"; ctx.fill(); ctx.shadowBlur = 0;

      const sBase = project3D(0, -s*0.55, -s*0.08, yaw, ptch, rll, fov, cx2, cy2);
      const sTip  = project3D(0, -s*0.98, -s*0.13, yaw, ptch, rll, fov, cx2, cy2);
      ctx.shadowColor = "rgba(0,245,255,1)"; ctx.shadowBlur = 10;
      ctx.strokeStyle = "rgba(0,220,255,0.65)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(sBase.sx, sBase.sy); ctx.lineTo(sTip.sx, sTip.sy); ctx.stroke();
      const tipG2 = ctx.createRadialGradient(sTip.sx, sTip.sy, 0, sTip.sx, sTip.sy, s*0.035*sTip.d);
      tipG2.addColorStop(0, "rgba(0,245,255,1)"); tipG2.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(sTip.sx, sTip.sy, s*0.038*sTip.d, 0, Math.PI*2);
      ctx.fillStyle = tipG2; ctx.fill();
      [[-s*0.22,0],[s*0.22,0]].forEach(([ax]) => {
        const ab = project3D(ax, -s*0.5, -s*0.08, yaw, ptch, rll, fov, cx2, cy2);
        const at = project3D(ax, -s*0.78, -s*0.1, yaw, ptch, rll, fov, cx2, cy2);
        ctx.strokeStyle = "rgba(0,200,255,0.45)"; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(ab.sx,ab.sy); ctx.lineTo(at.sx,at.sy); ctx.stroke();
        ctx.beginPath(); ctx.arc(at.sx, at.sy, s*0.022*at.d, 0, Math.PI*2);
        ctx.fillStyle = "rgba(0,245,255,0.7)"; ctx.fill();
      });
      ctx.shadowBlur = 0;

      const runLights = [{pos:[-s*1.52,s*0.06,-s*0.06], col:"255,60,60"}, {pos:[ s*1.52,s*0.06,-s*0.06], col:"0,255,100"}, {pos:[0,-s*0.9,-s*0.14], col:"255,255,255"}, {pos:[-s*0.22,s*0.08,-s*0.02], col:"0,200,255"}, {pos:[ s*0.22,s*0.08,-s*0.02], col:"0,200,255"}];
      runLights.forEach(({pos, col}, ri) => {
        const rp = project3D(...pos, yaw, ptch, rll, fov, cx2, cy2);
        const lit = (Math.floor(T()*2.5 + ri*0.9) % 3) !== 0;
        const lr = s * 0.022 * rp.d;
        ctx.shadowColor = `rgb(${col})`; ctx.shadowBlur = lit ? lr*9 : 2;
        ctx.beginPath(); ctx.arc(rp.sx, rp.sy, lr*(lit?1:0.45), 0, Math.PI*2);
        ctx.fillStyle = `rgba(${col},${lit?0.95:0.18})`; ctx.fill();
      });
      ctx.shadowBlur = 0;

      nozzles3D.forEach(([nx, ny, nz], ni) => {
        const np = project3D(nx, ny, nz, yaw, ptch, rll, fov, cx2, cy2);
        const nr = s * (ni===1?0.11:0.075) * np.d;
        const ep3 = 0.55 + 0.45 * Math.sin(ship.enginePulse * 3 + ni * 1.3);
        const ng2 = ctx.createRadialGradient(np.sx, np.sy, 0, np.sx, np.sy, nr * 2.2);
        ng2.addColorStop(0, `rgba(255,255,255,${0.9*ep3})`); ng2.addColorStop(0.25, `rgba(0,220,255,${0.7*ep3})`); ng2.addColorStop(0.6, `rgba(0,100,200,${0.3*ep3})`); ng2.addColorStop(1, "transparent");
        ctx.shadowColor = "rgba(0,220,255,1)"; ctx.shadowBlur = nr * 4;
        ctx.beginPath(); ctx.arc(np.sx, np.sy, nr * 2.2, 0, Math.PI*2);
        ctx.fillStyle = ng2; ctx.fill(); ctx.shadowBlur = 0;
      });

      FLARES.forEach(fl => {
        const flx = cx2 + fl.ox * s * 3.0, fly = cy2 + fl.oy * s * 2.5;
        const pulse = 0.7 + 0.3 * Math.sin(ship.enginePulse * 1.4);
        const fg = ctx.createRadialGradient(flx, fly, 0, flx, fly, fl.r * s * 0.022);
        fg.addColorStop(0, `rgba(${fl.col},${fl.a*pulse})`); fg.addColorStop(0.35, `rgba(${fl.col},${fl.a*0.3*pulse})`); fg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(flx, fly, fl.r*s*0.022, 0, Math.PI*2);
        ctx.fillStyle = fg; ctx.fill();
      });
    }

    function drawEParts(dt) {
      eParts.forEach(p => {
        if (p.life <= 0) return;
        p.life -= dt / p.maxLife; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.life <= 0) return;
        const a = p.life * 0.75;
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (2 - p.life));
        pg.addColorStop(0, `rgba(${p.col},${a})`); pg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (2.2 - p.life), 0, Math.PI * 2);
        ctx.fillStyle = pg; ctx.fill();
      });
    }

    function drawLightRays(t) {
      ctx.save();
      const srcX = W * 0.15, srcY = H * 0.08;
      for (let i = 0; i < 8; i++) {
        const ang = -0.5 + i * 0.18 + Math.sin(t * 0.12 + i) * 0.04;
        const len = H * (0.7 + Math.sin(t * 0.08 + i * 0.7) * 0.2);
        const a = 0.012 + 0.007 * Math.sin(t * 0.15 + i);
        const rg = ctx.createLinearGradient(srcX, srcY, srcX + Math.sin(ang) * len, srcY + Math.cos(ang) * len);
        rg.addColorStop(0, `rgba(0,100,255,${a * 3})`); rg.addColorStop(0.3, `rgba(0,60,200,${a})`); rg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.moveTo(srcX, srcY); ctx.lineTo(srcX + Math.sin(ang - 0.06) * len, srcY + Math.cos(ang - 0.06) * len); ctx.lineTo(srcX + Math.sin(ang + 0.06) * len, srcY + Math.cos(ang + 0.06) * len); ctx.closePath();
        ctx.fillStyle = rg; ctx.fill();
      }
      ctx.restore();
    }

    function drawBlackHole(t) {
      const bx = W * 0.12, by = H * 0.3, br = Math.min(W, H) * 0.055;
      for (let i = 0; i < 3; i++) {
        const a = 0.02 - i * 0.005;
        const eg = ctx.createRadialGradient(bx, by, br * (0.8 + i * 0.4), bx, by, br * (2.2 + i * 0.8));
        eg.addColorStop(0, `rgba(255,120,30,${a * 2})`); eg.addColorStop(0.35, `rgba(255,60,0,${a})`); eg.addColorStop(0.7, `rgba(100,20,0,${a * 0.4})`); eg.addColorStop(1, "transparent");
        ctx.save(); ctx.translate(bx, by); ctx.scale(1, 0.28 + i * 0.04); ctx.rotate(t * 0.08 + i * 0.5);
        ctx.beginPath(); ctx.arc(0, 0, br * (2.2 + i * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = eg; ctx.fill(); ctx.restore();
      }
      const hg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      hg.addColorStop(0, "rgba(0,0,0,1)"); hg.addColorStop(0.65, "rgba(0,0,0,0.97)"); hg.addColorStop(0.88, "rgba(10,0,20,0.5)"); hg.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fillStyle = hg; ctx.fill();
      ctx.beginPath(); ctx.arc(bx, by, br * 1.18, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,180,50,${0.18 + 0.08 * Math.sin(t * 1.2)})`; ctx.lineWidth = 1.5; ctx.stroke();
    }

    function drawPlanet(t) {
      const px = W * 0.88, py = H * 0.18, pr = Math.min(W, H) * 0.062;
      ctx.save();
      const atmG = ctx.createRadialGradient(px, py, pr * 0.85, px, py, pr * 1.55);
      atmG.addColorStop(0, "rgba(40,80,180,0)"); atmG.addColorStop(0.4, "rgba(60,120,255,0.12)"); atmG.addColorStop(0.75, "rgba(80,160,255,0.06)"); atmG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(px, py, pr * 1.55, 0, Math.PI * 2); ctx.fillStyle = atmG; ctx.fill();
      const pG = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 0, px, py, pr);
      pG.addColorStop(0, "#1a2d60"); pG.addColorStop(0.5, "#0d1a3a"); pG.addColorStop(1, "#040810");
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fillStyle = pG; ctx.fill();
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
      const icG = ctx.createRadialGradient(px, py - pr * 0.7, 0, px, py - pr * 0.7, pr * 0.38);
      icG.addColorStop(0, "rgba(200,230,255,0.5)"); icG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(px, py - pr * 0.7, pr * 0.38, 0, Math.PI * 2); ctx.fillStyle = icG; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(80,160,255,0.25)"; ctx.lineWidth = 1.2; ctx.stroke();
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
      mx += (tmx - mx) * 0.055; my += (tmy - my) * 0.055;
      scrollY += (tScrollY - scrollY) * 0.08;
      scrollVel *= 0.92;
      const scrollBoost = Math.min(Math.abs(scrollVel) * 0.008, 1);
      ship.drift += ship.driftSpd * dt * 60; ship.floatT += dt; ship.breathT += dt * 0.4;
      const fA = Math.sin(ship.floatT * 0.55) * 0.022; const fB = Math.cos(ship.floatT * 0.38) * 0.014; const fC = Math.sin(ship.floatT * 0.71 + 1.2) * 0.018; const fD = Math.cos(ship.floatT * 0.47 + 2.4) * 0.012; const fRoll = Math.sin(ship.floatT * 0.42) * 0.12 + Math.cos(ship.floatT * 0.63) * 0.07; const fPitch = Math.cos(ship.floatT * 0.35) * 0.09 + Math.sin(ship.floatT * 0.58) * 0.05;
      ship.tx = 0.68 + (mx - 0.5) * 0.04 + fA + fB; ship.ty = 0.72 + (my - 0.5) * 0.025 + fC + fD;
      ship.x += (ship.tx - ship.x) * 0.018; ship.y += (ship.ty - ship.y) * 0.018;
      ship.roll += ((mx - 0.5) * 0.22 + fRoll - ship.roll) * 0.04; ship.pitch += ((my - 0.5) * 0.18 + fPitch - ship.pitch) * 0.04;
      ship.enginePulse += dt * (2.2 + scrollBoost * 4); ship.tScale = 1 + scrollBoost * 0.12; ship.scale += (ship.tScale - ship.scale) * 0.06;
      ship.particleT += dt;
      if (ship.particleT > 0.022) {
        ship.particleT = 0;
        const sx = ship.x * W, sy = ship.y * H; const sz = Math.min(W, H) * 0.13 * ship.scale;
        [[-sz * 0.55, sz * 0.18], [0, sz * 0.22], [sz * 0.55, sz * 0.18]].forEach(([ox, oy]) => {
          for (let k = 0; k < 2; k++) spawnEP(sx + ox, sy + oy, k === 0 ? "0,200,255" : "168,85,247", 1 + scrollBoost * 2);
        });
      }
      if (t - lastMeteor > 2.5 + Math.random() * 6) { lastMeteor = t; spawnMeteor(); }
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, Math.max(W, H) * 1.1);
      bg.addColorStop(0, "#020818"); bg.addColorStop(0.35, "#010610"); bg.addColorStop(0.7, "#000408"); bg.addColorStop(1, "#000205");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      NEBS.forEach(n => {
        n.phase += n.spd * dt * 60; const nx = (n.x + Math.sin(n.phase) * 0.015 + (mx - 0.5) * 0.03) * W; const ny = (n.y + Math.cos(n.phase * 0.7) * 0.01 + (my - 0.5) * 0.02) * H; const prl = 1 + scrollBoost * 0.04;
        ctx.save(); const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.rx * W * prl); ng.addColorStop(0, `rgba(${n.col},${n.a * 2.2})`); ng.addColorStop(0.4, `rgba(${n.col},${n.a})`); ng.addColorStop(1, "transparent"); ctx.translate(nx, ny); ctx.scale(1, n.ry / n.rx); ctx.beginPath(); ctx.arc(0, 0, n.rx * W * prl, 0, Math.PI * 2); ctx.fillStyle = ng; ctx.fill(); ctx.restore();
      });
      drawLightRays(t); drawBlackHole(t); drawPlanet(t);
      [starsDeep, starsMid, starsNear].forEach(layer => {
        layer.forEach(st => {
          st.tp += dt * st.ts; const twinkle = 0.55 + 0.45 * Math.sin(st.tp); const sx = ((st.x + (mx - 0.5) * -st.parallax + scrollY * st.parallax * 0.001) % 1 + 1) % 1; const sy = (st.y + scrollBoost * st.parallax * 8 * dt) % 1; st.y = sy;
          if (scrollBoost > 0.1) {
            const strLen = st.r * 4 + scrollBoost * st.r * 30; const ang2 = Math.atan2(sy * H - H * 0.5, sx * W - W * 0.5); ctx.save(); ctx.translate(sx * W, sy * H); const sg = ctx.createLinearGradient(-Math.cos(ang2) * strLen, -Math.sin(ang2) * strLen, 0, 0); sg.addColorStop(0, "transparent"); sg.addColorStop(1, `rgba(${st.col},${st.a * twinkle})`); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang2) * strLen * 0.3, Math.sin(ang2) * strLen * 0.3); ctx.strokeStyle = `rgba(${st.col},${st.a * twinkle})`; ctx.lineWidth = st.r * 0.6; ctx.stroke(); ctx.restore();
          } else {
            ctx.beginPath(); ctx.arc(sx * W, sy * H, st.r * twinkle, 0, Math.PI * 2); ctx.fillStyle = `rgba(${st.col},${st.a * twinkle})`; ctx.fill();
          }
        });
      });
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]; m.life += dt; m.x += m.vx * dt * 60; m.y += m.vy * dt * 60; const lp = m.life / m.maxLife; m.alpha = lp < 0.15 ? lp / 0.15 : lp > 0.7 ? (1 - (lp - 0.7) / 0.3) : 1; const ang3 = Math.atan2(m.vy, m.vx); const mg = ctx.createLinearGradient(m.x, m.y, m.x - Math.cos(ang3) * m.len, m.y - Math.sin(ang3) * m.len); mg.addColorStop(0, `rgba(${m.col},${m.alpha * 0.95})`); mg.addColorStop(0.3, `rgba(${m.col},${m.alpha * 0.4})`); mg.addColorStop(1, "transparent"); ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - Math.cos(ang3) * m.len, m.y - Math.sin(ang3) * m.len); ctx.strokeStyle = mg; ctx.lineWidth = 1.8 + m.alpha * 1.2; ctx.stroke(); const mhg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 5); mhg.addColorStop(0, `rgba(255,255,255,${m.alpha * 0.9})`); mhg.addColorStop(1, "transparent"); ctx.beginPath(); ctx.arc(m.x, m.y, 5, 0, Math.PI * 2); ctx.fillStyle = mhg; ctx.fill(); if (m.life >= m.maxLife) meteors.splice(i, 1);
      }
      const dustT = t * 0.2;
      for (let i = 0; i < 55; i++) {
        const dx = ((Math.sin(i * 2.3 + dustT) * 0.5 + 0.5 + (mx - 0.5) * 0.04) % 1 + 1) % 1; const dy = ((Math.cos(i * 1.7 + dustT * 0.8) * 0.5 + 0.5 + scrollBoost * 0.1) % 1 + 1) % 1; const da = 0.06 + 0.04 * Math.sin(i + t); const dr = 0.5 + 0.5 * Math.abs(Math.sin(i * 0.5)); ctx.beginPath(); ctx.arc(dx * W, dy * H, dr, 0, Math.PI * 2); ctx.fillStyle = i % 3 === 0 ? `rgba(168,85,247,${da})` : `rgba(0,200,255,${da * 0.7})`; ctx.fill();
      }
      drawEParts(dt);
      const sz2 = Math.min(W, H) * 0.13 * ship.scale; drawShip(ship.x * W, ship.y * H, sz2, t, ship.roll * 0.18, ship.pitch * 0.12, 0);
      const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.3, W * 0.5, H * 0.5, Math.max(W, H) * 0.75); vig.addColorStop(0, "transparent"); vig.addColorStop(0.7, "rgba(0,0,8,0.18)"); vig.addColorStop(1, "rgba(0,0,16,0.72)"); ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
      const scanY = (t * 80) % H; const scanG = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2); scanG.addColorStop(0, "transparent"); scanG.addColorStop(0.5, "rgba(0,200,255,0.025)"); scanG.addColorStop(1, "transparent"); ctx.fillStyle = scanG; ctx.fillRect(0, scanY - 2, W, 4);
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
