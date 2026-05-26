import { useState } from "react"
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import Landing from "./pages/Landing"
import Setup from "./pages/Setup"
import Interview from "./pages/Interview"
import Report from "./pages/Report"
import { API_BASE_URL } from "./utils/constants"

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const AppInner = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("prepwise_user")) } catch { return null }
  })

  const handleCredentialResponse = async ({ credential }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential }),
      })
      if (!res.ok) throw new Error("Auth failed")
      const data = await res.json()
      localStorage.setItem("prepwise_user", JSON.stringify(data))
      setUser(data)
      navigate("/setup")
    } catch (err) {
      console.error("Google login failed:", err)
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Landing onCredentialResponse={handleCredentialResponse} clientId={CLIENT_ID} />} />
      <Route path="/setup" element={<Setup user={user} />} />
      <Route path="/interview" element={<Interview />} />
      <Route path="/report" element={<Report />} />
    </Routes>
  )
}

const App = () => (
  <BrowserRouter>
    <AppInner />
  </BrowserRouter>
)

export default App
