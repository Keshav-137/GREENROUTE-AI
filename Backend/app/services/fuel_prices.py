from __future__ import annotations

import os
from typing import Any

import httpx

from app.cache import cache


DEFAULT_DIESEL_PRICE = float(os.getenv("DIESEL_PRICE_INR_PER_LITRE", "94.0"))


def _price_from_city_payload(payload: Any, city: str) -> float | None:
    """Extract a diesel price when the provider includes it in its city response."""
    entries = payload if isinstance(payload, list) else payload.get("data", []) if isinstance(payload, dict) else []
    if isinstance(entries, dict):
        entries = entries.get("cities", [])
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        name = str(entry.get("city") or entry.get("name") or "").lower()
        if city.lower() not in name:
            continue
        for field in ("diesel", "diesel_price", "dieselPrice", "price"):
            value = entry.get(field)
            try:
                if value is not None:
                    return float(value)
            except (TypeError, ValueError):
                continue
    return None


def get_diesel_price(city: str = "Mumbai") -> dict[str, Any]:
    api_key = os.getenv("FUEL_API_KEY")
    base_url = os.getenv("FUEL_API_BASE_URL", "https://fuel.indianapi.in").rstrip("/")
    request = {"endpoint": "cities", "city": city}
    key = cache.key("fuel-price", request)
    cached = cache.get(key)
    if cached:
        return {**cached, "source": "cached"}

    if not api_key:
        return {"price_inr_per_litre": DEFAULT_DIESEL_PRICE, "source": "simulated"}

    try:
        response = httpx.get(
            f"{base_url}/cities",
            headers={"x-api-key": api_key, "Accept": "application/json"},
            timeout=8.0,
        )
        response.raise_for_status()
        price = _price_from_city_payload(response.json(), city)
        if price is None:
            return {"price_inr_per_litre": DEFAULT_DIESEL_PRICE, "source": "simulated"}
        result = {"price_inr_per_litre": price, "source": "live"}
        cache.set(key, result)
        return result
    except (httpx.HTTPError, ValueError):
        return {"price_inr_per_litre": DEFAULT_DIESEL_PRICE, "source": "simulated"}
