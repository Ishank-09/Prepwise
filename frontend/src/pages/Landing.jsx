import React from "react"

const FEATURES = [
  { icon: "🎯", color: "#3B82F6", title: "JD-Specific Questions",     desc: "Every question is generated from your exact job description. No banks, no generics — ever." },
  { icon: "🤖", color: "#8B5CF6", title: "AI Interviewer Personas",    desc: "Meet Alex, Priya, Jordan, and Sam — each with a distinct interview style tailored to your role." },
  { icon: "🎙️", color: "#10B981", title: "Voice-First Experience",    desc: "Speak your answers naturally. Our AI listens, transcribes, and reacts like a real interviewer." },
  { icon: "📊", color: "#EC4899", title: "Detailed Performance Report",desc: "Scored across 5 dimensions with specific, actionable feedback after every interview." },
]

const STEPS = [
  { n: "01", title: "Upload Your JD",      desc: "Paste or upload the job description from the posting. The more detail, the better the questions." },
  { n: "02", title: "Meet Your Interviewer",desc: "Pick your role and seniority. Your AI interviewer is assigned and ready to go." },
  { n: "03", title: "Get Your Report",      desc: "Complete the session and receive a full performance breakdown with scores and advice." },
]

const PERSONAS = [
  { name: "Alex",   role: "Software Engineering",  color: "#3B82F6", style: "Direct and technical. Digs into system design and CS fundamentals." },
  { name: "Priya",  role: "Data Science / ML",     color: "#8B5CF6", style: "First-principles thinker. Probes your stats, ML intuition, and data storytelling." },
  { name: "Jordan", role: "Product Management",    color: "#10B981", style: "Product-minded. Pushes on strategy, prioritisation, and user empathy." },
  { name: "Sam",    role: "Design",                color: "#EC4899", style: "Craft-focused. Explores your process, decisions, and design thinking depth." },
]

const STATS = [
  { value: "4",   label: "AI Personas" },
  { value: "20",  label: "Questions / Session" },
  { value: "5",   label: "Feedback Dimensions" },
  { value: "60s", label: "To Start" },
]

const Landing = ({ onCredentialResponse, clientId }) => {
  const [navVisible, setNavVisible] = React.useState(true)
  const lastY = React.useRef(0)
  const navBtnRef = React.useRef(null)
  const heroBtnRef = React.useRef(null)

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setNavVisible(y < 10 || y < lastY.current)
      lastY.current = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  React.useEffect(() => {
    const init = () => {
      if (!window.google || !clientId) return
      window.google.accounts.id.initialize({ client_id: clientId, callback: onCredentialResponse })
      if (navBtnRef.current) {
        window.google.accounts.id.renderButton(navBtnRef.current, {
          theme: "filled_black", size: "medium", text: "signin_with", shape: "rectangular", width: 200,
        })
      }
      if (heroBtnRef.current) {
        window.google.accounts.id.renderButton(heroBtnRef.current, {
          theme: "filled_black", size: "large", text: "continue_with", shape: "rectangular", width: 244,
        })
      }
    }
    if (window.google) init()
    else window.onGoogleLibraryLoad = init
    return () => { window.onGoogleLibraryLoad = undefined }
  }, [clientId, onCredentialResponse])

  return (
    <div
      className="min-h-screen text-white font-sans overflow-x-hidden"
      style={{ background: "radial-gradient(ellipse at 65% -5%, rgba(37,99,235,0.32) 0%, transparent 52%), radial-gradient(ellipse at -5% 70%, rgba(37,99,235,0.10) 0%, transparent 40%), #0A0A0A" }}
    >
      {/* subtle grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]" style={{
        backgroundImage: "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 48px)"
      }} />

      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md transition-transform duration-300 ${navVisible ? "translate-y-0" : "-translate-y-full"}`}
        style={{ background: "rgba(10,10,10,0.7)" }}
      >
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="font-semibold text-base">PrepWise</span>
          </div>

          <div ref={navBtnRef} className="overflow-hidden rounded-lg" />
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-semibold mb-8 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Mock interviews from your actual JD
        </div>

        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight mb-6 max-w-4xl">
          Ace every interview<br />
          <span style={{ background: "linear-gradient(90deg, #60A5FA, #3B82F6, #6366F1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            before it happens.
          </span>
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Upload your job description. Get an AI interviewer that asks questions built specifically for that role — not a generic question bank.
        </p>

        <div className="flex items-center gap-3 mb-24">
          <div className="relative group">
            <button
              className="px-7 py-3.5 bg-accent text-white rounded-xl font-bold text-sm shadow-lg transition group-hover:-translate-y-px group-active:translate-y-0"
              style={{ boxShadow: "0 8px 32px rgba(37,99,235,0.35)", pointerEvents: "none" }}
            >
              Start Mock Interview →
            </button>
            {/* transparent Google button overlay — catches the real click */}
            <div ref={heroBtnRef} className="absolute inset-0 opacity-0 overflow-hidden" style={{ zIndex: 1 }} />
          </div>
          <button
            onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth" })}
            className="px-7 py-3.5 bg-white/6 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition"
          >
            See how it works
          </button>
        </div>

        {/* stats bar */}
        <div className="flex items-center gap-0 divide-x divide-white/8 border border-white/8 rounded-2xl overflow-hidden bg-white/4 backdrop-blur-sm">
          {STATS.map(({ value, label }) => (
            <div key={label} className="px-8 py-4 text-center">
              <p className="text-white text-2xl font-bold tabular-nums">{value}</p>
              <p className="text-white/40 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-8 py-28">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything you need to prepare</h2>
          <p className="text-white/40 text-base max-w-md mx-auto">Built for serious candidates who want real, role-specific feedback.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group relative rounded-2xl p-7 border border-white/6 hover:border-white/12 transition-all duration-300 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              {/* hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 0% 0%, ${f.color}14, transparent 60%)` }} />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5"
                  style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-8 py-28">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How it works</h2>
          <p className="text-white/40 text-base">Three steps to your best interview performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {/* connecting line desktop */}
          <div className="hidden md:block absolute top-10 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {STEPS.map((s, i) => (
            <div key={i} className="relative rounded-2xl p-8 border border-white/6 hover:border-white/10 transition"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center mb-6">
                <span className="text-accent text-xs font-bold">{s.n}</span>
              </div>
              <h3 className="font-bold text-base mb-2">{s.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Meet the Interviewers ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-8 py-28">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Meet your interviewers</h2>
          <p className="text-white/40 text-base">Four distinct AI personas, each built for a specific role.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERSONAS.map((p) => (
            <div
              key={p.name}
              className="group rounded-2xl p-6 border border-white/6 hover:border-white/12 transition-all duration-300 overflow-hidden relative"
              style={{ background: `linear-gradient(135deg, ${p.color}12, ${p.color}04)` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${p.color}18, transparent 60%)` }} />

              <div className="relative z-10">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-5 shadow-lg"
                  style={{ backgroundColor: p.color, boxShadow: `0 8px 24px ${p.color}40` }}
                >
                  {p.name[0]}
                </div>
                <p className="font-bold text-base mb-0.5">{p.name}</p>
                <p className="text-xs mb-4" style={{ color: p.color }}>{p.role}</p>
                <p className="text-white/40 text-sm leading-relaxed">{p.style}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-accent rounded-md flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">P</span>
            </div>
            <span className="text-sm font-semibold">PrepWise AI</span>
          </div>

          <p className="text-white/25 text-xs">© 2025 PrepWise AI. Built for serious candidates.</p>
        </div>
      </footer>

    </div>
  )
}

export default Landing
