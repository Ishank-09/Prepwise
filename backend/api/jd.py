import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.pdf_parser import parse_pdf
from agent.question_generator import generate_questions

router = APIRouter()

ALLOWED_TYPES = ["application/pdf", "text/plain"]

@router.post("/upload")
async def upload_jd(
    file: UploadFile = File(...),
    role: str = Form(...),
    seniority: str = Form(...)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF or text files allowed")

    file_bytes = await file.read()

    if file.content_type == "application/pdf":
        jd_text = parse_pdf(file_bytes)
    else:
        jd_text = file_bytes.decode("utf-8")

    if not jd_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file")

    questions = generate_questions(
        jd_text=jd_text,
        role=role,
        seniority=seniority
    )

    return {
        "jd_text": jd_text,
        "questions": questions,
        "total_questions": len(questions)
    }