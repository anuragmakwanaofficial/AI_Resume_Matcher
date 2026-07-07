"""
Resume–JD Matcher Service

Uses HuggingFace Inference API (Mistral-7B) to:
1. Identify required skills from the JD
2. Match those skills against the resume
3. Compute an overall match score
4. Generate narrative summary and improvement suggestions

Falls back gracefully to keyword-overlap heuristic if LLM is unavailable.
"""
from __future__ import annotations

import json
import logging
import re
import time
import random
from typing import Any, Dict, List, Optional

from ..config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Prompt Template
# ---------------------------------------------------------------------------

_MATCH_PROMPT = """\
[INST] You are an expert AI recruitment analyst. Your task is to analyze how well a candidate's resume matches a job description.

=== JOB DESCRIPTION ===
{jd_text}

=== CANDIDATE RESUME ===
{resume_text}

Analyze the match and respond ONLY with a valid JSON object in EXACTLY this format (no markdown, no extra text):
{{
  "overall_score": <integer 0-100>,
  "narrative": "<2-3 sentence summary of the candidate's fit for this role>",
  "suggestions": [
    "<specific improvement suggestion 1>",
    "<specific improvement suggestion 2>",
    "<specific improvement suggestion 3>"
  ],
  "matched_skills": {{
    "must_have": ["<skill1>", "<skill2>"],
    "nice_to_have": ["<skill1>", "<skill2>"]
  }},
  "missing_skills": {{
    "must_have": ["<skill1>", "<skill2>"],
    "nice_to_have": ["<skill1>", "<skill2>"]
  }}
}}

Rules:
- overall_score must be an integer between 0 and 100
- Be specific about skills — use the exact terms from the JD
- must_have = required/essential skills; nice_to_have = preferred/bonus skills
- matched_skills = skills found in BOTH the JD and resume
- missing_skills = skills mentioned in JD but NOT found in resume
- suggestions = actionable ways to improve the resume for this specific JD
- If a category has no skills, use an empty array []
- Output ONLY the JSON object. No explanation. No markdown. [/INST]"""


# ---------------------------------------------------------------------------
# HuggingFace API Helper
# ---------------------------------------------------------------------------

def _call_hf_api(prompt: str, max_new_tokens: int, temperature: float, retries: int = 2) -> str:
    """Call the HuggingFace Inference API."""
    if not settings.HF_API_KEY or settings.HF_API_KEY == "hf_YOUR_TOKEN_HERE":
        raise RuntimeError("HF_API_KEY not configured in .env")

    from huggingface_hub import InferenceClient

    client = InferenceClient(
        model=settings.HF_MODEL_ID,
        token=settings.HF_API_KEY
    )

    messages = [{"role": "user", "content": prompt}]

    for attempt in range(retries + 1):
        try:
            response = client.text_generation(
                prompt,
                max_new_tokens=max_new_tokens,
                temperature=temperature,
                seed=random.randint(1, 100000)
            )
            return response.strip()
        except Exception as exc:
            if attempt == retries:
                raise RuntimeError(f"HF API request failed after {retries+1} attempts: {exc}") from exc
            logger.warning("HF query failed (attempt %d): %s. Retrying in 3s...", attempt + 1, exc)
            time.sleep(3)

    raise RuntimeError("HF API: exhausted retries")


# ---------------------------------------------------------------------------
# JSON Extraction Helper
# ---------------------------------------------------------------------------

def _extract_json(text: str) -> Dict[str, Any]:
    """Extract first valid JSON object from LLM response."""
    # Strip markdown code fences
    text = re.sub(r"```(?:json)?", "", text).strip()
    text = re.sub(r"```", "", text).strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to find JSON block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"No valid JSON found in LLM response: {text[:300]!r}")


# ---------------------------------------------------------------------------
# Heuristic Fallback
# ---------------------------------------------------------------------------

_COMMON_TECH_SKILLS = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "Django", "Flask",
    "FastAPI", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes",
    "AWS", "Azure", "GCP", "Git", "REST API", "GraphQL", "HTML", "CSS", "Linux",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn",
    "NLP", "Data Analysis", "Pandas", "NumPy", "Excel", "Power BI", "Tableau",
    "Agile", "Scrum", "CI/CD", "Jenkins", "Terraform", "Microservices"
]


