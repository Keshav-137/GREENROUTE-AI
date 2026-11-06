from __future__ import annotations

from typing import Any


VEHICLES = {
    "light_truck": {"empty": 925, "payload": 750, "base": 12.0},
    "medium_duty_diesel": {"empty": 5200, "payload": 12000, "base": 24.0},
    "medium_truck": {"empty": 5200, "payload": 12000, "base": 24.0},
    "heavy_duty_diesel": {"empty": 10500, "payload": 28000, "base": 32.0},
    "heavy_truck": {"empty": 10500, "payload": 28000, "base": 32.0},
}


def estimate_fuel(segments: list[dict[str, Any]], vehicle: str, load_kg: float) -> list[float]:
    spec = VEHICLES.get(vehicle, VEHICLES["medium_truck"])
    load_ratio = min(1.0, load_kg / spec["payload"])
    litres = []
    for segment in segments:
        grade_penalty = 1 + abs(segment["gradient_pct"]) * 0.018
        rain_penalty = 1 + min(segment["rain_mm_h"], 30) * 0.003
        speed_penalty = 1 + abs(segment["speed_kmh"] - 55) * 0.002
        load_penalty = 0.72 + 0.28 * load_ratio
        litres.append(segment["distance_km"] / 100 * spec["base"] * load_penalty *
                      grade_penalty * rain_penalty * speed_penalty)
    return litres


def risk_score(segments: list[dict[str, Any]]) -> float:
    if not segments:
        return 0.0
    values = [s["risk_score"] for s in segments]
    return round(0.5 * (sum(values) / len(values)) + 0.5 * max(values), 3)
