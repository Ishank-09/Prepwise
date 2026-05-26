export const ROLES = [
  { value: "SWE", label: "Software Engineering" },
  { value: "DS_ML", label: "Data Science / ML" },
  { value: "PM", label: "Product Management" },
  { value: "Design", label: "Design" }
]

export const SENIORITY_LEVELS = [
  { value: "Fresher", label: "Fresher (0 years)" },
  { value: "Junior", label: "Junior (1-3 years)" },
  { value: "Mid-level", label: "Mid-level (3-5 years)" },
  { value: "Senior", label: "Senior (5-8 years)" },
  { value: "Lead", label: "Lead (8+ years)" }
]

export const PERSONA_NAMES = {
  SWE: "Alex",
  DS_ML: "Priya",
  PM: "Jordan",
  Design: "Sam"
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"