def _heuristic_match(resume_text: str, jd_text: str) -> Dict[str, Any]:
    """
    Simple keyword-overlap fallback when LLM is unavailable.
    Returns a dict matching the LLM response structure.
    """
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()

    # Find skills mentioned in JD
    jd_skills = [s for s in _COMMON_TECH_SKILLS if s.lower() in jd_lower]
    # Find which of those are in resume
    matched = [s for s in jd_skills if s.lower() in resume_lower]
    missing = [s for s in jd_skills if s.lower() not in resume_lower]

    # Word overlap score
    resume_words = set(re.findall(r'\b\w+\b', resume_lower))
    jd_words = set(re.findall(r'\b\w+\b', jd_lower))
    overlap = len(resume_words & jd_words)
    total_jd = len(jd_words)
    word_score = min(int((overlap / max(total_jd, 1)) * 200), 100) if total_jd > 0 else 50

    # Skill score
    skill_score = int((len(matched) / max(len(jd_skills), 1)) * 100) if jd_skills else 50

    overall = int((word_score * 0.4) + (skill_score * 0.6))
    overall = max(10, min(95, overall))

    suggestions = []
    if missing[:3]:
        suggestions.append(f"Add experience with: {', '.join(missing[:3])}")
    suggestions.append("Quantify your achievements with specific metrics and numbers")
    suggestions.append("Tailor your resume summary to directly address the job requirements")

    return {
        "overall_score": overall,
        "narrative": f"Based on keyword analysis, the candidate matches approximately {overall}% of the job requirements. The resume covers {len(matched)} of {len(jd_skills)} identified technical skills.",
        "suggestions": suggestions[:3],
        "matched_skills": {
            "must_have": matched[:6],
            "nice_to_have": matched[6:10]
        },
        "missing_skills": {
            "must_have": missing[:4],
            "nice_to_have": missing[4:8]
        }
    }


# ---------------------------------------------------------------------------
# MatcherService
# ---------------------------------------------------------------------------

class MatcherService:
    """
    Core service for AI-powered resume–JD matching.
    Uses HuggingFace Mistral LLM with heuristic fallback.
    """

    def analyze(self, resume_text: str, jd_text: str) -> Dict[str, Any]:
        """
        Analyze resume against job description.

        Returns dict with keys:
          - overall_score (int 0-100)
          - narrative (str)
          - suggestions (list[str])
          - matched_skills (dict: must_have, nice_to_have)
          - missing_skills (dict: must_have, nice_to_have)
        """
        if not resume_text or not jd_text:
            raise ValueError("Both resume and job description text are required.")

        # Truncate to avoid token limits (Mistral 7B context ~4096 tokens)
        resume_truncated = resume_text[:3000]
        jd_truncated = jd_text[:2000]

        prompt = _MATCH_PROMPT.format(
            resume_text=resume_truncated,
            jd_text=jd_truncated
        )

        try:
            logger.info("Calling HuggingFace LLM for resume-JD matching...")
            raw_response = _call_hf_api(
                prompt,
                max_new_tokens=settings.LLM_MAX_NEW_TOKENS,
                temperature=settings.LLM_TEMPERATURE
            )
            logger.info("LLM response received (%d chars). Parsing JSON...", len(raw_response))
            result = _extract_json(raw_response)

            # Validate and clamp score
            result["overall_score"] = max(0, min(100, int(result.get("overall_score", 50))))

            # Ensure all required keys exist
            result.setdefault("narrative", "Analysis complete.")
            result.setdefault("suggestions", [])
            result.setdefault("matched_skills", {"must_have": [], "nice_to_have": []})
            result.setdefault("missing_skills", {"must_have": [], "nice_to_have": []})

            # Ensure nested structure
            if "matched_skills" in result:
                result["matched_skills"].setdefault("must_have", [])
                result["matched_skills"].setdefault("nice_to_have", [])
            if "missing_skills" in result:
                result["missing_skills"].setdefault("must_have", [])
                result["missing_skills"].setdefault("nice_to_have", [])

            logger.info("Match analysis complete. Score: %d%%", result["overall_score"])
            return result

        except Exception as exc:
            logger.warning("LLM analysis failed: %s. Using heuristic fallback.", exc)
            return _heuristic_match(resume_text, jd_text)


# Global singleton
matcher_service = MatcherService()
