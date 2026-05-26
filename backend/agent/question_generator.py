import json
from services.clients import ask_llm

SENIORITY_DIFFICULTY = {
    "Fresher": "mostly easy questions, some medium, no hard",
    "Junior": "mix of easy and medium questions, minimal hard",
    "Mid-level": "mostly medium questions, some hard",
    "Senior": "mix of medium and hard questions, minimal easy",
    "Lead": "mostly hard questions, some medium, no easy"
}

def generate_questions(jd_text: str, role: str, seniority: str) -> list:
    difficulty_instruction = SENIORITY_DIFFICULTY.get(seniority, "mix of easy and medium")

    system_prompt = f"""You are an expert technical interviewer generating interview questions.
You must return ONLY a valid JSON array with exactly 20 question objects.
No explanation, no markdown, no extra text — just the raw JSON array.
"""

    user_prompt = f"""Generate exactly 20 interview questions based on this Job Description for a {role} role at {seniority} level.

Job Description:
{jd_text}

Question distribution:
- 10 technical questions (strictly based on skills, tools, and requirements mentioned in the JD)
- 5 role-specific questions (based on the {role} role responsibilities)
- 5 behavioural questions (situational, past experience based)

Difficulty level: {difficulty_instruction}

Return a JSON array of exactly 20 objects. Each object must have:
- "question": the interview question string
- "topic": the subject area (e.g. "React", "System Design", "Leadership")
- "type": one of "technical", "role_specific", "behavioural"
- "difficulty": one of "easy", "medium", "hard"

Example format:
[
  {{
    "question": "Explain how virtual DOM works in React.",
    "topic": "React",
    "type": "technical",
    "difficulty": "medium"
  }}
]
"""

    full_response = ""
    for token in ask_llm(
        messages=[{"role": "user", "content": user_prompt}],
        system_prompt=system_prompt
    ):
        full_response += token

    questions = json.loads(full_response)
    return questions