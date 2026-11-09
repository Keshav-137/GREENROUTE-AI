from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import httpx

from app.cache import cache


def get_weather(
    points: list[dict[str, Any]],
    hours: list[datetime],
    what_if_rain: bool = False,
) -> dict[tuple[float, float, str], dict[str, float | str]]:
    historical = bool(hours) and hours[0].date() < datetime.now(timezone.utc).date()
    request = {
        "points": points,
        "hours": [h.isoformat() for h in hours],
        "historical": historical,
        "what_if_rain": what_if_rain,
    }
    key = cache.key("weather", request)
    cached = cache.get(key)
    if cached:
        return {(float(k.split("|")[0]), float(k.split("|")[1]), k.split("|")[2]): v
                for k, v in cached.items()}
    try:
        endpoint = (
            "https://archive-api.open-meteo.com/v1/archive"
            if historical
            else "https://api.open-meteo.com/v1/forecast"
        )
        params: dict[str, Any] = {
            "latitude": ",".join(str(p["lat"]) for p in points),
            "longitude": ",".join(str(p["lon"]) for p in points),
            "hourly": "precipitation,temperature_2m,wind_speed_10m,visibility",
            "timezone": "Asia/Kolkata",
        }
        if historical:
            params["start_date"] = min(h.date() for h in hours).isoformat()
            params["end_date"] = max(h.date() for h in hours).isoformat()
        else:
            params["forecast_days"] = 7
        response = httpx.get(
            endpoint,
            params=params,
            timeout=15,
        )
        response.raise_for_status()
        payload = response.json()
        payloads = payload if isinstance(payload, list) else [payload]
        result = {}
        for point, weather_payload in zip(points, payloads):
            hourly = weather_payload["hourly"]
            for hour in hours:
                iso_hour = hour.strftime("%Y-%m-%dT%H:00")
                if iso_hour not in hourly["time"]:
                    continue
                index = hourly["time"].index(iso_hour)
                key_part = f'{point["lat"]}|{point["lon"]}|{hour.isoformat()}'
                visibility_values = hourly.get("visibility", [])
                visibility = visibility_values[index] if index < len(visibility_values) else 10000
                result[key_part] = {"rain": float(hourly["precipitation"][index] or 0),
                                    "temp": float(hourly["temperature_2m"][index]),
                                    "wind": float(hourly["wind_speed_10m"][index]),
                                    "visibility": float(visibility or 10000),
                                    "source": "historical" if historical else "live"}
                if what_if_rain:
                    result[key_part]["rain"] = max(float(result[key_part]["rain"]), 18.0)
                    result[key_part]["source"] = "what-if"
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
            result[key_part] = {
                "rain": max(rain, 18.0) if what_if_rain else rain,
                "temp": 27.0,
                "wind": 8.0,
                "visibility": 1500.0 if in_ghat and rain >= 18 else 10000.0,
                "source": "what-if" if what_if_rain else "simulated",
            }
    cache.set(key, result)
    return {(float(k.split("|")[0]), float(k.split("|")[1]), k.split("|")[2]): v
            for k, v in result.items()}
