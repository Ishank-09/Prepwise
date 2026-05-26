import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { uploadJD } from "../utils/api"
import { PERSONA_NAMES } from "../utils/constants"
import useDarkMode from "../hooks/useDarkMode"

// ─── data ────────────────────────────────────────────────────────────────────

const ROLES = [
  { value: "SWE",    label: "Software Engineering", icon: "💻", color: "#3B82F6", desc: "Frontend, backend, full-stack" },
  { value: "DS_ML",  label: "Data Science / ML",    icon: "🧠", color: "#8B5CF6", desc: "ML, data engineering, analytics" },
  { value: "PM",     label: "Product Management",   icon: "🎯", color: "#10B981", desc: "Product strategy & roadmapping" },
  { value: "Design", label: "Design",               icon: "🎨", color: "#EC4899", desc: "UX, product design, research" },
]

const SENIORITY = [
  { value: "Fresher",   label: "Fresher",    sub: "0 yrs"   },
  { value: "Junior",    label: "Junior",     sub: "1–3 yrs" },
  { value: "Mid-level", label: "Mid-level",  sub: "3–5 yrs" },
  { value: "Senior",    label: "Senior",     sub: "5–8 yrs" },
  { value: "Lead",      label: "Lead",       sub: "8+ yrs"  },
]

const STEPS = ["Job Description", "Your Role", "Start Interview"]

// ─── step bar ────────────────────────────────────────────────────────────────

const STEP_TIPS = [
  "The more detailed the JD, the more tailored your questions. Paste the real one from the job posting.",
  "Each role has a dedicated AI persona with a distinct interview style — pick your actual target.",
  "Treat this like the real thing. Find a quiet spot and answer as you would in an actual interview.",
]

