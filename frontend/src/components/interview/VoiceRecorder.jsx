import { useState, useEffect } from "react"
import useVoiceInput from "../../hooks/useVoiceInput"
import { API_BASE_URL } from "../../utils/constants"

const VoiceRecorder = ({ onSubmit, disabled }) => {
  const { isRecording, audioBlob, error, startRecording, stopRecording } = useVoiceInput()
  const [transcript, setTranscript] = useState("")
  const [stage, setStage] = useState("idle") // idle | recording | processing | done

  useEffect(() => {
    if (audioBlob) {
      transcribeAudio(audioBlob)
    }
  }, [audioBlob])

  const handleStart = async () => {
    setStage("recording")
    await startRecording()
  }

  const handleStop = () => {
    stopRecording()
    // useEffect will pick up audioBlob and move to "processing"
  }

  const transcribeAudio = async (blob) => {
    setStage("processing")
    try {
      const formData = new FormData()
      formData.append("audio", blob, "recording.webm")
      const res = await fetch(`${API_BASE_URL}/interview/transcribe`, {
        method: "POST",
        body: formData
      })
      if (!res.ok) throw new Error("Transcription failed")
      const data = await res.json()
      if (!data.transcript?.trim()) throw new Error("Empty transcript")
      setTranscript(data.transcript)
      setStage("done")
    } catch {
      setStage("idle")
    }
  }

  const handleSubmit = () => {
    if (!transcript.trim()) return
    onSubmit(transcript)
    setTranscript("")
    setStage("idle")
  }

  const handleRetry = () => {
    setTranscript("")
    setStage("idle")
  }

  return (
    <div className="w-full">

      {stage === "idle" && (
        <button
          onClick={handleStart}
          disabled={disabled}
          className="w-full py-5 bg-accent hover:bg-accent-hover disabled:opacity-40 rounded-2xl font-semibold text-white flex items-center justify-center gap-3 transition text-base"
        >
          <span className="text-xl">🎙️</span> Click to Speak
        </button>
      )}

      {stage === "recording" && (
        <button
          onClick={handleStop}
          className="w-full py-5 bg-red-600 hover:bg-red-500 rounded-2xl font-semibold text-white flex items-center justify-center gap-3 transition text-base"
        >
          <span className="w-3 h-3 rounded-sm bg-white animate-pulse" />
          Recording — Click to Stop
        </button>
      )}

      {stage === "processing" && (
        <div className="w-full py-5 bg-white/5 rounded-2xl text-center text-[#94A3B8] flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          Transcribing your answer...
        </div>
      )}

      {stage === "done" && (
        <div className="w-full">
          <label className="text-xs text-[#64748B] mb-2 block">
            Your answer — edit if needed
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full h-32 bg-white/5 text-white text-sm rounded-xl p-4 resize-none outline-none border border-white/10 focus:border-accent transition"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleRetry}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-[#94A3B8] rounded-xl text-sm font-medium transition"
            >
              🔄 Re-record
            </button>
            <button
              onClick={handleSubmit}
              disabled={transcript.trim().split(/\s+/).filter(Boolean).length < 3}
              className="flex-1 py-3 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white rounded-xl text-sm font-medium transition"
            >
              Submit Answer →
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}

    </div>
  )
}

export default VoiceRecorder
