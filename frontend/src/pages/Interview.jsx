import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import VoiceRecorder from "../components/interview/VoiceRecorder"
import TextAnswer from "../components/interview/TextAnswer"
import useTypewriter from "../hooks/useTypewriter"
import { startInterview, nextTurn, endInterview } from "../utils/api"

const PERSONA = {
  SWE:    { name: "Alex",   label: "Software Engineering",  color: "#3B82F6" },
  DS_ML:  { name: "Priya",  label: "Data Science / ML",     color: "#8B5CF6" },
  PM:     { name: "Jordan", label: "Product Management",    color: "#10B981" },
  Design: { name: "Sam",    label: "Design",                color: "#EC4899" },
}

const SpeakingDots = ({ color }) => (
  <div className="flex items-center gap-1.5">
    {[0, 150, 300].map(d => (
      <span
        key={d}
        className="w-2 h-2 rounded-full animate-bounce"
        style={{ backgroundColor: color, animationDelay: `${d}ms` }}
      />
    ))}
  </div>
)

const playAudio = async (hex) => {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)))
  const blob  = new Blob([bytes], { type: "audio/wav" })
  const audio = new Audio(URL.createObjectURL(blob))
  await audio.play()
  return audio
}

// ─── Left panel — the interviewer ────────────────────────────────────────────

const InterviewerSide = ({ role, question, isLoading, isProcessing }) => {
  const p = PERSONA[role] || PERSONA.SWE
  const { displayedText, isDone } = useTypewriter(question || "", 22)
  const isSpeaking = isLoading || isProcessing || (!isDone && !!question)

  return (
    <div
      className="h-full flex flex-col overflow-hidden relative"
      style={{ background: `linear-gradient(160deg, ${p.color}22 0%, #0A0A0A 55%)` }}
    >
      {/* faint grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)"
        }}
      />

      <div className="relative z-10 flex flex-col h-full p-10">

        {/* ── avatar section ── */}
        <div className="flex flex-col items-center text-center pt-8 pb-6">
          {/* rings */}
          <div className="relative mb-6">
            {isSpeaking && <>
              <span className="absolute -inset-3 rounded-full animate-ping"
                style={{ backgroundColor: p.color, opacity: 0.12 }} />
              <span className="absolute -inset-6 rounded-full animate-ping"
                style={{ backgroundColor: p.color, opacity: 0.06, animationDuration: "1.8s" }} />
            </>}

            <div
              className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl"
              style={{ backgroundColor: p.color, boxShadow: `0 0 40px ${p.color}44` }}
            >
              {p.name[0]}
            </div>
          </div>

          <h2 className="text-white text-xl font-bold mb-1">{p.name}</h2>
          <p className="text-white/40 text-sm mb-3">{p.label} Interviewer</p>

          {isSpeaking
            ? <SpeakingDots color={p.color} />
            : <span className="text-white/20 text-xs">Listening…</span>
          }
        </div>

        {/* ── question bubble ── */}
        <div className="flex-1 overflow-y-auto mt-2">
          <div
            className="rounded-2xl p-6 border border-white/8"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {isLoading ? (
              <div className="flex items-center gap-3 text-white/40 text-sm">
                <div className="w-4 h-4 border-2 rounded-full border-t-transparent animate-spin"
                  style={{ borderColor: `${p.color}60`, borderTopColor: "transparent" }} />
                Preparing your interview…
              </div>
            ) : isProcessing ? (
              <div className="flex items-center gap-3 text-white/40 text-sm">
                <div className="w-4 h-4 border-2 rounded-full border-t-transparent animate-spin"
                  style={{ borderColor: `${p.color}60`, borderTopColor: "transparent" }} />
                Evaluating your answer…
              </div>
            ) : (
              <p className="text-white text-base leading-relaxed">
                {displayedText}
                {!isDone && question && (
                  <span className="inline-block w-0.5 h-4 ml-1 animate-pulse align-middle"
                    style={{ backgroundColor: p.color }} />
                )}
              </p>
            )}
          </div>
        </div>

        {/* ── bottom label ── */}
        <p className="text-center text-white/15 text-xs mt-4 shrink-0">AI Interviewer · PrepWise</p>
      </div>
    </div>
  )
}

// ─── Right panel — your answer ───────────────────────────────────────────────

