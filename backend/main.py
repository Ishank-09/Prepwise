import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from api.jd import router as jd_router
from api.interview import router as interview_router
from api.report import router as report_router

load_dotenv()

app = FastAPI(title="PrepWise AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(jd_router, prefix="/jd")
app.include_router(interview_router, prefix="/interview")
app.include_router(report_router, prefix="/report")

@app.get("/")
def root():
    return {"status": "PrepWise AI backend is running"}