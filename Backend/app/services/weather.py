from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import httpx

from app.cache import cache


def get_weather(points: list[dict[str, Any]], hours: list[datetime]) -> dict[tuple[float, float, str], dict[str, float | str]]:
    request = {"points": points, "hours": [h.isoformat() for h in hours]}
    key = cache.key("weather", request)
    cached = cache.get(key)
    if cached:
        return {(float(k.split("|")[0]), float(k.split("|")[1]), k.split("|")[2]): v
                for k, v in cached.items()}
    try:
        response = httpx.get(
            "https://api.open-meteo.com/v1/forecast",
            params={"latitude": ",".join(str(p["lat"]) for p in points),
                    "longitude": ",".join(str(p["lon"]) for p in points),
                    "hourly": "precipitation,temperature_2m,wind_speed_10m",
                    "forecast_days": 7, "timezone": "UTC"},
            timeout=15,
        )
        response.raise_for_status()
        payload = response.json()
        payloads = payload if isinstance(payload, list) else [payload]
        result = {}
        for point, weather_payload in zip(points, payloads):
            hourly = weather_payload["hourly"]
            for hour in hours:
                iso_hour = hour.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:00")
                if iso_hour not in hourly["time"]:
                    continue
                index = hourly["time"].index(iso_hour)
                key_part = f'{point["lat"]}|{point["lon"]}|{hour.isoformat()}'
                result[key_part] = {"rain": float(hourly["precipitation"][index] or 0),
                                    "temp": float(hourly["temperature_2m"][index]),
                                    "wind": float(hourly["wind_speed_10m"][index]), "source": "live"}
        if len(result) == len(points) * len(hours):
            cache.set(key, result)
            return {(float(k.split("|")[0]), float(k.split("|")[1]), k.split("|")[2]): v
                    for k, v in result.items()}
    except (httpx.HTTPError, ValueError, TypeError, KeyError, IndexError):
        pass
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
