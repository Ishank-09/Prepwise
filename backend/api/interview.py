from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from agent.interviewer import start_interview, run_interview_turn
from agent.personas import PERSONAS
from services.clients import speak
from services.db import create_session, get_session, update_session, delete_session

router = APIRouter()


class StartRequest(BaseModel):
    role: str
    seniority: str
    jd_text: str
    questions: list


class AnswerRequest(BaseModel):
    session_id: str
    answer: str


class EndRequest(BaseModel):
    session_id: str


@router.post("/start")
async def start(req: StartRequest):
    result = start_interview(
        questions=req.questions,
        role=req.role
    )

    session_id = create_session(
        role=req.role,
        seniority=req.seniority,
        jd_text=req.jd_text,
        questions=req.questions
    )

    try:
        audio_bytes = speak(result["intro"] + " " + result["question"])
        audio_hex = audio_bytes.hex()
    except Exception:
        audio_hex = None

    return {
        "session_id": session_id,
        "intro": result["intro"],
        "question": result["question"],
        "question_number": 1,
        "total_questions": len(req.questions),
        "audio": audio_hex
    }


@router.post("/next")
async def next_turn(req: AnswerRequest):
    session = get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["status"] == "completed":
        raise HTTPException(status_code=400, detail="Interview already completed")

    result = run_interview_turn(
        session=session,
        candidate_answer=req.answer,
        role=session["role"]
    )

    update_session(req.session_id, result["session"])

    if result["status"] == "completed":
        return {
            "status": "completed",
            "message": result["message"]
        }

    try:
        audio_hex = speak(result["question"]).hex()
    except Exception:
        audio_hex = None

    return {
        "status": result["status"],
        "question": result["question"],
        "question_number": result["question_number"],
        "total_questions": len(session["questions"]),
        "audio": audio_hex
    }


@router.post("/end")
async def end_interview(req: EndRequest):
    session = get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session["status"] = "completed"
    update_session(req.session_id, session)

    return {
        "status": "completed",
        "session_id": req.session_id,
        "message": "Interview ended successfully"
    }