import React, { useState, useEffect, useRef } from "react";
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
  useEffect(() => { spring.set(value); }, [value, spring]);
  useEffect(() => spring.on("change", (v) => setDisplay(Math.round(v))), [spring]);
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
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80 }}
      whileHover={{ y: -4, boxShadow: `0 12px 36px ${accent}28` }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{
        background: `${COLORS.paper}e8`,
        border: `1.5px solid ${COLORS.border}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 14,
        padding: "18px 20px 14px",
        position: "relative",
        backdropFilter: "blur(4px)",
        cursor: "default",
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
    </motion.div>
  );
}
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
        justifyContent: "space-between",
        padding: "14px 32px",
      }}
    >
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: COLORS.inkLight, fontStyle: "italic" }}>
        ☀️ Good luck, Arun — every application is a brushstroke.
      </div>
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.94 }}
        onClick={onAdd}
        style={{
          background: COLORS.rose,
          border: "none",
          borderRadius: 12,
          padding: "9px 20px",
          cursor: "pointer",
          fontFamily: "'Caveat', cursive",
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "#fff",
          boxShadow: `0 4px 18px ${COLORS.rose}44`,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        + Add Job
      </motion.button>
    </motion.nav>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────
function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      style={{
        padding: "48px 40px 32px",
        position: "relative",
      }}
    >
      <InkSplatter x={-10} y={10} r={3} color={COLORS.rose} opacity={0.4} />
      <InkSplatter x={340} y={-5} r={2} color={COLORS.teal} opacity={0.35} />
      <h1
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
          fontWeight: 700,
          color: COLORS.ink,
          lineHeight: 1.15,
          margin: 0,
        }}
      >
        My Job Hunt
        <br />
        <span style={{ color: COLORS.rose }}>Journal</span>
      </h1>
      <p
        style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          color: COLORS.inkLight,
          fontSize: "1rem",
          marginTop: 10,
          maxWidth: 420,
        }}
      >
        Every company is a new page. Keep painting the picture.
      </p>
      {/* hand-drawn wavy rule */}
      <svg width="280" height="12" viewBox="0 0 280 12" style={{ marginTop: 12 }}>
        <path
          d="M0,6 Q14,2 28,8 T56,6 T84,8 T112,5 T140,8 T168,5 T196,8 T224,5 T252,8 T280,6"
          stroke={COLORS.amber}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: "center", padding: "80px 24px" }}
    >
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ marginBottom: 16 }}>
        <ellipse cx="60" cy="60" rx="50" ry="50" fill={COLORS.teal} opacity="0.12" />
        <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="48">
          🎨
        </text>
      </svg>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.6rem", color: COLORS.ink, fontWeight: 700 }}>
        Your canvas is blank!
      </div>
      <div style={{ color: COLORS.inkLight, fontSize: "0.9rem", marginTop: 6, fontStyle: "italic" }}>
        Add your first job application to start painting your story.
      </div>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        style={{
          marginTop: 20,
          background: COLORS.rose,
          border: "none",
          borderRadius: 12,
          padding: "11px 28px",
          cursor: "pointer",
          fontFamily: "'Caveat', cursive",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "#fff",
          boxShadow: `0 4px 18px ${COLORS.rose}44`,
        }}
      >
        + Add first job
      </motion.button>
    </motion.div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [error, setError] = useState(null);

  // ── Fetch all jobs ──
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/jobs`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
setJobs(data.jobs || data);
    } catch (e) {
      setError("Couldn't connect to the backend. Is Render awake?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  // ── Add job ──
  const handleAdd = async (form) => {
    const body = {
      company: form.company,
      role: form.role,
      status: form.status,
      interview_date: form.interview_date || null,
    };
    await fetch(`${API}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setModalOpen(false);
    fetchJobs();
  };

  // ── Update job ──
  const handleUpdate = async (form) => {
    const body = {
      company: form.company,
      role: form.role,
      status: form.status,
      interview_date: form.interview_date || null,
    };
    await fetch(`${API}/jobs/${editJob.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditJob(null);
    fetchJobs();
  };

  // ── Delete job ──
  const handleDelete = async (id) => {
    await fetch(`${API}/jobs/${id}`, { method: "DELETE" });
    fetchJobs();
  };

  // ── Filter + sort ──
  const visible = jobs
    .filter((j) => {
      const matchFilter = filter === "all" || j.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q || j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "newest") return b.id - a.id;
      if (sort === "oldest") return a.id - b.id;
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
      {/* Watercolor background */}
      <WatercolorCanvas />
      <PaperGrain />

      {/* Layout */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <Sidebar
          jobs={jobs}
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          sort={sort}
          setSort={setSort}
        />

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Navbar onAdd={() => { setEditJob(null); setModalOpen(true); }} />
          <Hero />

          <main style={{ padding: "0 32px 48px", flex: 1 }}>
            {loading ? (
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
                style={{
                  textAlign: "center",
                  padding: 60,
                  fontFamily: "'Caveat', cursive",
                  fontSize: "1.4rem",
                  color: COLORS.inkLight,
                }}
              >
                🎨 Loading your canvas…
              </motion.div>
            ) : error ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 60,
                  color: COLORS.rose,
                  fontFamily: "'Caveat', cursive",
                  fontSize: "1.2rem",
                }}
              >
                ⚠️ {error}
              </div>
            ) : visible.length === 0 ? (
              <EmptyState onAdd={() => { setEditJob(null); setModalOpen(true); }} />
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 20,
                }}
              >
                <AnimatePresence>
                  {visible.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onDelete={handleDelete}
                      onEdit={(j) => { setEditJob(j); setModalOpen(true); }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <JobModal
            job={editJob}
            onClose={() => { setModalOpen(false); setEditJob(null); }}
            onSave={editJob ? handleUpdate : handleAdd}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
