import json
from services.clients import ask_llm


HIRING_RECOMMENDATION = {
    (8, 10): "Strong Yes",
    (6, 7.9): "Yes",
    (4, 5.9): "Maybe",
    (0, 3.9): "No"
}


def get_hiring_recommendation(score: float) -> str:
    for (low, high), recommendation in HIRING_RECOMMENDATION.items():
        if low <= score <= high:
            return recommendation
    return "No"


def generate_question_feedback(question: str, answer: str, scores: dict, weak_areas: list, role: str) -> dict:
    system_prompt = """You are an expert interview coach giving constructive feedback.
Return ONLY a valid JSON object, no extra text, no markdown."""

    user_prompt = f"""Give feedback on this interview answer:

Role: {role}
Question: {question}
Candidate Answer: {answer}
Weak Areas: {weak_areas}
Scores: {json.dumps(scores, indent=2)}

Return ONLY this JSON:
{{
    "what_went_well": "specific positive feedback in 1-2 sentences",
    "what_was_missing": "specific gaps in 1-2 sentences",
    "how_to_improve": "concrete actionable guidance in 2-3 sentences, not a script — focus on approach, examples, tradeoffs they could have mentioned"
}}"""

    full_response = ""
    for token in ask_llm(
        messages=[{"role": "user", "content": user_prompt}],
        system_prompt=system_prompt
    ):
        full_response += token

    return json.loads(full_response)


def generate_overall_feedback(evaluated_questions: list, overall_scores: dict, role: str) -> dict:
    system_prompt = """You are an expert interview coach giving overall interview feedback.
Return ONLY a valid JSON object, no extra text, no markdown."""

    summary_data = [
        {
            "question": q["question"],
            "weighted_score": q["weighted_score"],
            "weak_areas": q["weak_areas"]
        }
        for q in evaluated_questions
    ]

    user_prompt = f"""Give overall feedback for this {role} interview:

Overall Scores: {json.dumps(overall_scores, indent=2)}
Question Summaries: {json.dumps(summary_data, indent=2)}

Return ONLY this JSON:
{{
    "top_strengths": ["strength 1", "strength 2", "strength 3"],
    "top_weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
    "improvement_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
    "communication_pattern": "one sentence on how candidate communicated throughout — did they improve, decline, or stay consistent?",
    "overall_summary": "2-3 sentence honest summary of the candidate's performance"
}}"""

    full_response = ""
    for token in ask_llm(
        messages=[{"role": "user", "content": user_prompt}],
        system_prompt=system_prompt
    ):
        full_response += token

    return json.loads(full_response)


def build_report(evaluation: dict, role: str, seniority: str, jd_text: str) -> dict:
    evaluated_questions = evaluation["evaluated_questions"]
    overall_scores = evaluation["overall_scores"]
    overall_weighted_score = evaluation["overall_weighted_score"]

    # per question feedback
    questions_feedback = []
    for q in evaluated_questions:
        feedback = generate_question_feedback(
            question=q["question"],
            answer=q["answer"],
            scores=q["scores"],
            weak_areas=q["weak_areas"],
            role=role
        )
        questions_feedback.append({
            "question": q["question"],
            "answer": q["answer"],
            "scores": q["scores"],
            "weighted_score": q["weighted_score"],
            "follow_up_count": q["follow_up_count"],
            "feedback": feedback
        })

    # overall feedback
    overall_feedback = generate_overall_feedback(
        evaluated_questions=evaluated_questions,
        overall_scores=overall_scores,
        role=role
    )

    # radar chart data
    radar_data = {
        "Relevance to JD": overall_scores["relevance_to_jd"],
        "Technical Depth": overall_scores["technical_depth"],
        "Communication Clarity": overall_scores["communication_clarity"],
        "Structure of Answer": overall_scores["structure_of_answer"],
        "Confidence & Completeness": overall_scores["confidence_completeness"]
    }

    hiring_recommendation = get_hiring_recommendation(overall_weighted_score)

    return {
        "role": role,
        "seniority": seniority,
        "overall_weighted_score": overall_weighted_score,
        "hiring_recommendation": hiring_recommendation,
        "radar_data": radar_data,
        "overall_feedback": overall_feedback,
        "questions_feedback": questions_feedback
    }