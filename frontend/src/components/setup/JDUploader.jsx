import { useState } from "react"

const JDUploader = ({ onComplete }) => {
  const [uploadType, setUploadType] = useState("file")
  const [file, setFile] = useState(null)
  const [pastedText, setPastedText] = useState("")
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    const allowed = ["application/pdf", "text/plain"]
    if (!allowed.includes(selected.type)) {
      setError("Only PDF or .txt files are accepted")
      setFile(null)
      return
    }
    setError(null)
    setFile(selected)
  }

  const handleNext = () => {
    if (uploadType === "file" && !file) {
      setError("Please upload a file")
      return
    }
    if (uploadType === "text" && !pastedText.trim()) {
      setError("Please paste your job description")
      return
    }
    onComplete({ file, pastedText, uploadType })
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-1">
        Upload Job Description
      </h2>
      <p className="text-[#64748B] dark:text-[#94A3B8] text-sm mb-8">
        Upload the PDF or paste the JD text so we can generate tailored questions.
      </p>

      {/* Toggle */}
      <div className="flex gap-2 p-1 bg-[#F1F5F9] dark:bg-[#1A1A1A] rounded-xl mb-6">
        {[["file", "Upload File"], ["text", "Paste Text"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setUploadType(val); setError(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              uploadType === val
                ? "bg-white dark:bg-[#2A2A2A] text-[#0F172A] dark:text-white shadow-sm"
                : "text-[#64748B] dark:text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* File upload */}
      {uploadType === "file" && (
        <div
          onClick={() => document.getElementById("jd-file").click()}
          className="border-2 border-dashed border-[#E2E8F0] dark:border-[#2A2A2A] hover:border-accent dark:hover:border-accent rounded-2xl p-10 text-center cursor-pointer transition group"
        >
          <input
            id="jd-file"
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          {file ? (
            <div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📄</span>
              </div>
              <p className="text-accent font-semibold text-sm">{file.name}</p>
              <p className="text-[#94A3B8] text-xs mt-1">Click to change</p>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 bg-[#F1F5F9] dark:bg-[#1A1A1A] rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/10 transition">
                <span className="text-2xl">📁</span>
              </div>
              <p className="text-[#0F172A] dark:text-white font-medium text-sm">Click to upload PDF or TXT</p>
              <p className="text-[#94A3B8] text-xs mt-1">Max 10 MB</p>
            </div>
          )}
        </div>
      )}

      {/* Paste text */}
      {uploadType === "text" && (
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste the full job description here..."
          className="w-full h-52 bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[#0F172A] dark:text-white text-sm rounded-2xl p-4 resize-none outline-none border border-[#E2E8F0] dark:border-[#2A2A2A] focus:border-accent transition placeholder-[#94A3B8]"
        />
      )}

      {error && (
        <p className="text-red-500 text-sm mt-3">{error}</p>
      )}

      <button
        onClick={handleNext}
        className="w-full mt-6 py-3.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold text-sm transition"
      >
        Continue →
      </button>
    </div>
  )
}

export default JDUploader
