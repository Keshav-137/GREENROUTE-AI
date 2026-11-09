from __future__ import annotations

import os
import json
from typing import Any

import httpx


def narrative(recommended: dict[str, Any], alternatives: list[dict[str, Any]]) -> str:
    """Use Claude only for wording; all numbers are supplied by structured results."""
    fallback = (
        f"{recommended['name']} is recommended: {recommended['fuel_liters']:.1f} L fuel, "
        f"{recommended['duration_hours']:.1f} hours, and climate risk {recommended['risk_score']:.2f}."
    )
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        return _gemini_narrative(gemini_key, recommended, alternatives, fallback)

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return fallback
    try:
        from anthropic import Anthropic
        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model=os.getenv("ANTHROPIC_MODEL", "claude-haiku-5-5"),
            max_tokens=120,
            system="Rewrite the supplied structured route facts in one plain sentence. Never invent or recalculate numbers.",
            messages=[{"role": "user", "content": str({"recommended": recommended, "alternatives": alternatives})}],
        )
        return response.content[0].text
    except (ImportError, OSError, ValueError, RuntimeError):
        return fallback


def _gemini_narrative(
    api_key: str,
    recommended: dict[str, Any],
    alternatives: list[dict[str, Any]],
    fallback: str,
) -> str:
    model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    prompt = (
        "Rewrite the supplied structured route facts in one plain sentence. "
        "Never invent, modify, or recalculate numbers. Return only the sentence.\n"
        + json.dumps({"recommended": recommended, "alternatives": alternatives}, default=str)
    )
    try:
        response = httpx.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
            params={"key": api_key},
            json={"contents": [{"parts": [{"text": prompt}]}],
                  "generationConfig": {"temperature": 0.1, "maxOutputTokens": 120}},
            timeout=15,
        )
        response.raise_for_status()
        candidates = response.json().get("candidates", [])
        text = candidates[0]["content"]["parts"][0]["text"].strip()
        return text or fallback
    except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError):
        return fallback
