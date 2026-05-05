import { useState, useEffect, useRef } from "react";
import video from "./video.mp4";
import music from "./music.mp3";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const timer = setInterval(() => {
      start += 1; setDisplay(start);
      if (start === value) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

function ProgressBar({ status }) {
  const percent = { Applied: 25, Interview: 60, Offer: 100, Rejected: 100 }[status];
  const color = status === "Rejected" ? "#e76f51" : status === "Offer" ? "#2a9d8f" : "linear-gradient(90deg,#48cae4,#0096c7)";
  return (
    <div style={{ position:"relative", width:"100%", background:"rgba(255,255,255,0.15)", borderRadius:"99px", height:"6px", overflow:"hidden" }}>
      <div style={{ width:`${percent}%`, height:"100%", background:color, borderRadius:"99px", transition:"width 1.2s cubic-bezier(.4,0,.2,1)", boxShadow: status==="Offer" ? "0 0 10px rgba(42,157,143,0.8)" : "0 0 8px rgba(72,202,228,0.6)" }} />
    </div>
  );
}

const STATUS = {
  Applied:   { color:"#0096c7", bg:"rgba(0,150,199,0.15)",  border:"rgba(0,150,199,0.4)",   glow:"rgba(0,150,199,0.15)"   },
  Interview: { color:"#f4a261", bg:"rgba(244,162,97,0.15)", border:"rgba(244,162,97,0.4)",   glow:"rgba(244,162,97,0.15)"  },
  Offer:     { color:"#2a9d8f", bg:"rgba(42,157,143,0.15)", border:"rgba(42,157,143,0.4)",   glow:"rgba(42,157,143,0.15)"  },
  Rejected:  { color:"#e76f51", bg:"rgba(231,111,81,0.15)", border:"rgba(231,111,81,0.4)",   glow:"rgba(231,111,81,0.15)"  },
};

const FILTERS = ["All", "Applied", "Interview", "Offer", "Rejected"];

export default function App() {
  const [jobs, setJobs]               = useState([]);
  const [company, setCompany]         = useState("");
  const [role, setRole]               = useState("");
  const [status, setStatus]           = useState("Applied");
  const [flash, setFlash]             = useState(null);
  const [filter, setFilter]           = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch]           = useState("");
  const [sortBy, setSortBy]           = useState("newest");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isPlaying, setIsPlaying]     = useState(false);
  const [volume, setVolume]           = useState(0.5);
  const audioRef = useRef(null);
  const jobsRef  = useRef(null);
  const addRef   = useRef(null);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    const r = await fetch("http://localhost:8000/jobs");
    const d = await r.json();
    setJobs(d.jobs);
  };

  const addJob = async () => {
    if (!company || !role) return;
    const r = await fetch("http://localhost:8000/jobs", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ company, role, status }),
    });
    const d = await r.json();
    setFlash(d.job.id);
    setTimeout(() => setFlash(null), 1500);
    setCompany(""); setRole(""); setStatus("Applied");
    fetchJobs();
    jobsRef.current?.scrollIntoView({ behavior:"smooth" });
  };

  const deleteJob = async (id) => {
    await fetch(`http://localhost:8000/jobs/${id}`, { method:"DELETE" });
    fetchJobs();
  };

  const updateStatus = async (job, s) => {
    await fetch(`http://localhost:8000/jobs/${job.id}`, {
      method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ company:job.company, role:job.role, status:s }),
    });
    fetchJobs();
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); }
    else { audioRef.current.volume = volume; audioRef.current.play(); }
    setIsPlaying(p => !p);
  };

  const stats = [
    { label:"TOTAL",      value:jobs.length,                                       key:"All"       },
    { label:"APPLIED",    value:jobs.filter(j=>j.status==="Applied").length,   key:"Applied"   },
    { label:"INTERVIEWS", value:jobs.filter(j=>j.status==="Interview").length, key:"Interview" },
    { label:"OFFERS",     value:jobs.filter(j=>j.status==="Offer").length,     key:"Offer"     },
    { label:"REJECTED",   value:jobs.filter(j=>j.status==="Rejected").length,  key:"Rejected"  },
  ];

  const successRate = jobs.length > 0
    ? Math.round((jobs.filter(j=>j.status==="Offer").length / jobs.length) * 100) : 0;

  let displayed = filter==="All" ? [...jobs] : jobs.filter(j=>j.status===filter);
  if (search) displayed = displayed.filter(j =>
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.role.toLowerCase().includes(search.toLowerCase())
  );
  if (sortBy==="newest")  displayed = displayed.reverse();
  if (sortBy==="company") displayed = displayed.sort((a,b)=>a.company.localeCompare(b.company));
  if (sortBy==="status")  displayed = displayed.sort((a,b)=>a.status.localeCompare(b.status));

  const scrollTo = (ref, section) => {
    ref?.current?.scrollIntoView({ behavior:"smooth" });
    setActiveSection(section);
  };

  const navItems = [
    { id:"dashboard",    label:"DASHBOARD",   ref:null    },
    { id:"add",          label:"ADD NEW",      ref:addRef  },
    { id:"applications", label:"APPLICATIONS", ref:jobsRef },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#c8e8f5 0%,#ddf0f8 50%,#c0e4f2 100%)", color:"#03045e", fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", display:"flex", flexDirection:"column" }}>

      <style>{`
        @keyframes fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes slideIn   { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes glow      { 0%,100%{box-shadow:0 0 20px rgba(0,150,199,0.3)} 50%{box-shadow:0 0 40px rgba(0,150,199,0.6)} }
        @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes bars      { 0%,100%{height:8px} 50%{height:20px} }

        .glass {
          background: rgba(255,255,255,0.25) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255,255,255,0.5) !important;
          box-shadow: 0 8px 32px rgba(0,150,199,0.12), inset 0 1px 0 rgba(255,255,255,0.6) !important;
        }
        .glass-dark {
          background: rgba(255,255,255,0.12) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          border: 1px solid rgba(255,255,255,0.25) !important;
          box-shadow: 0 8px 32px rgba(0,150,199,0.1), inset 0 1px 0 rgba(255,255,255,0.3) !important;
        }
        .nav-item:hover  { background:rgba(0,150,199,0.12)!important; color:#0096c7!important; transform:translateX(4px)!important; }
        .job-card:hover  { transform:translateY(-4px) scale(1.005)!important; box-shadow:0 24px 60px rgba(0,150,199,0.18)!important; }
        .stat-pill:hover { transform:translateX(4px) scale(1.02)!important; }
        .del-btn:hover   { background:rgba(231,111,81,0.15)!important; border-color:#e76f51!important; color:#e76f51!important; }
        .add-btn:hover   { transform:translateY(-2px) scale(1.03)!important; box-shadow:0 12px 40px rgba(0,150,199,0.5)!important; }
        .filter-chip:hover { transform:translateX(4px)!important; }
        .play-btn:hover  { transform:scale(1.1)!important; box-shadow:0 8px 24px rgba(0,150,199,0.5)!important; }
        input::placeholder { color:rgba(3,4,94,0.3); }
        select option    { background:#e8f4f8; color:#03045e; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(0,150,199,0.3); border-radius:99px; }
        .bar1 { animation: bars 0.8s ease-in-out infinite; }
        .bar2 { animation: bars 0.8s ease-in-out 0.15s infinite; }
        .bar3 { animation: bars 0.8s ease-in-out 0.3s infinite; }
      `}</style>

      {/* ── Topbar ── */}
      <nav className="glass" style={{ position:"sticky", top:0, zIndex:99, padding:"14px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <button onClick={() => setSidebarOpen(p=>!p)}
            style={{ background:"rgba(0,150,199,0.1)", border:"1px solid rgba(0,150,199,0.25)", borderRadius:"10px", color:"#0096c7", width:"38px", height:"38px", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.3s", backdropFilter:"blur(8px)" }}>
            {sidebarOpen ? "✕" : "☰"}
          </button>
          <span style={{ fontSize:"12px", fontWeight:"900", letterSpacing:"7px", color:"#03045e", textShadow:"0 1px 2px rgba(255,255,255,0.8)" }}>CAREER TRACKER</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <div style={{ fontSize:"10px", letterSpacing:"3px", color:"#0096c7", background:"rgba(0,150,199,0.1)", padding:"6px 16px", borderRadius:"99px", border:"1px solid rgba(0,150,199,0.25)", backdropFilter:"blur(8px)", fontWeight:"700" }}>
            SUCCESS {successRate}%
          </div>
          {["Applied","Interview","Offer","Rejected"].map(s => (
            <span key={s} style={{ fontSize:"9px", letterSpacing:"2px", padding:"5px 12px", borderRadius:"99px", background:STATUS[s].bg, color:STATUS[s].color, border:`1px solid ${STATUS[s].border}`, backdropFilter:"blur(8px)", fontWeight:"700" }}>{s.toUpperCase()}</span>
          ))}
        </div>
      </nav>

      <div style={{ display:"flex", flex:1 }}>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside style={{ width:"260px", background:"rgba(255,255,255,0.2)", backdropFilter:"blur(32px)", WebkitBackdropFilter:"blur(32px)", borderRight:"1px solid rgba(255,255,255,0.4)", display:"flex", flexDirection:"column", position:"sticky", top:"57px", height:"calc(100vh - 57px)", overflowY:"auto", animation:"slideIn 0.35s cubic-bezier(.4,0,.2,1)", boxShadow:"4px 0 32px rgba(0,150,199,0.08), inset -1px 0 0 rgba(255,255,255,0.5)" }}>

            {/* Nav */}
            <div style={{ padding:"28px 16px 20px", borderBottom:"1px solid rgba(255,255,255,0.4)" }}>
              <p style={{ fontSize:"8px", letterSpacing:"4px", color:"#5baed6", margin:"0 0 10px 8px", fontWeight:"700" }}>NAVIGATE</p>
              {navItems.map((item,i) => (
                <button key={item.id} className="nav-item"
                  onClick={() => item.ref ? scrollTo(item.ref, item.id) : setActiveSection("dashboard")}
                  style={{ width:"100%", background: activeSection===item.id ? "rgba(0,150,199,0.12)" : "transparent", border:"none", borderRadius:"12px", color: activeSection===item.id ? "#0096c7" : "#4a7a99", padding:"12px 16px", fontSize:"10px", fontWeight: activeSection===item.id ? "800":"400", letterSpacing:"3px", cursor:"pointer", textAlign:"left", marginBottom:"4px", transition:"all 0.25s cubic-bezier(.4,0,.2,1)", borderLeft: activeSection===item.id ? "3px solid #0096c7" : "3px solid transparent", animation:`fadeUp 0.4s ease ${i*0.08}s both` }}>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ padding:"20px 16px", borderBottom:"1px solid rgba(255,255,255,0.4)" }}>
              <p style={{ fontSize:"8px", letterSpacing:"4px", color:"#5baed6", margin:"0 0 10px 4px", fontWeight:"700" }}>SEARCH</p>
              <input placeholder="Company or role..."
                value={search} onChange={e=>setSearch(e.target.value)}
                style={{ width:"100%", background:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.7)", borderRadius:"12px", color:"#03045e", padding:"10px 14px", fontSize:"12px", outline:"none", boxSizing:"border-box", backdropFilter:"blur(8px)", boxShadow:"inset 0 2px 4px rgba(0,150,199,0.06)" }} />
            </div>

            {/* Quick Stats */}
            <div style={{ padding:"20px 16px", borderBottom:"1px solid rgba(255,255,255,0.4)" }}>
              <p style={{ fontSize:"8px", letterSpacing:"4px", color:"#5baed6", margin:"0 0 12px 4px", fontWeight:"700" }}>QUICK STATS</p>
              {stats.map((s,i) => (
                <div key={s.label} className="stat-pill"
                  onClick={() => { setFilter(s.key); scrollTo(jobsRef,"applications"); }}
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:"12px", marginBottom:"5px", background: filter===s.key ? "rgba(0,150,199,0.12)" : "rgba(255,255,255,0.3)", border: filter===s.key ? "1px solid rgba(0,150,199,0.3)" : "1px solid rgba(255,255,255,0.5)", cursor:"pointer", transition:"all 0.25s cubic-bezier(.4,0,.2,1)", backdropFilter:"blur(8px)", animation:`fadeUp 0.4s ease ${i*0.06}s both` }}>
                  <span style={{ fontSize:"9px", letterSpacing:"2px", color: i===0 ? "#0096c7" : "#4a7a99", fontWeight: i===0 ? "700":"400" }}>{s.label}</span>
                  <span style={{ fontSize:"22px", fontWeight:"900", color: i===0 ? "#0096c7" : "#03045e" }}>
                    <AnimatedNumber value={s.value} />
                  </span>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div style={{ padding:"20px 16px", borderBottom:"1px solid rgba(255,255,255,0.4)" }}>
              <p style={{ fontSize:"8px", letterSpacing:"4px", color:"#5baed6", margin:"0 0 12px 4px", fontWeight:"700" }}>FILTER</p>
              {FILTERS.map((f,i) => (
                <button key={f} className="filter-chip"
                  onClick={() => { setFilter(f); scrollTo(jobsRef,"applications"); }}
                  style={{ width:"100%", background: filter===f ? (f==="All"?"rgba(0,150,199,0.12)":STATUS[f]?.bg) : "rgba(255,255,255,0.25)", border: filter===f ? `1px solid ${f==="All"?"rgba(0,150,199,0.4)":STATUS[f]?.border}` : "1px solid rgba(255,255,255,0.5)", borderRadius:"12px", color: filter===f ? (f==="All"?"#0096c7":STATUS[f]?.color) : "#4a7a99", padding:"10px 14px", fontSize:"10px", fontWeight: filter===f?"800":"400", letterSpacing:"2px", cursor:"pointer", textAlign:"left", marginBottom:"5px", transition:"all 0.25s cubic-bezier(.4,0,.2,1)", display:"flex", justifyContent:"space-between", alignItems:"center", backdropFilter:"blur(8px)", animation:`fadeUp 0.4s ease ${i*0.05}s both` }}>
                  <span>{f.toUpperCase()}</span>
                  <span style={{ fontWeight:"900", fontSize:"14px" }}>
                    {f==="All" ? jobs.length : jobs.filter(j=>j.status===f).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <div style={{ padding:"20px 16px", borderBottom:"1px solid rgba(255,255,255,0.4)" }}>
              <p style={{ fontSize:"8px", letterSpacing:"4px", color:"#5baed6", margin:"0 0 10px 4px", fontWeight:"700" }}>SORT BY</p>
              {[["newest","NEWEST FIRST"],["company","COMPANY A-Z"],["status","BY STATUS"]].map(([val,label],i) => (
                <button key={val}
                  onClick={() => setSortBy(val)}
                  style={{ width:"100%", background: sortBy===val ? "rgba(0,150,199,0.1)" : "transparent", border:"none", borderRadius:"12px", color: sortBy===val ? "#0096c7" : "#4a7a99", padding:"10px 14px", fontSize:"10px", fontWeight: sortBy===val?"800":"400", letterSpacing:"2px", cursor:"pointer", textAlign:"left", marginBottom:"3px", transition:"all 0.25s", borderLeft: sortBy===val ? "3px solid #0096c7" : "3px solid transparent", animation:`fadeUp 0.4s ease ${i*0.07}s both` }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Music Player */}
            <div style={{ padding:"20px 16px" }}>
              <p style={{ fontSize:"8px", letterSpacing:"4px", color:"#5baed6", margin:"0 0 12px 4px", fontWeight:"700" }}>AMBIENT</p>
              <audio ref={audioRef} loop>
                <source src={music} type="audio/mpeg" />
              </audio>
              <div style={{ background:"rgba(255,255,255,0.35)", border:"1px solid rgba(255,255,255,0.6)", borderRadius:"16px", padding:"16px", backdropFilter:"blur(16px)", boxShadow:"0 4px 20px rgba(0,150,199,0.1), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
                <div style={{ fontSize:"10px", letterSpacing:"3px", color:"#0096c7", marginBottom:"14px", fontWeight:"800" }}>DREAMY WAVES</div>

                {/* Visualizer bars */}
                <div style={{ display:"flex", alignItems:"flex-end", gap:"3px", height:"24px", marginBottom:"14px", justifyContent:"center" }}>
                  {isPlaying ? (
                    [1,2,3,4,5,6,7].map(i => (
                      <div key={i} className={`bar${(i%3)+1}`}
                        style={{ width:"4px", background:"linear-gradient(180deg,#48cae4,#0096c7)", borderRadius:"2px", minHeight:"4px" }} />
                    ))
                  ) : (
                    [1,2,3,4,5,6,7].map(i => (
                      <div key={i} style={{ width:"4px", height:"4px", background:"rgba(0,150,199,0.3)", borderRadius:"2px" }} />
                    ))
                  )}
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px" }}>
                  <button className="play-btn" onClick={toggleMusic}
                    style={{ background:"linear-gradient(135deg,#0096c7,#48cae4)", border:"none", borderRadius:"99px", color:"#fff", width:"40px", height:"40px", fontSize:"14px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(0,150,199,0.35)", flexShrink:0, transition:"all 0.25s", animation: isPlaying ? "glow 2s ease-in-out infinite" : "none" }}>
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"8px", letterSpacing:"2px", color: isPlaying ? "#0096c7" : "#90a8b8", marginBottom:"6px", fontWeight:"700", transition:"color 0.3s" }}>
                      {isPlaying ? "NOW PLAYING" : "PAUSED"}
                    </div>
                    <div style={{ height:"4px", background:"rgba(0,150,199,0.1)", borderRadius:"99px", overflow:"hidden" }}>
                      <div style={{ width: isPlaying ? "100%" : "0%", height:"100%", background:"linear-gradient(90deg,#48cae4,#0096c7)", borderRadius:"99px", transition: isPlaying ? "width 30s linear" : "width 0.3s" }} />
                    </div>
                  </div>
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <span style={{ fontSize:"9px", color:"#90a8b8", fontWeight:"700" }}>VOL</span>
                  <input type="range" min="0" max="1" step="0.01" value={volume}
                    onChange={e => { setVolume(parseFloat(e.target.value)); if(audioRef.current) audioRef.current.volume = parseFloat(e.target.value); }}
                    style={{ flex:1, accentColor:"#0096c7", cursor:"pointer", height:"3px" }} />
                  <span style={{ fontSize:"9px", color:"#0096c7", fontWeight:"900", minWidth:"28px" }}>{Math.round(volume*100)}%</span>
                </div>
              </div>
            </div>

          </aside>
        )}

        {/* ── Main ── */}
        <main style={{ flex:1, overflowX:"hidden" }}>

          {/* Hero */}
          <section style={{ position:"relative", textAlign:"center", padding:"140px 60px 180px", overflow:"hidden", minHeight:"520px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <video autoPlay muted loop playsInline style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0 }}>
              <source src={video} type="video/mp4" />
            </video>
            <div style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", background:"linear-gradient(180deg,rgba(3,4,94,0.4) 0%,rgba(0,150,199,0.2) 100%)", zIndex:1 }} />
            <div style={{ position:"relative", zIndex:2, animation:"float 5s ease-in-out infinite" }}>
              <p style={{ fontSize:"11px", letterSpacing:"8px", color:"#90e0ef", margin:"0 0 20px", textShadow:"0 2px 8px rgba(0,0,0,0.3)" }}>YOUR JOURNEY</p>
              <h1 style={{ fontSize:"clamp(40px,7vw,96px)", fontWeight:"900", letterSpacing:"8px", margin:0, color:"#fff", textShadow:"0 4px 32px rgba(0,0,0,0.3)" }}>APPLICATIONS</h1>
              <p style={{ fontSize:"13px", color:"#caf0f8", letterSpacing:"5px", marginTop:"14px", fontWeight:"300" }}>TRACK YOUR CAREER</p>
              <div style={{ width:"60px", height:"2px", background:"linear-gradient(90deg,#48cae4,#fff)", margin:"22px auto 32px", borderRadius:"2px" }} />
              <div style={{ display:"flex", gap:"16px", justifyContent:"center", flexWrap:"wrap" }}>
                {[
                  { label:"TOTAL",      value:jobs.length },
                  { label:"SUCCESS",    value:`${successRate}%` },
                  { label:"INTERVIEWS", value:jobs.filter(j=>j.status==="Interview").length },
                ].map((s,i) => (
                  <div key={s.label} className="glass-dark" style={{ borderRadius:"16px", padding:"16px 28px", color:"#fff", animation:`fadeUp 0.6s ease ${i*0.1}s both` }}>
                    <div style={{ fontSize:"32px", fontWeight:"900", lineHeight:1 }}>{typeof s.value==="number" ? <AnimatedNumber value={s.value} /> : s.value}</div>
                    <div style={{ fontSize:"8px", letterSpacing:"3px", color:"#90e0ef", marginTop:"6px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Add Job */}
          <section ref={addRef} style={{ maxWidth:"820px", margin:"60px auto", padding:"0 40px" }}>
            <div className="glass" style={{ borderRadius:"24px", padding:"40px 44px" }}>
              <p style={{ fontSize:"9px", letterSpacing:"6px", color:"#0096c7", textAlign:"center", margin:"0 0 28px", fontWeight:"700" }}>NEW APPLICATION</p>
              <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                {[
                  { ph:"Company", val:company, set:setCompany },
                  { ph:"Role",    val:role,    set:setRole    },
                ].map(({ph,val,set}) => (
                  <input key={ph} placeholder={ph} value={val} onChange={e=>set(e.target.value)}
                    style={{ flex:1, minWidth:"140px", background:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.8)", borderRadius:"12px", color:"#03045e", padding:"13px 16px", fontSize:"13px", outline:"none", backdropFilter:"blur(8px)", boxShadow:"inset 0 2px 4px rgba(0,150,199,0.06)", transition:"all 0.2s" }} />
                ))}
                <select value={status} onChange={e=>setStatus(e.target.value)}
                  style={{ flex:1, minWidth:"130px", background:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.8)", borderRadius:"12px", color:"#03045e", padding:"13px 16px", fontSize:"13px", outline:"none", cursor:"pointer", backdropFilter:"blur(8px)" }}>
                  <option>Applied</option><option>Interview</option><option>Rejected</option><option>Offer</option>
                </select>
                <button className="add-btn" onClick={addJob}
                  style={{ padding:"13px 32px", background:"linear-gradient(135deg,#0096c7,#48cae4)", border:"none", borderRadius:"12px", color:"#fff", fontSize:"11px", fontWeight:"800", letterSpacing:"3px", cursor:"pointer", boxShadow:"0 4px 20px rgba(0,150,199,0.3)", transition:"all 0.25s" }}>
                  ADD
                </button>
              </div>
            </div>
          </section>

          {/* Jobs */}
          <section ref={jobsRef} style={{ maxWidth:"960px", margin:"0 auto", padding:"0 40px 100px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
              <p style={{ fontSize:"9px", letterSpacing:"5px", color:"#0096c7", margin:0, fontWeight:"700" }}>
                {displayed.length} {filter==="All"?"APPLICATIONS":filter.toUpperCase()}{search?` · "${search}"`:""}
              </p>
              {filter!=="All" && (
                <button onClick={()=>setFilter("All")}
                  style={{ background:"rgba(255,255,255,0.4)", border:"1px solid rgba(0,150,199,0.25)", borderRadius:"99px", color:"#0096c7", padding:"5px 16px", fontSize:"9px", letterSpacing:"2px", cursor:"pointer", backdropFilter:"blur(8px)", fontWeight:"700" }}>
                  CLEAR FILTER
                </button>
              )}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {displayed.map((job,idx) => (
                <div className="job-card" key={job.id}
                  style={{ background: flash===job.id ? "rgba(0,150,199,0.08)" : "rgba(255,255,255,0.35)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:`1px solid ${flash===job.id?"rgba(0,150,199,0.4)":"rgba(255,255,255,0.6)"}`, borderLeft:`4px solid ${STATUS[job.status]?.color}`, borderRadius:"18px", padding:"22px 28px", boxShadow:`0 4px 24px ${STATUS[job.status]?.glow}, inset 0 1px 0 rgba(255,255,255,0.7)`, transition:"all 0.3s cubic-bezier(.4,0,.2,1)", animation:`fadeUp 0.4s ease ${idx*0.04}s both` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"14px", flexWrap:"wrap", marginBottom:"16px" }}>
                    <span style={{ fontSize:"10px", color:"rgba(0,150,199,0.5)", minWidth:"28px", fontWeight:"700" }}>#{job.id}</span>
                    <span style={{ flex:2, fontSize:"14px", fontWeight:"800", letterSpacing:"2px", color:"#03045e" }}>{job.company.toUpperCase()}</span>
                    <span style={{ flex:2, fontSize:"12px", color:"#0096c7", fontWeight:"500" }}>{job.role}</span>
                    <span style={{ padding:"5px 14px", borderRadius:"99px", fontSize:"9px", fontWeight:"800", letterSpacing:"2px", background:STATUS[job.status]?.bg, color:STATUS[job.status]?.color, border:`1px solid ${STATUS[job.status]?.border}`, backdropFilter:"blur(8px)" }}>
                      {job.status.toUpperCase()}
                    </span>
                    <select value={job.status} onChange={e=>updateStatus(job,e.target.value)}
                      style={{ background:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.8)", borderRadius:"10px", color:"#03045e", padding:"7px 10px", fontSize:"11px", outline:"none", cursor:"pointer", backdropFilter:"blur(8px)" }}>
                      <option>Applied</option><option>Interview</option><option>Rejected</option><option>Offer</option>
                    </select>
                    <button className="del-btn" onClick={()=>deleteJob(job.id)}
                      style={{ background:"rgba(255,255,255,0.4)", border:"1px solid rgba(231,111,81,0.25)", borderRadius:"10px", color:"#e76f51", padding:"7px 14px", fontSize:"10px", cursor:"pointer", transition:"all 0.2s", backdropFilter:"blur(8px)", fontWeight:"700" }}>
                      REMOVE
                    </button>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <span style={{ fontSize:"8px", letterSpacing:"2px", color:"rgba(0,150,199,0.6)", minWidth:"56px", fontWeight:"700" }}>PROGRESS</span>
                    <div style={{ flex:1 }}><ProgressBar status={job.status} /></div>
                    <span style={{ fontSize:"8px", letterSpacing:"2px", color:STATUS[job.status]?.color, minWidth:"72px", textAlign:"right", fontWeight:"800" }}>
                      {job.status==="Rejected"?"CLOSED":job.status==="Offer"?"COMPLETE":"IN PROGRESS"}
                    </span>
                  </div>
                </div>
              ))}
              {displayed.length===0 && (
                <div className="glass" style={{ textAlign:"center", padding:"60px", fontSize:"11px", letterSpacing:"4px", color:"#0096c7", borderRadius:"18px" }}>
                  NO {filter==="All"?"":filter.toUpperCase()} APPLICATIONS YET
                </div>
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="glass" style={{ padding:"24px 40px", display:"flex", justifyContent:"space-between", borderTop:"1px solid rgba(255,255,255,0.4)", borderRadius:0 }}>
            <span style={{ fontSize:"11px", letterSpacing:"5px", color:"#03045e", fontWeight:"900" }}>CAREER TRACKER</span>
            <span style={{ fontSize:"10px", letterSpacing:"4px", color:"#0096c7", fontWeight:"700" }}>RIDE THE WAVE 2025</span>
          </footer>

        </main>
      </div>
    </div>
  );
}