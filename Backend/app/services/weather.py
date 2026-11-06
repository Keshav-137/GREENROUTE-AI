from __future__ import annotations

from datetime import datetime
from typing import Any

from app.cache import cache


def get_weather(points: list[dict[str, Any]], hours: list[datetime]) -> dict[tuple[float, float, str], dict[str, float | str]]:
    request = {"points": points, "hours": [h.isoformat() for h in hours]}
    key = cache.key("weather", request)
    cached = cache.get(key)
    if cached:
        return {(float(k.split("|")[0]), float(k.split("|")[1]), k.split("|")[2]): v
                for k, v in cached.items()}
    result: dict[str, dict[str, float | str]] = {}
    for point in points:
        for hour in hours:
            # Demo monsoon window: heavy rain over Lonavala/Khandala from 08:00 to 12:00.
            in_ghat = 73.20 < point["lon"] < 73.55
            rain = 18.0 if in_ghat and 8 <= hour.hour <= 12 else 2.0
            key_part = f'{point["lat"]}|{point["lon"]}|{hour.isoformat()}'
            result[key_part] = {"rain": rain, "temp": 27.0, "wind": 8.0, "source": "simulated"}
    cache.set(key, result)
    return {(float(k.split("|")[0]), float(k.split("|")[1]), k.split("|")[2]): v
            for k, v in result.items()}