const SidebarSteps = ({ current }) => (
  <div className="flex flex-col gap-0">
    {STEPS.map((label, i) => (
      <div key={i} className="flex gap-4 relative">
        {/* connector line */}
        {i < STEPS.length - 1 && (
          <div
            className="absolute left-[15px] top-8 w-0.5 h-[calc(100%-8px)] transition-colors duration-500"
            style={{ backgroundColor: i < current ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.08)" }}
          />
        )}

        {/* dot */}
        <div className="shrink-0 mt-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < current     ? "bg-white/20 text-white"
              : i === current ? "bg-white text-[#0F172A]"
              : "text-white/20"
            }`}
            style={i > current ? { border: "2px solid rgba(255,255,255,0.12)" } : {}}
          >
            {i < current ? "✓" : i + 1}
          </div>
        </div>

        {/* text */}
        <div className={`pb-10 last:pb-0 pt-1 transition-all duration-300 ${
          i === current ? "opacity-100" : i < current ? "opacity-50" : "opacity-25"
        }`}>
          <p className="text-white text-sm font-semibold">{label}</p>
          {i === current && (
            <p className="text-white/50 text-xs mt-1 leading-relaxed max-w-[200px]">
              {STEP_TIPS[i]}
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
)

// ─── step 0 – JD upload ──────────────────────────────────────────────────────

const StepJD = ({ onNext }) => {
  const [mode, setMode]           = useState("file")
  const [file, setFile]           = useState(null)
  const [text, setText]           = useState("")
  const [dragging, setDragging]   = useState(false)
  const [error, setError]         = useState(null)
  const inputRef = useRef(null)

  const pickFile = (f) => {
    if (!f) return
    if (!["application/pdf", "text/plain"].includes(f.type)) {
      setError("Only PDF or .txt files are accepted")
      return
    }
    setError(null)
    setFile(f)
  }

  const submit = () => {
    if (mode === "file" && !file)       { setError("Please upload a file"); return }
    if (mode === "text" && !text.trim()) { setError("Please paste the job description"); return }
    onNext({ file, pastedText: text, uploadType: mode })
  }

  return (
    <div className="animate-fadeIn">
      {/* heading */}
      <div className="mb-10">
        <h1 className="text-[2.1rem] font-bold tracking-tight text-[#0F172A] dark:text-white leading-tight mb-3">
          Paste in the job description
        </h1>
        <p className="text-[#64748B] dark:text-[#94A3B8] text-base leading-relaxed">
          Your AI interviewer will read it and generate questions tailored to this exact role — no generic questions.
        </p>
      </div>

      {/* mode toggle */}
      <div className="inline-flex gap-1 p-1 bg-[#F1F5F9] dark:bg-[#161616] rounded-xl mb-6">
        {[["file", "📎", "Upload File"], ["text", "✏️", "Paste Text"]].map(([val, ico, lbl]) => (
          <button
            key={val}
            onClick={() => { setMode(val); setError(null) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === val
                ? "bg-white dark:bg-[#222] text-[#0F172A] dark:text-white shadow-sm"
                : "text-[#94A3B8] hover:text-[#64748B]"
            }`}
          >
            <span>{ico}</span>{lbl}
          </button>
        ))}
      </div>

      {/* upload zone */}
      {mode === "file" && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]) }}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-200 select-none ${
            dragging
              ? "border-accent bg-accent/5 scale-[1.01]"
              : file
              ? "border-accent/40 bg-accent/4"
              : "border-[#E2E8F0] dark:border-[#222] hover:border-accent/50 hover:bg-[#F8FAFC] dark:hover:bg-[#0F0F0F]"
          }`}
        >
          <input ref={inputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => pickFile(e.target.files[0])} />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center text-4xl">✅</div>
              <div>
                <p className="font-semibold text-[#0F172A] dark:text-white">{file.name}</p>
                <p className="text-[#94A3B8] text-sm mt-1">Click to swap file</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl transition-all ${
                dragging ? "bg-accent/10" : "bg-[#F1F5F9] dark:bg-[#1A1A1A]"
              }`}>
                {dragging ? "📥" : "📄"}
              </div>
              <div>
                <p className="font-semibold text-[#0F172A] dark:text-white text-base">Drop your JD here</p>
                <p className="text-[#94A3B8] text-sm mt-1">or click to browse &nbsp;·&nbsp; PDF or TXT &nbsp;·&nbsp; max 10 MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* paste area */}
      {mode === "text" && (
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the full job description here — responsibilities, requirements, about the team..."
            className="w-full h-72 bg-white dark:bg-[#111] text-[#0F172A] dark:text-white text-sm rounded-2xl p-5 resize-none outline-none border border-[#E2E8F0] dark:border-[#222] focus:border-accent transition-colors placeholder-[#94A3B8] leading-relaxed"
          />
          {text && (
            <span className="absolute bottom-4 right-4 text-xs text-[#94A3B8]">
              {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          )}
        </div>
      )}

      {error && <p className="flex items-center gap-1.5 mt-3 text-red-500 text-sm"><span>⚠</span>{error}</p>}

      <button
        onClick={submit}
        className="w-full mt-7 py-4 bg-accent hover:bg-accent-hover text-white rounded-2xl font-bold text-base transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:-translate-y-px active:translate-y-0"
      >
        Continue →
      </button>
    </div>
  )
}

// ─── step 1 – role + seniority ───────────────────────────────────────────────