const AnswerSide = ({
  role, questionNumber, totalQuestions,
  inputMode, setInputMode,
  onSubmit, onEnd,
  isLoading, isProcessing,
  error, currentQuestion,
  onRetry,
}) => {
  const p = PERSONA[role] || PERSONA.SWE
  const progress = totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0
  const canAnswer = !isLoading && !isProcessing && !!currentQuestion

  return (
    <div className="h-full flex flex-col bg-[#0F0F0F] overflow-hidden">

      {/* ── header: progress + end ── */}
      <div className="shrink-0 px-8 pt-7 pb-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">Question</p>
            <p className="text-white text-2xl font-bold tabular-nums">
              {questionNumber > 0 ? questionNumber : "—"}
              <span className="text-white/25 text-sm font-normal"> / {totalQuestions}</span>
            </p>
          </div>
          <button
            onClick={onEnd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/8 text-red-400 hover:bg-red-500/15 transition text-sm font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            End Interview
          </button>
        </div>

        {/* progress bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%`, backgroundColor: p.color }}
          />
        </div>
      </div>

      {/* ── answer area ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-6 overflow-y-auto">

        {/* error (connection) */}
        {error && !currentQuestion && (
          <div className="mb-6 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-3">
            <span>⚠</span>
            <span>{error}</span>
            <button onClick={onRetry} className="ml-auto underline text-red-300 hover:text-red-200 shrink-0">Retry</button>
          </div>
        )}

        {/* waiting / loading state */}
        {(isLoading || isProcessing) && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${p.color}30`, borderTopColor: p.color }} />
            <p className="text-white/30 text-sm">
              {isLoading ? "Starting your interview…" : "Processing your answer…"}
            </p>
          </div>
        )}

        {/* active input */}
        {canAnswer && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-white/25 text-[11px] uppercase tracking-widest font-medium">Your Answer</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* mode toggle */}
            <div className="flex gap-2 p-1 bg-white/4 rounded-xl">
              {[["voice", "🎙️", "Voice"], ["text", "⌨️", "Type"]].map(([val, ico, lbl]) => (
                <button
                  key={val}
                  onClick={() => setInputMode(val)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    inputMode === val
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  <span>{ico}</span>{lbl}
                </button>
              ))}
            </div>

            {inputMode === "voice"
              ? <VoiceRecorder onSubmit={onSubmit} disabled={false} />
              : <TextAnswer    onSubmit={onSubmit} disabled={false} />
            }

            {error && currentQuestion && (
              <p className="text-red-400 text-sm flex items-center gap-1.5"><span>⚠</span>{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

const Interview = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { jd_text, questions, role, seniority } = location.state || {}

  const [sessionId, setSessionId]               = useState(null)
  const [currentQuestion, setCurrentQuestion]   = useState("")
  const [questionNumber, setQuestionNumber]     = useState(0)
  const [totalQuestions]                        = useState(20)
  const [inputMode, setInputMode]               = useState("voice")
  const [isLoading, setIsLoading]               = useState(true)
  const [isProcessing, setIsProcessing]         = useState(false)
  const [isCompleted, setIsCompleted]           = useState(false)
  const [error, setError]                       = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!questions || !role) { navigate("/setup"); return }
    initInterview()
  }, [])

  const initInterview = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await startInterview({ role, seniority, jd_text, questions })
      setSessionId(res.data.session_id)
      setCurrentQuestion(res.data.question)
      setQuestionNumber(1)
      if (res.data.audio) { try { audioRef.current = await playAudio(res.data.audio) } catch {} }
    } catch {
      setError("Could not connect to interview server. Make sure the backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = async (answer) => {
    setIsProcessing(true)
    setError(null)
    try {
      const res = await nextTurn({ session_id: sessionId, answer })
      if (res.data.status === "completed") { setIsCompleted(true); return }
      setCurrentQuestion(res.data.question)
      setQuestionNumber(res.data.question_number)
      if (res.data.audio) {
        try {
          if (audioRef.current) audioRef.current.pause()
          audioRef.current = await playAudio(res.data.audio)
        } catch {}
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEnd = async () => {
    try { await endInterview({ session_id: sessionId }) } catch {}
    setIsCompleted(true)
  }

  if (!questions || !role) return null

  const p = PERSONA[role] || PERSONA.SWE

  // ── completion screen ──
  if (isCompleted) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0A0A0A] font-sans">
        <div className="text-center animate-fadeIn">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-8"
            style={{ backgroundColor: `${p.color}18`, border: `2px solid ${p.color}40` }}>
            🎉
          </div>
          <h1 className="text-white text-3xl font-bold mb-3">Interview Complete!</h1>
          <p className="text-white/40 text-base mb-10">Great work, {p.name} was impressed. Your report is ready.</p>
          <button
            onClick={() => navigate("/report", { state: { session_id: sessionId } })}
            className="px-10 py-4 text-white rounded-2xl font-bold text-base transition-all hover:-translate-y-px shadow-lg"
            style={{ backgroundColor: p.color, boxShadow: `0 12px 32px ${p.color}40` }}
          >
            View Full Report →
          </button>
        </div>
      </div>
    )
  }

  // ── active interview — split screen ──
  return (
    <div className="h-screen flex overflow-hidden font-sans">

      {/* LEFT — interviewer */}
      <div className="w-[45%] shrink-0 border-r border-white/5">
        <InterviewerSide
          role={role}
          question={currentQuestion}
          isLoading={isLoading}
          isProcessing={isProcessing}
        />
      </div>

      {/* RIGHT — your answer */}
      <div className="flex-1">
        <AnswerSide
          role={role}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          inputMode={inputMode}
          setInputMode={setInputMode}
          onSubmit={handleAnswer}
          onEnd={handleEnd}
          isLoading={isLoading}
          isProcessing={isProcessing}
          error={error}
          currentQuestion={currentQuestion}
          onRetry={initInterview}
        />
      </div>

    </div>
  )
}

export default Interview
