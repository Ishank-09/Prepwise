import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import RadarChartComponent from "../components/report/RadarChart"
import QuestionFeedback from "../components/report/QuestionFeedback"
import { generateReport } from "../utils/api"
import useDarkMode from "../hooks/useDarkMode"

const RECOMMENDATION_STYLES = {
  "Strong Yes": { bg: "bg-green-50 dark:bg-green-500/10", text: "text-green-600 dark:text-green-400", border: "border-green-200 dark:border-green-500/20" },
  "Yes": { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-500/20" },
  "Maybe": { bg: "bg-yellow-50 dark:bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-200 dark:border-yellow-500/20" },
  "No": { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-500/20" }
}

const Report = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleDark } = useDarkMode()

  const { session_id } = location.state || {}

  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!session_id) {
      navigate("/setup")
      return
    }
    fetchReport()
  }, [])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const res = await generateReport({ session_id })
      setReport(res.data)
    } catch (err) {
      setError("Failed to generate report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!session_id) return null

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#0F172A] dark:text-white font-sans transition-colors duration-300">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA]/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1F1F1F]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="font-semibold text-base">PrepWise</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#F1F5F9] dark:bg-[#1F1F1F] hover:bg-[#E2E8F0] dark:hover:bg-[#2A2A2A] transition"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => navigate("/setup")}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition"
            >
              New Interview →
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-[#64748B] dark:text-[#A1A1AA] text-sm">Generating your report...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchReport}
              className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Report */}
        {report && !isLoading && (
          <div className="space-y-6">

            {/* Header */}
            <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#1F1F1F] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Interview Report</h1>
                  <p className="text-[#64748B] dark:text-[#A1A1AA] text-sm">
                    {report.role} · {report.seniority}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl border font-semibold text-sm ${
                  RECOMMENDATION_STYLES[report.hiring_recommendation].bg
                } ${
                  RECOMMENDATION_STYLES[report.hiring_recommendation].text
                } ${
                  RECOMMENDATION_STYLES[report.hiring_recommendation].border
                }`}>
                  {report.hiring_recommendation}
                </div>
              </div>

              {/* Overall score */}
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-accent">
                  {report.overall_weighted_score}
                  <span className="text-2xl text-[#64748B] dark:text-[#A1A1AA] font-normal">/10</span>
                </div>
                <div className="flex-1">
                  <div className="w-full h-2 bg-[#F1F5F9] dark:bg-[#1F1F1F] rounded-full">
                    <div
                      className="h-2 bg-accent rounded-full transition-all duration-700"
                      style={{ width: `${report.overall_weighted_score * 10}%` }}
                    />
                  </div>
                  <p className="text-[#64748B] dark:text-[#A1A1AA] text-xs mt-1">Overall Score</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[#E2E8F0] dark:border-[#1F1F1F]">
              {["overview", "questions"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-accent text-accent"
                      : "border-transparent text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  {tab === "overview" ? "Overview" : "Question Breakdown"}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">

                {/* Radar chart */}
                <RadarChartComponent radarData={report.radar_data} />

                {/* Strengths + Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#1F1F1F] rounded-2xl p-6">
                    <h3 className="font-semibold text-sm mb-4 text-green-600 dark:text-green-400">
                      ✓ Top Strengths
                    </h3>
                    <ul className="space-y-2">
                      {report.overall_feedback.top_strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#64748B] dark:text-[#A1A1AA]">
                          <span className="text-green-500 mt-0.5">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#1F1F1F] rounded-2xl p-6">
                    <h3 className="font-semibold text-sm mb-4 text-red-500 dark:text-red-400">
                      ✗ Areas to Improve
                    </h3>
                    <ul className="space-y-2">
                      {report.overall_feedback.top_weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#64748B] dark:text-[#A1A1AA]">
                          <span className="text-red-400 mt-0.5">•</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Improvement suggestions */}
                <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#1F1F1F] rounded-2xl p-6">
                  <h3 className="font-semibold text-sm mb-4">→ Improvement Suggestions</h3>
                  <ul className="space-y-2">
                    {report.overall_feedback.improvement_suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#64748B] dark:text-[#A1A1AA]">
                        <span className="text-accent mt-0.5">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Communication pattern */}
                <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#1F1F1F] rounded-2xl p-6">
                  <h3 className="font-semibold text-sm mb-3">Communication Pattern</h3>
                  <p className="text-sm text-[#64748B] dark:text-[#A1A1AA] leading-relaxed">
                    {report.overall_feedback.communication_pattern}
                  </p>
                </div>

                {/* Overall summary */}
                <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#1F1F1F] rounded-2xl p-6">
                  <h3 className="font-semibold text-sm mb-3">Overall Summary</h3>
                  <p className="text-sm text-[#64748B] dark:text-[#A1A1AA] leading-relaxed">
                    {report.overall_feedback.overall_summary}
                  </p>
                </div>

              </div>
            )}

            {/* Questions tab */}
            {activeTab === "questions" && (
              <div>
                {report.questions_feedback.map((q, i) => (
                  <QuestionFeedback
                    key={i}
                    questionData={q}
                    index={i}
                  />
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

export default Report