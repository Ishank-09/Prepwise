import json
from services.clients import ask_llm
from agent.personas import PERSONAS

def assess_answer(question: str, answer: str, role: str, conversation_history: list) -> dict:
    system_prompt = """You are an expert interview assessor. 
Assess the candidate's answer and return ONLY a valid JSON object, no extra text, no markdown."""

    user_prompt = f"""Assess this interview answer:

Question: {question}
Answer: {answer}

Previous conversation context:
{json.dumps(conversation_history[-6:], indent=2)}

Score the answer on confidence and quality (0-10) based on:
- Clarity of explanation (did they explain it simply and visually?)
- Confidence in delivery (filler words, hedging like "I think maybe", short vague answers)
- Use of real examples (backed up with actual experience?)
- Depth and intent (surface level vs genuinely knows the topic)
- Keyword relevance (used right terms naturally?)

Return ONLY this JSON:
{{
  "confidence_score": <0-10>,
  "weak_areas": ["...", "..."],
  "probe_focus": "one specific follow-up question targeting the weakest area"
}}"""

    full_response = ""
    for token in ask_llm(
        messages=[{"role": "user", "content": user_prompt}],
        system_prompt=system_prompt
    ):
        full_response += token

    return json.loads(full_response)


def get_next_action(
    questions: list,
    current_index: int,
    follow_up_count: int,
    confidence_score: int,
    is_last_question: bool
) -> str:
    if is_last_question and follow_up_count >= 3:
        return "end_interview"
    if confidence_score >= 7:
        return "next_question"
    if confidence_score >= 5 and follow_up_count >= 1:
        return "next_question"
    if follow_up_count >= 3:
        return "next_question"
    return "probe"


def generate_followup(probe_focus: str, persona_system_prompt: str, conversation_history: list) -> str:
    user_prompt = f"""Based on the conversation so far, ask this follow-up naturally as the interviewer:
Focus: {probe_focus}

Keep it short, natural, one sentence only. Do not repeat the original question."""

    full_response = ""
    for token in ask_llm(
        messages=conversation_history + [{"role": "user", "content": user_prompt}],
        system_prompt=persona_system_prompt
    ):
        full_response += token

    return full_response


def run_interview_turn(
    session: dict,
    candidate_answer: str,
    role: str
) -> dict:
    persona = PERSONAS[role]
    questions = session["questions"]
    current_index = session["current_index"]
    follow_up_count = session["follow_up_count"]
    conversation_history = session["conversation_history"]
    current_question = session["current_question"]
    is_last_question = current_index == len(questions) - 1

    # store answer in history
    conversation_history.append({
        "role": "user",
        "content": candidate_answer
    })

    # assess the answer
    assessment = assess_answer(
        question=current_question,
        answer=candidate_answer,
        role=role,
        conversation_history=conversation_history
    )

    confidence_score = assessment["confidence_score"]
    weak_areas = assessment["weak_areas"]
    probe_focus = assessment["probe_focus"]

    # store full exchange
    session["exchanges"].append({
        "question": current_question,
        "answer": candidate_answer,
        "confidence_score": confidence_score,
        "weak_areas": weak_areas,
        "follow_up_count": follow_up_count
    })

    # decide next action
    action = get_next_action(
        questions=questions,
        current_index=current_index,
        follow_up_count=follow_up_count,
        confidence_score=confidence_score,
        is_last_question=is_last_question
    )

    if action == "end_interview":
        session["status"] = "completed"
        return {
            "status": "completed",
            "message": "That wraps up our interview. Thank you for your time!",
            "session": session
        }

    elif action == "next_question":
        next_index = current_index + 1
        if next_index >= len(questions):
            session["status"] = "completed"
            return {
                "status": "completed",
                "message": "That wraps up our interview. Thank you for your time!",
                "session": session
            }
        next_question = questions[next_index]["question"]
        session["current_index"] = next_index
        session["current_question"] = next_question
        session["follow_up_count"] = 0
        conversation_history.append({
            "role": "assistant",
            "content": next_question
        })
        return {
            "status": "next_question",
            "question": next_question,
            "question_number": next_index + 1,
            "session": session
        }

    else:  # probe
        followup = generate_followup(
            probe_focus=probe_focus,
            persona_system_prompt=persona["system_prompt"],
            conversation_history=conversation_history
        )
        session["follow_up_count"] = follow_up_count + 1
        conversation_history.append({
            "role": "assistant",
            "content": followup
        })
        return {
            "status": "follow_up",
            "question": followup,
            "question_number": current_index + 1,
            "session": session
        }


def start_interview(questions: list, role: str) -> dict:
    persona = PERSONAS[role]
    first_question = questions[0]["question"]

    session = {
        "role": role,
        "questions": questions,
        "current_index": 0,
        "current_question": first_question,
        "follow_up_count": 0,
        "status": "active",
        "exchanges": [],
        "conversation_history": [
            {"role": "assistant", "content": persona["intro"]},
            {"role": "assistant", "content": first_question}
        ]
    }

    return {
        "status": "started",
        "intro": persona["intro"],
        "question": first_question,
        "question_number": 1,
        "session": session
    }