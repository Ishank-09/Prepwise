import os
import uuid
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017"))
db = client["prepwise"]
sessions_collection = db["sessions"]


def create_session(role: str, seniority: str, jd_text: str, questions: list) -> str:
    session_id = str(uuid.uuid4())
    session = {
        "session_id": session_id,
        "role": role,
        "seniority": seniority,
        "jd_text": jd_text,
        "status": "active",
        "questions": questions,
        "exchanges": [],
        "conversation_history": [],
        "current_index": 0,
        "current_question": questions[0]["question"],
        "follow_up_count": 0
    }
    sessions_collection.insert_one(session)
    return session_id


def get_session(session_id: str) -> dict:
    session = sessions_collection.find_one(
        {"session_id": session_id},
        {"_id": 0}
    )
    return session


def update_session(session_id: str, updated_session: dict) -> None:
    updated_session.pop("_id", None)
    sessions_collection.update_one(
        {"session_id": session_id},
        {"$set": updated_session}
    )


def delete_session(session_id: str) -> None:
    sessions_collection.delete_one({"session_id": session_id})