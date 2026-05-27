import React, { useState, useEffect, useRef } from "react";
import * as THREE from 'three';
import { motion, AnimatePresence, useSpring } from "framer-motion";

// ─── Google Fonts injected at runtime ───────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// ─── API base ────────────────────────────────────────────────────────────────
const API = "https://jobtracker-backend-qg6u.onrender.com";

// ─── Watercolor palette ──────────────────────────────────────────────────────
const COLORS = {
  bg: "#fdf6ec",
  paper: "#fef9f2",
  ink: "#2c1e0f",
  inkLight: "#6b4f35",
  rose: "#d4818a",
  teal: "#6aaba0",
  amber: "#d4a85a",
  lavender: "#9b8ec4",
  sage: "#7aab7a",
  peach: "#e8a87c",
  border: "rgba(100,70,40,0.18)",
};

const STATUS_COLORS = {
  applied: COLORS.teal,
  interviewing: COLORS.amber,
  offer: COLORS.sage,
  rejected: COLORS.rose,
  saved: COLORS.lavender,
};

const STATUS_LABELS = ["applied", "interviewing", "offer", "rejected", "saved"];

// ─── Inline styles (no CSS file needed) ────────────────────────────────────
const GS = {
  app: {
    minHeight: "100vh",
    background: COLORS.bg,
    fontFamily: "'Lora', Georgia, serif",
    color: COLORS.ink,
    position: "relative",
    overflowX: "hidden",
  },
};

// ─── Cursor watercolor trail ─────────────────────────────────────────────────
function CursorTrail() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let dots = [];
    const colors = ["#d4818a","#6aaba0","#d4a85a","#9b8ec4","#7aab7a","#e8a87c"];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const onMove = (e) => {
      dots.push({ x: e.clientX, y: e.clientY, r: 4 + Math.random() * 4, color: colors[Math.floor(Math.random() * colors.length)], alpha: 0.18, life: 1 });
      if (dots.length > 40) dots.shift();
    };
    window.addEventListener("mousemove", onMove);
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots = dots.filter(d => d.life > 0.01);
      dots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.globalAlpha = d.alpha * d.life;
        ctx.fill();
        d.life *= 0.88;
        d.r *= 1.04;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 3 }} />;
}

// ─── Ink ripple on click ──────────────────────────────────────────────────────
function InkRipple() {
  const [ripples, setRipples] = useState([]);
  useEffect(() => {
    const onClick = (e) => {
      const id = Date.now() + Math.random(); // Ensure completely unique ID
      const colors = ["#d4818a","#6aaba0","#d4a85a","#9b8ec4","#7aab7a"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      setRipples(r => [...r, { id, x: e.clientX, y: e.clientY, color }]);
      setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 900);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 4 }}>
      {ripples.map(r => (
        <motion.div key={r.id}
          initial={{ width: 0, height: 0, opacity: 0.5, x: r.x, y: r.y }}
          animate={{ width: 120, height: 120, opacity: 0, x: r.x - 60, y: r.y - 60 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ position: "absolute", borderRadius: "50%", border: `2px solid ${r.color}`, background: `${r.color}22` }}
        />
      ))}
    </div>
  );
}

