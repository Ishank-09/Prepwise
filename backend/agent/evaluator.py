import json
from services.clients import ask_llm

RUBRIC = {
    "relevance_to_jd": 25,
    "technical_depth": 25,
    "communication_clarity": 20,
    "structure_of_answer": 15,
    "confidence_completeness": 15
}

def score_answer(question: str, answer: str, jd_text: str, role: str, confidence_score: int) -> dict:
    system_prompt = """You are an expert interview evaluator.
Evaluate the candidate's answer and return ONLY a valid JSON object, no extra text, no markdown."""

    user_prompt = f"""Evaluate this interview answer strictly based on the rubric below.

Role: {role}
Job Description: {jd_text}

Question: {question}
Candidate Answer: {answer}
Confidence Score (already assessed): {confidence_score}/10

Score each dimension from 0-10:
1. relevance_to_jd — how relevant is the answer to the JD requirements?
2. technical_depth — how deep and accurate is the technical content?
3. communication_clarity — how clearly and simply did they explain?
4. structure_of_answer — was the answer well structured and logical?
5. confidence_completeness — how confident and complete was the answer? (use the provided confidence score as a strong signal)

Return ONLY this JSON:
{{
    "relevance_to_jd": <0-10>,
    "technical_depth": <0-10>,
    "communication_clarity": <0-10>,
    "structure_of_answer": <0-10>,
    "confidence_completeness": <0-10>
}}"""

    full_response = ""
    for token in ask_llm(
        messages=[{"role": "user", "content": user_prompt}],
        system_prompt=system_prompt
    ):
        full_response += token

    scores = json.loads(full_response)
    return scores


def calculate_weighted_score(scores: dict) -> float:
    weights = {
        "relevance_to_jd": 0.25,
        "technical_depth": 0.25,
        "communication_clarity": 0.20,
        "structure_of_answer": 0.15,
        "confidence_completeness": 0.15
    }
    weighted = sum(scores[dim] * weights[dim] for dim in weights)
    return round(weighted, 2)


def evaluate_session(exchanges: list, jd_text: str, role: str) -> dict:
    evaluated_questions = []
    overall_scores = {
        "relevance_to_jd": 0,
        "technical_depth": 0,
        "communication_clarity": 0,
        "structure_of_answer": 0,
        "confidence_completeness": 0
    }

    for exchange in exchanges:
        scores = score_answer(
            question=exchange["question"],
            answer=exchange["answer"],
            jd_text=jd_text,
            role=role,
            confidence_score=exchange["confidence_score"]
        )

        weighted_score = calculate_weighted_score(scores)

        evaluated_questions.append({
            "question": exchange["question"],
            "answer": exchange["answer"],
            "scores": scores,
            "weighted_score": weighted_score,
            "weak_areas": exchange["weak_areas"],
            "follow_up_count": exchange["follow_up_count"]
        })

        for dim in overall_scores:
            overall_scores[dim] += scores[dim]

    total_questions = len(exchanges)
    for dim in overall_scores:
        overall_scores[dim] = round(overall_scores[dim] / total_questions, 2)

    overall_weighted = calculate_weighted_score(overall_scores)

    return {
        "evaluated_questions": evaluated_questions,
        "overall_scores": overall_scores,
        "overall_weighted_score": overall_weighted
    }