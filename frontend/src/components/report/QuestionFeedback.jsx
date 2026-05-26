const ScoreBar = ({ label, score }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs text-gray-400 mb-1">
      <span>{label}</span>
      <span>{score}/10</span>
    </div>
    <div className="w-full h-1.5 bg-gray-800 rounded-full">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${
          score >= 7 ? "bg-green-500" :
          score >= 5 ? "bg-yellow-500" :
          "bg-red-500"
        }`}
        style={{ width: `${score * 10}%` }}
      />
    </div>
  </div>
)

const QuestionFeedback = ({ questionData, index }) => {
  const { question, answer, scores, weighted_score, feedback, follow_up_count } = questionData

  return (
    <div className="bg-gray-900 rounded-2xl p-6 mb-4">

      {/* Question header */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-indigo-400 font-medium">Q{index + 1}</span>
        <div className="flex items-center gap-2">
          {follow_up_count > 0 && (
            <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">
              {follow_up_count} follow-up{follow_up_count > 1 ? "s" : ""}
            </span>
          )}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            weighted_score >= 7 ? "bg-green-500/10 text-green-400" :
            weighted_score >= 5 ? "bg-yellow-500/10 text-yellow-400" :
            "bg-red-500/10 text-red-400"
          }`}>
            {weighted_score}/10
          </span>
        </div>
      </div>

      {/* Question */}
      <p className="text-white font-medium mb-2">{question}</p>

      {/* Answer */}
      <p className="text-gray-400 text-sm mb-4 leading-relaxed">{answer}</p>

      {/* Score bars */}
      <div className="mb-4">
        <ScoreBar label="Relevance to JD" score={scores.relevance_to_jd} />
        <ScoreBar label="Technical Depth" score={scores.technical_depth} />
        <ScoreBar label="Communication Clarity" score={scores.communication_clarity} />
        <ScoreBar label="Structure of Answer" score={scores.structure_of_answer} />
        <ScoreBar label="Confidence & Completeness" score={scores.confidence_completeness} />
      </div>

      {/* Feedback */}
      <div className="space-y-3">
        <div className="bg-green-500/10 rounded-xl p-3">
          <p className="text-xs text-green-400 font-medium mb-1">✓ What went well</p>
          <p className="text-gray-300 text-sm">{feedback.what_went_well}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-3">
          <p className="text-xs text-red-400 font-medium mb-1">✗ What was missing</p>
          <p className="text-gray-300 text-sm">{feedback.what_was_missing}</p>
        </div>
        <div className="bg-indigo-500/10 rounded-xl p-3">
          <p className="text-xs text-indigo-400 font-medium mb-1">→ How to improve</p>
          <p className="text-gray-300 text-sm">{feedback.how_to_improve}</p>
        </div>
      </div>

    </div>
  )
}

export default QuestionFeedback