const StepRole = ({ onNext, onBack }) => {
  const [role, setRole]            = useState("")
  const [seniority, setSeniority]  = useState("")
  const [error, setError]          = useState(null)
  const selectedRole = ROLES.find(r => r.value === role)

  const submit = () => {
    if (!role)     { setError("Please pick a role"); return }
    if (!seniority){ setError("Please pick your experience level"); return }
    onNext({ role, seniority })
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-[2.1rem] font-bold tracking-tight text-[#0F172A] dark:text-white leading-tight mb-3">
          What role are you targeting?
        </h1>
        <p className="text-[#64748B] dark:text-[#94A3B8] text-base leading-relaxed">
          We'll match you with the right AI interviewer and calibrate question difficulty to your level.
        </p>
      </div>

      {/* role cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {ROLES.map((r) => {
          const sel = role === r.value
          return (
            <button
              key={r.value}
              onClick={() => { setRole(r.value); setError(null) }}
              className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                sel
                  ? "shadow-md scale-[1.01]"
                  : "border-[#E2E8F0] dark:border-[#1F1F1F] hover:border-[#CBD5E1] dark:hover:border-[#2A2A2A] hover:shadow-sm"
              }`}
              style={sel ? { borderColor: r.color, background: `${r.color}10` } : {}}
            >
              {/* checkmark */}
              {sel && (
                <span
                  className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: r.color }}
                >✓</span>
              )}

              <span className="text-[2rem] block mb-3 leading-none">{r.icon}</span>
              <p className="font-bold text-sm text-[#0F172A] dark:text-white mb-1">{r.label}</p>
              <p className="text-[#94A3B8] text-xs leading-snug">{r.desc}</p>

              {/* persona tag */}
              {sel && (
                <div className="mt-3 flex items-center gap-1.5 animate-fadeIn">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: r.color }}>
                    {PERSONA_NAMES[r.value][0]}
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: r.color }}>
                    {PERSONA_NAMES[r.value]} will be your interviewer
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* seniority — slides in once role is picked */}
      {role && (
        <div className="animate-fadeIn mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8] mb-3">Experience Level</p>
          <div className="flex gap-2">
            {SENIORITY.map((s) => {
              const sel = seniority === s.value
              return (
                <button
                  key={s.value}
                  onClick={() => { setSeniority(s.value); setError(null) }}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all duration-150 ${
                    sel ? "shadow-sm" : "border-[#E2E8F0] dark:border-[#1F1F1F] hover:border-[#CBD5E1] dark:hover:border-[#2A2A2A]"
                  }`}
                  style={sel ? { borderColor: selectedRole?.color, background: `${selectedRole?.color}12` } : {}}
                >
                  <span className={`text-xs font-bold block ${sel ? "" : "text-[#64748B] dark:text-[#94A3B8]"}`} style={sel ? { color: selectedRole?.color } : {}}>
                    {s.label}
                  </span>
                  <span className={`text-[10px] mt-0.5 block ${sel ? "opacity-70" : "text-[#94A3B8]"}`} style={sel ? { color: selectedRole?.color } : {}}>
                    {s.sub}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && <p className="flex items-center gap-1.5 mb-5 text-red-500 text-sm"><span>⚠</span>{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-7 py-4 bg-[#F1F5F9] dark:bg-[#1A1A1A] hover:bg-[#E8EDF4] dark:hover:bg-[#222] text-[#0F172A] dark:text-white rounded-2xl font-bold transition"
        >
          ← Back
        </button>
        <button
          onClick={submit}
          className="flex-1 py-4 bg-accent hover:bg-accent-hover text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:-translate-y-px active:translate-y-0"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

// ─── step 2 – confirm ────────────────────────────────────────────────────────

const StepConfirm = ({ jdData, roleData, onBack, onStart, isLoading, error }) => {
  const role = ROLES.find(r => r.value === roleData.role)
  const persona = PERSONA_NAMES[roleData.role]

  return (
    <div className="animate-fadeIn">
      {/* interviewer hero */}
      <div className="text-center mb-10">
        <div className="relative inline-flex mb-6">
          {/* glow ring */}
          <div
            className="absolute -inset-3 rounded-full opacity-20 blur-md animate-pulse"
            style={{ backgroundColor: role?.color }}
          />
          {/* outer ring */}
          <div
            className="absolute -inset-1.5 rounded-full opacity-30"
            style={{ border: `2px solid ${role?.color}` }}
          />
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl"
            style={{ backgroundColor: role?.color }}
          >
            {persona[0]}
          </div>
        </div>

        <h1 className="text-[2.1rem] font-bold tracking-tight text-[#0F172A] dark:text-white mb-1">
          Meet {persona}
        </h1>
        <p className="text-[#64748B] dark:text-[#94A3B8] text-base">
          Your {role?.label} Interviewer · 20 questions
        </p>
      </div>

      {/* summary card */}
      <div className="bg-white dark:bg-[#111] border border-[#E2E8F0] dark:border-[#1F1F1F] rounded-2xl overflow-hidden mb-5 shadow-sm">
        {[
          { icon: "📋", label: "Job Description", value: jdData.uploadType === "file" ? jdData.file?.name : "Pasted text" },
          { icon: role?.icon, label: "Role", value: role?.label },
          { icon: "📈", label: "Experience",  value: roleData.seniority },
          { icon: "🎙️", label: "Format",      value: "Voice or text · end anytime" },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#F1F5F9] dark:border-[#1A1A1A] last:border-0">
            <span className="text-lg w-6 text-center shrink-0">{icon}</span>
            <span className="text-sm text-[#64748B] dark:text-[#94A3B8] w-32 shrink-0">{label}</span>
            <span className="text-sm font-semibold text-[#0F172A] dark:text-white truncate">{value}</span>
          </div>
        ))}
      </div>

      {/* motivational tip */}
      <div
        className="rounded-2xl px-5 py-4 mb-7 flex items-start gap-3 border-l-4"
        style={{ background: `${role?.color}0d`, borderLeftColor: role?.color }}
      >
        <span className="text-base shrink-0 mt-0.5">💡</span>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
          Find a quiet spot, speak at a natural pace, and treat this like the real thing.
          You'll get detailed feedback on 5 dimensions when you're done.
        </p>
      </div>

      {error && <p className="flex items-center gap-1.5 mb-5 text-red-500 text-sm"><span>⚠</span>{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-7 py-4 bg-[#F1F5F9] dark:bg-[#1A1A1A] hover:bg-[#E8EDF4] dark:hover:bg-[#222] text-[#0F172A] dark:text-white rounded-2xl font-bold transition"
        >
          ← Back
        </button>
        <button
          onClick={onStart}
          disabled={isLoading}
          className="flex-1 py-4 text-white rounded-2xl font-bold text-base transition-all shadow-lg hover:-translate-y-px active:translate-y-0 disabled:opacity-50"
          style={{ backgroundColor: role?.color, boxShadow: `0 8px 24px ${role?.color}30` }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Setting up your interview...
            </span>
          ) : `Start with ${persona} →`}
        </button>
      </div>
    </div>
  )
}

// ─── main ────────────────────────────────────────────────────────────────────

const Setup = () => {
  const navigate            = useNavigate()
  const { isDark, toggleDark } = useDarkMode()
  const [step, setStep]     = useState(0)
  const [jdData, setJdData] = useState(null)
  const [roleData, setRoleData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]   = useState(null)

  const handleStart = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const form = new FormData()
      if (jdData.uploadType === "file") {
        form.append("file", jdData.file)
      } else {
        form.append("file", new Blob([jdData.pastedText], { type: "text/plain" }), "jd.txt")
      }
      form.append("role", roleData.role)
      form.append("seniority", roleData.seniority)
      const res = await uploadJD(form)
      navigate("/interview", {
        state: {
          jd_text:   res.data.jd_text,
          questions: res.data.questions,
          role:      roleData.role,
          seniority: roleData.seniority,
        }
      })
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex font-sans overflow-hidden">

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
      <aside className="w-[300px] shrink-0 flex flex-col bg-[#0D1117] relative overflow-hidden">
        {/* subtle gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-8">
          {/* logo + dark mode */}
          <div className="flex items-center justify-between mb-14">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <span className="text-white font-semibold text-sm">PrepWise</span>
            </div>
            <button
              onClick={toggleDark}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/8 hover:bg-white/12 transition text-sm"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>

          {/* step list */}
          <div className="flex-1">
            <SidebarSteps current={step} />
          </div>

          {/* bottom badge */}
          <div className="mt-auto pt-8">
            <div className="rounded-2xl p-4 bg-white/5 border border-white/8">
              <p className="text-white/40 text-[11px] uppercase tracking-widest font-semibold mb-1">AI-powered</p>
              <p className="text-white/60 text-xs leading-relaxed">
                Questions generated live from your exact job description — not a question bank.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-300 overflow-hidden">

        {/* thin top bar just for breadcrumb / mobile hint */}
        <div className="shrink-0 h-1 bg-[#E2E8F0] dark:bg-[#1A1A1A]">
          <div
            className="h-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* scrollable, vertically centered content */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center px-12 py-12">
            <div className="w-full max-w-xl">

              {step === 0 && (
                <StepJD onNext={(d) => { setJdData(d); setStep(1) }} />
              )}
              {step === 1 && (
                <StepRole onNext={(d) => { setRoleData(d); setStep(2) }} onBack={() => setStep(0)} />
              )}
              {step === 2 && jdData && roleData && (
                <StepConfirm
                  jdData={jdData}
                  roleData={roleData}
                  onBack={() => setStep(1)}
                  onStart={handleStart}
                  isLoading={isLoading}
                  error={error}
                />
              )}

            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default Setup
