from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agent.evaluator import evaluate_session
from agent.report_builder import build_report
from services.db import get_session, delete_session

router = APIRouter()


class ReportRequest(BaseModel):
    session_id: str


@router.post("/generate")
async def generate_report(req: ReportRequest):
    session = get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["status"] != "completed":
        raise HTTPException(status_code=400, detail="Interview not completed yet")
    if not session["exchanges"]:
        raise HTTPException(status_code=400, detail="No answers found in session")

    evaluation = evaluate_session(
        exchanges=session["exchanges"],
        jd_text=session["jd_text"],
        role=session["role"]
    )

    report = build_report(
        evaluation=evaluation,
        role=session["role"],
        seniority=session["seniority"],
        jd_text=session["jd_text"]
    )

    delete_session(req.session_id)

    return report