// ─── Paint splatter confetti ──────────────────────────────────────────────────
function PaintSplatter({ trigger }) {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!trigger) return;
    const colors = ["#d4818a","#6aaba0","#d4a85a","#9b8ec4","#7aab7a","#e8a87c","#2c1e0f"];
    const newP = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      x: Math.random() * window.innerWidth,
      y: -20,
      tx: (Math.random() - 0.5) * 300,
      ty: 200 + Math.random() * 300,
      r: 6 + Math.random() * 10,
      rot: Math.random() * 360,
    }));
    setParticles(newP);
    setTimeout(() => setParticles([]), 1400);
  }, [trigger]);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50 }}>
      <AnimatePresence>
        {particles.map(p => (
          <motion.div key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ x: p.x + p.tx, y: p.y + p.ty, opacity: 0, scale: 0.3, rotate: p.rot }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ position: "absolute", width: p.r, height: p.r, borderRadius: "50%", background: p.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── SVG watercolor blobs rendered as background ─────────────────────────────
function WatercolorCanvas() {
  return (
    <svg
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.55,
      }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1440 900"
    >
      <defs>
        <filter id="wc" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.012 0.018"
            numOctaves="4"
            seed="8"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="38"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="wc2" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.016 0.022"
            numOctaves="3"
            seed="14"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="32"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      {/* big top-left rose wash */}
      <ellipse cx="160" cy="140" rx="310" ry="240" fill="#d4818a" opacity="0.28" filter="url(#wc)" />
      {/* top-right teal */}
      <ellipse cx="1280" cy="80" rx="270" ry="200" fill="#6aaba0" opacity="0.22" filter="url(#wc2)" />
      {/* mid-left amber */}
      <ellipse cx="80" cy="500" rx="200" ry="280" fill="#d4a85a" opacity="0.18" filter="url(#wc)" />
      {/* mid-right lavender */}
      <ellipse cx="1380" cy="480" rx="230" ry="300" fill="#9b8ec4" opacity="0.20" filter="url(#wc2)" />
      {/* center sage */}
      <ellipse cx="720" cy="760" rx="400" ry="200" fill="#7aab7a" opacity="0.15" filter="url(#wc)" />
      {/* bottom-left peach */}
      <ellipse cx="320" cy="860" rx="260" ry="140" fill="#e8a87c" opacity="0.20" filter="url(#wc2)" />
      {/* scattered small accents */}
      <ellipse cx="950" cy="220" rx="140" ry="110" fill="#d4818a" opacity="0.14" filter="url(#wc)" />
      <ellipse cx="600" cy="400" rx="180" ry="130" fill="#6aaba0" opacity="0.12" filter="url(#wc2)" />
      <ellipse cx="1100" cy="680" rx="160" ry="120" fill="#d4a85a" opacity="0.16" filter="url(#wc)" />
    </svg>
  );
}

// ─── Paper texture grain overlay ────────────────────────────────────────────
function FloatingOrigami() {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(el.offsetWidth, el.offsetHeight);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, el.offsetWidth / el.offsetHeight, 0.1, 100);
    camera.position.set(0, 0, 10);
    const mouse = { x: 0, y: 0 };
    const onMove = e => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.8));
    const dl = new THREE.DirectionalLight(0xffeedd, 1.2);
    dl.position.set(3, 5, 5);
    scene.add(dl);
    const colors = [0xd4818a, 0x6aaba0, 0xd4a85a, 0x9b8ec4, 0x7aab7a, 0xe8a87c];
    const cards = [];
    for (let i = 0; i < 10; i++) {
      const g = new THREE.Group();
      const c = colors[i % colors.length];
      const mat = new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      g.add(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), mat));
      const cornerShape = new THREE.Shape();
      cornerShape.moveTo(0, 0);
      cornerShape.lineTo(0.4, 0);
      cornerShape.lineTo(0, -0.4);
      cornerShape.closePath();
      const cornerMat = new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const corner = new THREE.Mesh(new THREE.ShapeGeometry(cornerShape), cornerMat);
      corner.position.set(0.4, 0.6, 0.01);
      g.add(corner);
      for (let j = 0; j < 3; j++) {
        const line = new THREE.Mesh(
          new THREE.PlaneGeometry(0.7, 0.02),
          new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
        );
        line.position.set(-0.1, 0.1 - j * 0.28, 0.01);
        g.add(line);
      }
      const angle = (i / 10) * Math.PI * 2;
      const r = 3 + Math.random() * 2;
      g.position.set(
        Math.cos(angle) * r,
        Math.sin(angle) * r * 0.5 + (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 4
      );
      g.rotation.set(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.8
      );
      scene.add(g);
      cards.push({
        mesh: g,
        speed: 0.003 + Math.random() * 0.004,
        phase: Math.random() * Math.PI * 2,
        amp: 0.2 + Math.random() * 0.2,
        rotS: (Math.random() - 0.5) * 0.005,
        baseY: g.position.y,
        baseX: g.position.x
      });
    }
    let t = 0, raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      t++;
      cards.forEach(card => {
        card.mesh.position.y = card.baseY + Math.sin(t * card.speed + card.phase) * card.amp;
        card.mesh.position.x = card.baseX + Math.cos(t * card.speed * 0.7 + card.phase) * card.amp * 0.4;
        card.mesh.rotation.z += card.rotS;
        card.mesh.rotation.y += card.rotS * 0.5;
      });
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.03;
      camera.position.y += (mouse.y - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);
  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}

