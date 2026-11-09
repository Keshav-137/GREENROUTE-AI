from __future__ import annotations

import math
from datetime import datetime
from typing import Any

from app.services.hazards import flood_flag, landslide_flag
from app.services.weather import get_weather


def _distance(a: dict[str, Any], b: dict[str, Any]) -> float:
    x = math.radians(b["lon"] - a["lon"]) * math.cos(math.radians((a["lat"] + b["lat"]) / 2))
    y = math.radians(b["lat"] - a["lat"])
    return 6371 * math.sqrt(x * x + y * y)


def get_segments(
    route: dict[str, Any],
    departure: datetime,
    what_if_rain: bool = False,
) -> list[dict[str, Any]]:
    points = route["points"]
    weather = get_weather(points, [departure], what_if_rain=what_if_rain)
    segments = []
    for idx, (start, end) in enumerate(zip(points, points[1:]), 1):
        distance = max(0.5, _distance(start, end))
        grade = (end["elevation_m"] - start["elevation_m"]) / (distance * 1000) * 100
        conditions = weather[(start["lat"], start["lon"], departure.isoformat())]
        rain = float(conditions["rain"])
        visibility = float(conditions.get("visibility", 10000))
        flood = flood_flag(start, rain)
        slide = landslide_flag(start, grade, rain)
        fog = visibility < 2000
        risk = min(
            1.0,
            rain / 30 * 0.3
            + (0.3 if flood else 0)
            + (0.4 if slide else 0)
            + (0.2 if fog else 0),
        )
        segments.append({
            "id": f'{route["id"]}-seg-{idx}', "start_coord": [start["lon"], start["lat"]],
            "end_coord": [end["lon"], end["lat"]], "distance_km": round(distance, 2),
            "gradient_pct": round(grade, 2), "elevation_change_m": round(end["elevation_m"] - start["elevation_m"], 1),
            "road_class": route["road_class"], "speed_kmh": route["base_speed_kmh"],
            "duration_min": round(distance / max(20, route["base_speed_kmh"]) * 60, 1),
            "rain_mm_h": rain, "temp_c": float(conditions["temp"]), "wind_head_kmh": float(conditions["wind"]),
            "visibility_m": visibility,
            "source": conditions.get("source", "simulated"),
            "risk_score": round(risk, 3), "risk_level": "high" if risk >= .65 else "medium" if risk >= .3 else "low",
            "hazard_type": "Landslide-prone ghat" if slide else "Flood-prone lowland" if flood else "Low visibility" if fog else None,
        })
    return segments
