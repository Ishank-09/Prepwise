import useTypewriter from "../../hooks/useTypewriter"

const QuestionDisplay = ({ question, questionNumber, totalQuestions }) => {
  const { displayedText, isDone } = useTypewriter(question, 30)

  return (
    <div className="w-full">

      {/* Question number */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500 font-medium">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-xs text-gray-500">
          {Math.round((questionNumber / totalQuestions) * 100)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-800 rounded-full mb-6">
        <div
          className="h-1 bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question text */}
      <div className="bg-gray-900 rounded-2xl p-6 min-h-32">
        <p className="text-white text-lg leading-relaxed">
          {displayedText}
          {!isDone && (
            <span className="inline-block w-0.5 h-5 bg-indigo-400 ml-1 animate-pulse" />
          )}
        </p>
      </div>

    </div>
  )
}

export default QuestionDisplay