from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.google_auth import verify_google_token
from services.db import get_or_create_user

router = APIRouter()


class GoogleAuthRequest(BaseModel):
    token: str


@router.post("/google")
async def google_login(req: GoogleAuthRequest):
    user_info = verify_google_token(req.token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    user = get_or_create_user(user_info)
    return {
        "user_id": user["google_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user["picture"]
    }