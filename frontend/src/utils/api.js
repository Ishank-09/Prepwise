import axios from "axios"
import { API_BASE_URL } from "./constants"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
})

// JD
export const uploadJD = (formData) =>
  api.post("/jd/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })

// Interview
export const startInterview = (data) =>
  api.post("/interview/start", data)

export const nextTurn = (data) =>
  api.post("/interview/next", data)

export const endInterview = (data) =>
  api.post("/interview/end", data)

// Report
export const generateReport = (data) =>
  api.post("/report/generate", data)