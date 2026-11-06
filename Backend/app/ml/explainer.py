from __future__ import annotations

import os
from typing import Any


def narrative(recommended: dict[str, Any], alternatives: list[dict[str, Any]]) -> str:
    """Use Claude only for wording; all numbers are supplied by structured results."""
    fallback = (
        f"{recommended['name']} is recommended: {recommended['fuel_liters']:.1f} L fuel, "
        f"{recommended['duration_hours']:.1f} hours, and climate risk {recommended['risk_score']:.2f}."
    )
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return fallback
    try:
        from anthropic import Anthropic
        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-latest"),
            max_tokens=120,
            system="Rewrite the supplied structured route facts in one plain sentence. Never invent or recalculate numbers.",
            messages=[{"role": "user", "content": str({"recommended": recommended, "alternatives": alternatives})}],
        )
        return response.content[0].text
    except (ImportError, OSError, ValueError, RuntimeError):
        return fallback
