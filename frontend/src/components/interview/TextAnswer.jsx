import { useState } from "react"

const MIN_WORDS = 20

const TextAnswer = ({ onSubmit, disabled }) => {
  const [answer, setAnswer] = useState("")
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length

  const handleSubmit = () => {
    if (wordCount < MIN_WORDS) return
    onSubmit(answer)
    setAnswer("")
  }

  return (
    <div className="w-full">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={disabled}
        placeholder="Type your answer here..."
        className="w-full h-36 bg-white/5 text-white text-sm rounded-xl p-4 resize-none outline-none border border-white/10 focus:border-accent transition disabled:opacity-40 placeholder-[#4A5568]"
      />
      <div className="flex items-center justify-between mt-2">
        <p className={`text-xs ${wordCount < MIN_WORDS ? "text-[#64748B]" : "text-green-400"}`}>
          {wordCount} words {wordCount < MIN_WORDS ? `(min ${MIN_WORDS})` : "✓"}
        </p>
        <button
          onClick={handleSubmit}
          disabled={disabled || wordCount < MIN_WORDS}
          className="py-2 px-6 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition"
        >
          Submit →
        </button>
      </div>
    </div>
  )
}

export default TextAnswer