function PaperGrain() {
  return (
    <svg
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        opacity: 0.06,
        mixBlendMode: "multiply",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

// ─── Ink splatter decorations ────────────────────────────────────────────────
function InkSplatter({ x, y, r = 4, color = COLORS.inkLight, opacity = 0.3 }) {
  return (
    <svg
      style={{ position: "absolute", left: x, top: y, pointerEvents: "none", zIndex: 2 }}
      width={r * 6}
      height={r * 6}
      viewBox={`0 0 ${r * 6} ${r * 6}`}
    >
      <circle cx={r * 3} cy={r * 3} r={r} fill={color} opacity={opacity} />
      {[0, 60, 130, 200, 280, 340].map((deg, i) => (
        <line
          key={i}
          x1={r * 3}
          y1={r * 3}
          x2={r * 3 + Math.cos((deg * Math.PI) / 180) * r * (1.8 + (i % 3) * 0.6)}
          y2={r * 3 + Math.sin((deg * Math.PI) / 180) * r * (1.8 + (i % 3) * 0.6)}
          stroke={color}
          strokeWidth={0.8}
          opacity={opacity * 0.7}
        />
      ))}
    </svg>
  );
}

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState(0);
  
  useEffect(() => { 
    spring.set(value); 
  }, [value, spring]);
  
  useEffect(() => {
    // Return the unsubscribe function properly
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return <span>{display}</span>;
}

// ─── Countdown ───────────────────────────────────────────────────────────────
function Countdown({ date }) {
  const [days, setDays] = useState(null);
  useEffect(() => {
    if (!date) return;
    const diff = Math.ceil((new Date(date) - Date.now()) / 86400000);
    setDays(diff);
  }, [date]);
  if (days === null) return null;
  const color = days < 0 ? COLORS.rose : days <= 3 ? COLORS.amber : COLORS.teal;
  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontFamily: "'Caveat', cursive",
        color,
        fontWeight: 600,
        marginLeft: 6,
      }}
    >
      {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? "Today!" : `${days}d away`}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || COLORS.inkLight;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        border: `1.5px solid ${color}`,
        color,
        fontSize: "0.72rem",
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        letterSpacing: "0.04em",
        background: `${color}18`,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
const PROGRESS_MAP = { saved: 10, applied: 30, interviewing: 60, offer: 100, rejected: 100 };
function ProgressBar({ status }) {
  const pct = PROGRESS_MAP[status] || 0;
  const color = STATUS_COLORS[status] || COLORS.teal;
  return (
    <div
      style={{
        height: 5,
        borderRadius: 99,
        background: `${color}28`,
        marginTop: 8,
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ height: "100%", borderRadius: 99, background: color }}
      />
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onDelete, onEdit }) {
  const accent = STATUS_COLORS[job.status] || COLORS.teal;
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{ perspective: 1000, cursor: "default" }}
      onHoverStart={() => setFlipped(true)}
      onHoverEnd={() => setFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 8 : 0, y: flipped ? -4 : 0, boxShadow: flipped ? `0 18px 40px ${accent}35` : `0 2px 8px ${accent}15` }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{
          background: `${COLORS.paper}e8`,
          border: `1.5px solid ${COLORS.border}`,
          borderLeft: `4px solid ${accent}`,
          borderRadius: 14,
          padding: "18px 20px 14px",
          position: "relative",
          backdropFilter: "blur(4px)",
          transformStyle: "preserve-3d",
        }}
      >
      {/* torn paper top edge decoration */}
      <svg
        style={{ position: "absolute", top: -1, left: 0, width: "100%", pointerEvents: "none" }}
        height="8"
        viewBox="0 0 300 8"
        preserveAspectRatio="none"
      >
        <path
          d="M0,8 Q15,2 30,6 T60,4 T90,7 T120,3 T150,6 T180,2 T210,7 T240,4 T270,6 T300,3 L300,8 Z"
          fill={COLORS.paper}
          opacity="0.9"
        />
      </svg>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "1.35rem",
              fontWeight: 700,
              color: COLORS.ink,
              lineHeight: 1.2,
            }}
          >
            {job.company}
          </div>
          <div style={{ fontSize: "0.88rem", color: COLORS.inkLight, fontStyle: "italic", marginTop: 2 }}>
            {job.role}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(job)}
            style={btnStyle(COLORS.teal)}
            title="Edit"
          >
            ✏️
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(job.id)}
            style={btnStyle(COLORS.rose)}
            title="Delete"
          >
            🗑️
          </motion.button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", marginTop: 10, gap: 8, flexWrap: "wrap" }}>
        <StatusBadge status={job.status} />
        {job.interview_date && (
          <span style={{ fontSize: "0.78rem", color: COLORS.inkLight }}>
            📅 {new Date(job.interview_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            <Countdown date={job.interview_date} />
          </span>
        )}
      </div>

      <ProgressBar status={job.status} />
      {job.interview_date && (
        <motion.a
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Interview+at+${encodeURIComponent(job.company)}&details=Role:+${encodeURIComponent(job.role)}&dates=${job.interview_date.replace(/-/g, "")}T090000Z/${job.interview_date.replace(/-/g, "")}T100000Z`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 10,
            padding: "5px 14px",
            borderRadius: 8,
            background: `${COLORS.teal}18`,
            border: `1.2px solid ${COLORS.teal}`,
            color: COLORS.teal,
            fontFamily: "'Caveat', cursive",
            fontSize: "0.88rem",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          📅 Add to Google Calendar
        </motion.a>
      )}
      </motion.div>
    </motion.div>
  );
}

// ─── Button Style Helper ─────────────────────────────────────────────────────
function btnStyle(color) {
  return {
    background: `${color}18`,
    border: `1px solid ${color}44`,
    borderRadius: 8,
    padding: "3px 7px",
    cursor: "pointer",
    fontSize: "0.85rem",
    lineHeight: 1,
  };
}

// ─── Modal (Add / Edit) ───────────────────────────────────────────────────────
function JobModal({ job, onClose, onSave }) {
  const blank = { company: "", role: "", status: "applied", interview_date: "" };
  const [form, setForm] = useState(job || blank);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: `1.5px solid ${COLORS.border}`,
    background: `${COLORS.bg}cc`,
    fontFamily: "'Lora', serif",
    fontSize: "0.92rem",
    color: COLORS.ink,
    outline: "none",
    boxSizing: "border-box",
    marginTop: 4,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(44,30,15,0.45)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.88, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        style={{
          background: COLORS.paper,
          borderRadius: 18,
          padding: "32px 28px 24px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 80px rgba(44,30,15,0.22)",
          border: `1.5px solid ${COLORS.border}`,
          position: "relative",
        }}
      >
        {/* decorative ink line at top */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", pointerEvents: "none" }} height="5">
          <line x1="0" y1="4" x2="100%" y2="4" stroke={COLORS.rose} strokeWidth="2.5" strokeDasharray="6 4" />
        </svg>

        <h2
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "1.7rem",
            fontWeight: 700,
            color: COLORS.ink,
            margin: "0 0 22px",
          }}
        >
          {job ? "✏️ Edit Application" : "📝 New Application"}
        </h2>

        {[
          { label: "Company", key: "company", placeholder: "e.g. Zoho, Freshworks…" },
          { label: "Role", key: "role", placeholder: "e.g. Frontend Developer" },
        ].map(({ label, key, placeholder }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: "0.8rem", color: COLORS.inkLight, fontFamily: "'Caveat', cursive", fontWeight: 600 }}>
              {label}
            </label>
            <input
              style={inputStyle}
              value={form[key]}
              placeholder={placeholder}
              onChange={(e) => set(key, e.target.value)}
            />
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: "0.8rem", color: COLORS.inkLight, fontFamily: "'Caveat', cursive", fontWeight: 600 }}>
            Status
          </label>
          <select style={inputStyle} value={form.status} onChange={(e) => set("status", e.target.value)}>
            {STATUS_LABELS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: "0.8rem", color: COLORS.inkLight, fontFamily: "'Caveat', cursive", fontWeight: 600 }}>
            Interview Date (optional)
          </label>
          <input
            type="date"
            style={inputStyle}
            value={form.interview_date || ""}
            onChange={(e) => set("interview_date", e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: `1.5px solid ${COLORS.border}`,
              background: "transparent",
              cursor: "pointer",
              fontFamily: "'Caveat', cursive",
              fontSize: "1rem",
              color: COLORS.inkLight,
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSave(form)}
            style={{
              padding: "9px 24px",
              borderRadius: 10,
              border: "none",
              background: COLORS.teal,
              cursor: "pointer",
              fontFamily: "'Caveat', cursive",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#fff",
              boxShadow: `0 4px 16px ${COLORS.teal}44`,
            }}
          >
            {job ? "Save Changes" : "Add Job"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ jobs, search, setSearch, filter, setFilter, sort, setSort }) {
  const total = jobs.length;
  const counts = STATUS_LABELS.reduce((acc, s) => {
    acc[s] = jobs.filter((j) => j.status === s).length;
    return acc;
  }, {});
  const offered = counts.offer || 0;
  const successRate = total > 0 ? Math.round((offered / total) * 100) : 0;

  const statEmoji = { applied: "📬", interviewing: "🗓️", offer: "🎉", rejected: "❌", saved: "🔖" };

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 24, delay: 0.1 }}
      style={{
        width: 240,
        minHeight: "100vh",
        background: `${COLORS.paper}cc`,
        borderRight: `1.5px solid ${COLORS.border}`,
        backdropFilter: "blur(8px)",
        padding: "32px 18px 24px",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        gap: 28,
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div>
        <div
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "1.7rem",
            fontWeight: 700,
            color: COLORS.ink,
            lineHeight: 1.1,
          }}
        >
          Job<br />
          <span style={{ color: COLORS.rose }}>Tracker</span>
        </div>
        <div style={{ fontSize: "0.72rem", color: COLORS.inkLight, marginTop: 2, fontStyle: "italic" }}>
          Arun's job hunt journal
        </div>
        {/* hand-drawn underline */}
        <svg width="90" height="8" viewBox="0 0 90 8" style={{ marginTop: 4 }}>
          <path d="M2,6 Q20,2 40,5 T88,4" stroke={COLORS.rose} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* Search */}
      <div>
        <input
          placeholder="🔍 Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "7px 10px",
            borderRadius: 10,
            border: `1.5px solid ${COLORS.border}`,
            background: `${COLORS.bg}bb`,
            fontFamily: "'Lora', serif",
            fontSize: "0.83rem",
            color: COLORS.ink,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Filter */}
      <div>
        <div style={{ fontSize: "0.72rem", fontFamily: "'Caveat', cursive", color: COLORS.inkLight, marginBottom: 6, fontWeight: 600 }}>
          Filter by status
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {["all", ...STATUS_LABELS].map((s) => (
            <motion.button
              key={s}
              whileHover={{ x: 4 }}
              onClick={() => setFilter(s)}
              style={{
                background: filter === s ? `${STATUS_COLORS[s] || COLORS.teal}22` : "transparent",
                border: `1.2px solid ${filter === s ? (STATUS_COLORS[s] || COLORS.teal) : "transparent"}`,
                borderRadius: 8,
                padding: "5px 10px",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "'Caveat', cursive",
                fontSize: "0.92rem",
                color: filter === s ? (STATUS_COLORS[s] || COLORS.teal) : COLORS.inkLight,
                fontWeight: filter === s ? 700 : 400,
              }}
            >
              {statEmoji[s] || "📋"} {s.charAt(0).toUpperCase() + s.slice(1)} {s !== "all" ? `(${counts[s] || 0})` : `(${total})`}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <div style={{ fontSize: "0.72rem", fontFamily: "'Caveat', cursive", color: COLORS.inkLight, marginBottom: 4, fontWeight: 600 }}>
          Sort
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 8,
            border: `1.2px solid ${COLORS.border}`,
            background: `${COLORS.bg}bb`,
            fontFamily: "'Lora', serif",
            fontSize: "0.82rem",
            color: COLORS.ink,
            outline: "none",
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="company">Company A–Z</option>
          <option value="interview">Interview date</option>
        </select>
      </div>

      {/* Stats */}
      <div
        style={{
          marginTop: "auto",
          background: `${COLORS.amber}14`,
          border: `1.2px dashed ${COLORS.amber}66`,
          borderRadius: 12,
          padding: "14px 12px",
        }}
      >
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.85rem", color: COLORS.inkLight, marginBottom: 8 }}>
          📊 Quick stats
        </div>
        <div style={{ fontSize: "2rem", fontFamily: "'Caveat', cursive", fontWeight: 700, color: COLORS.ink, lineHeight: 1 }}>
          <AnimatedNumber value={total} />
        </div>
        <div style={{ fontSize: "0.75rem", color: COLORS.inkLight, marginBottom: 8 }}>total applications</div>
        <div style={{ fontSize: "1.1rem", fontFamily: "'Caveat', cursive", fontWeight: 700, color: COLORS.sage }}>
          <AnimatedNumber value={successRate} />% 🎉
        </div>
        <div style={{ fontSize: "0.72rem", color: COLORS.inkLight }}>offer rate</div>
      </div>
    </motion.aside>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onAdd }) {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: `${COLORS.paper}d0`,
        backdropFilter: "blur(12px)",
        borderBottom: `1.5px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        padding: "16px 32px",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem", fontWeight: 700, color: COLORS.ink }}>
        Your Applications
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        style={{
          background: COLORS.teal,
          color: "#fff",
          border: "none",
          padding: "8px 20px",
          borderRadius: 99,
          fontFamily: "'Caveat', cursive",
          fontSize: "1.1rem",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: `0 4px 12px ${COLORS.teal}55`,
        }}
      >
        ➕ Add New
      </motion.button>
    </motion.nav>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API}/jobs`);
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  const handleSave = async (job) => {
    const isEdit = !!job.id;
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `${API}/jobs/${job.id}` : `${API}/jobs`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });
      if (res.ok) {
        // Trigger confetti if a new offer is received
        if (job.status === "offer" && (!isEdit || modalData?.status !== "offer")) {
          setConfetti(true);
          setTimeout(() => setConfetti(false), 2000);
        }
        fetchJobs();
        setShowModal(false);
      }
    } catch (err) {
      console.error("Failed to save job", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/jobs/${id}`, { method: "DELETE" });
      fetchJobs();
    } catch (err) {
      console.error("Failed to delete job", err);
    }
  };

  const filteredJobs = jobs
    .filter((j) => filter === "all" || j.status === filter)
    .filter((j) => 
      j.company.toLowerCase().includes(search.toLowerCase()) || 
      j.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Adjusted ID logic to safeguard against UUIDs/string IDs resulting in NaN
      if (sort === "newest") {
        const numA = Number(a.id);
        const numB = Number(b.id);
        if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
        return String(b.id || "").localeCompare(String(a.id || ""));
      }
      if (sort === "oldest") {
        const numA = Number(a.id);
        const numB = Number(b.id);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return String(a.id || "").localeCompare(String(b.id || ""));
      }
      if (sort === "company") return a.company.localeCompare(b.company);
      if (sort === "interview") {
        if (!a.interview_date) return 1;
        if (!b.interview_date) return -1;
        return new Date(a.interview_date) - new Date(b.interview_date);
      }
      return 0;
    });

  return (
    <div style={GS.app}>
      {/* Background Effects */}
      <CursorTrail />
      <InkRipple />
      <PaintSplatter trigger={confetti} />
      <FloatingOrigami />
      <WatercolorCanvas />
      <PaperGrain />

      <div style={{ display: "flex", position: "relative", zIndex: 10 }}>
        <Sidebar 
          jobs={jobs} 
          search={search} setSearch={setSearch} 
          filter={filter} setFilter={setFilter} 
          sort={sort} setSort={setSort} 
        />
        
        <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
          <Navbar onAdd={() => { setModalData(null); setShowModal(true); }} />
          
          <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
            <motion.div 
              layout
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 24,
              }}
            >
              <AnimatePresence>
                {filteredJobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onDelete={handleDelete} 
                    onEdit={(j) => { setModalData(j); setShowModal(true); }} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>
            
            {filteredJobs.length === 0 && (
              <div style={{ 
                textAlign: "center", 
                marginTop: 80, 
                color: COLORS.inkLight, 
                fontFamily: "'Caveat', cursive", 
                fontSize: "1.6rem" 
              }}>
                No jobs found... Time to apply? 🖌️
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showModal && (
          <JobModal 
            job={modalData} 
            onClose={() => setShowModal(false)} 
            onSave={handleSave} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
