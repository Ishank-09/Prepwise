import { useState } from "react"
import { ROLES, SENIORITY_LEVELS, PERSONA_NAMES } from "../../utils/constants"

const ROLE_ICONS = { SWE: "💻", DS_ML: "🧠", PM: "🎯", Design: "🎨" }
const ROLE_COLORS = {
  SWE:    { bg: "bg-blue-500/10  dark:bg-blue-500/10",  border: "border-blue-500",    text: "text-blue-600  dark:text-blue-400"  },
  DS_ML:  { bg: "bg-purple-500/10 dark:bg-purple-500/10", border: "border-purple-500", text: "text-purple-600 dark:text-purple-400" },
  PM:     { bg: "bg-emerald-500/10 dark:bg-emerald-500/10", border: "border-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  Design: { bg: "bg-pink-500/10  dark:bg-pink-500/10",  border: "border-pink-500",    text: "text-pink-600  dark:text-pink-400"  },
}

const RoleSelector = ({ onComplete, onBack }) => {
  const [role, setRole] = useState("")
  const [seniority, setSeniority] = useState("")
  const [error, setError] = useState(null)

  const handleNext = () => {
    if (!role) { setError("Please select a role"); return }
    if (!seniority) { setError("Please select your experience level"); return }
    onComplete({ role, seniority })
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-1">
        Select Your Role
      </h2>
      <p className="text-[#64748B] dark:text-[#94A3B8] text-sm mb-8">
        Choose the role and experience level you're targeting.
      </p>

      {/* Role grid */}
      <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Role</p>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {ROLES.map((r) => {
          const c = ROLE_COLORS[r.value]
          const selected = role === r.value
          return (
            <button
              key={r.value}
              onClick={() => { setRole(r.value); setError(null) }}
              className={`py-4 px-4 rounded-xl text-sm font-medium text-left transition border ${
                selected
                  ? `${c.bg} ${c.border} ${c.text}`
                  : "border-[#E2E8F0] dark:border-[#2A2A2A] text-[#64748B] dark:text-[#94A3B8] hover:border-[#CBD5E1] dark:hover:border-[#3A3A3A]"
              }`}
            >
              <span className="text-xl block mb-2">{ROLE_ICONS[r.value]}</span>
              {r.label}
            </button>
          )
        })}
      </div>

      {/* Seniority */}
      <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Experience Level</p>
      <div className="flex flex-col gap-2 mb-6">
        {SENIORITY_LEVELS.map((s) => (
          <button
            key={s.value}
            onClick={() => { setSeniority(s.value); setError(null) }}
            className={`py-3 px-4 rounded-xl text-sm font-medium text-left transition border ${
              seniority === s.value
                ? "bg-accent/10 border-accent text-accent"
                : "border-[#E2E8F0] dark:border-[#2A2A2A] text-[#64748B] dark:text-[#94A3B8] hover:border-[#CBD5E1] dark:hover:border-[#3A3A3A]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Interviewer preview */}
      {role && (
        <div className="bg-[#F8FAFC] dark:bg-[#1A1A1A] rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2 border border-[#E2E8F0] dark:border-[#2A2A2A]">
          <span className="text-base">{ROLE_ICONS[role]}</span>
          <span className="text-[#64748B] dark:text-[#94A3B8]">
            Your interviewer will be <span className="text-accent font-semibold">{PERSONA_NAMES[role]}</span>
          </span>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 bg-[#F1F5F9] dark:bg-[#1F1F1F] hover:bg-[#E2E8F0] dark:hover:bg-[#2A2A2A] text-[#0F172A] dark:text-white rounded-xl text-sm font-semibold transition"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-3.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

export default RoleSelector
