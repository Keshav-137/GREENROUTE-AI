from __future__ import annotations

import math
import os
from datetime import datetime
from typing import Any

import httpx

from app.cache import cache


PUNE_MUMBAI = [
    (18.6275, 73.8443), (18.6510, 73.8120), (18.7050, 73.7430),
    (18.7557, 73.4072), (18.7690, 73.3750), (18.8300, 73.2800),
    (18.8850, 73.2350), (18.9400, 73.1850), (18.9900, 73.1100),
    (18.9750, 73.0450), (18.9610, 72.9820), (18.9482, 72.9514),
]


def _distance(a: tuple[float, float], b: tuple[float, float]) -> float:
    lat1, lon1, lat2, lon2 = map(math.radians, (*a, *b))
    x = (lon2 - lon1) * math.cos((lat1 + lat2) / 2)
    y = lat2 - lat1
    return 6371 * math.sqrt(x * x + y * y)


def _geometry(origin: Any, destination: Any, index: int) -> list[tuple[float, float]]:
    if abs(origin.lat - 18.6275) < 0.2 and abs(destination.lon - 72.9514) < 0.2:
        points = PUNE_MUMBAI[:]
        if index == 1:
            points.insert(5, (18.785, 73.330))
        if index == 2:
            points = [(18.6275, 73.8443), (18.68, 73.78), (18.76, 73.67),
                      (18.82, 73.55), (18.88, 73.40), (18.92, 73.20),
                      (18.9482, 72.9514)]
        return points
    return [(origin.lat, origin.lon), (destination.lat, destination.lon)]


def get_routes(origin: Any, destination: Any, vehicle: str, departure: datetime | None = None) -> list[dict[str, Any]]:
    request = {"origin": origin.model_dump(), "destination": destination.model_dump(),
               "vehicle": vehicle, "departure": departure.isoformat() if departure else None}
    key = cache.key("routes-v2-live", request)
    cached = cache.get(key)
    if cached:
        for route in cached:
            route["source"] = "cached"
        return cached

    live = _get_live_routes(origin, destination, vehicle)
    if live:
        cache.set(key, live)
        return live

    specs = [
        ("route-opt-1", "Expressway (NH 48) / Yashwantrao Chavan", 0, "expressway", 620, 52),
        ("route-opt-2", "Old NH 48 Highway via Khandala Ghat", 1, "highway", 180, 43),
        ("route-opt-3", "SH 54 via Karjat-Panvel", 2, "highway", 320, 47),
    ]
    routes = []
    for route_id, name, index, road_class, toll, speed in specs:
        geometry = _geometry(origin, destination, index)
        distance = sum(_distance(a, b) for a, b in zip(geometry, geometry[1:]))
        routes.append({
            "id": route_id, "name": name, "geometry": geometry,
            "distance_km": round(distance * (1.04 if index == 1 else 1.0), 1),
            "road_class": road_class, "toll_inr": toll, "base_speed_kmh": speed,
            "source": "live" if False else "simulated",
        })
    cache.set(key, routes)
    return routes


def _get_live_routes(origin: Any, destination: Any, vehicle: str) -> list[dict[str, Any]] | None:
    """Fetch real alternatives, preferring ORS truck routing and falling back to OSRM."""
    coordinates = f"{origin.lon},{origin.lat}|{destination.lon},{destination.lat}"
    ors_key = os.getenv("ORS_API_KEY") or os.getenv("VITE_ORS_API_KEY")
    try:
        if ors_key:
            response = httpx.get(
                "https://api.openrouteservice.org/v2/directions/driving-hgv",
                params={"api_key": ors_key, "start": f"{origin.lon},{origin.lat}",
                        "end": f"{destination.lon},{destination.lat}", "alternative_routes": "true",
                        "geometry": "true", "instructions": "true"},
                timeout=15,
            )
            response.raise_for_status()
            payload = response.json()
            features = payload.get("routes", [])
            return [_normalise_ors_route(feature, index) for index, feature in enumerate(features[:3])]
        response = httpx.get(
            "https://router.project-osrm.org/route/v1/driving/" + coordinates,
            params={"alternatives": "true", "overview": "full", "geometries": "geojson", "steps": "true"},
            timeout=15,
        )
        response.raise_for_status()
        payload = response.json()
        if payload.get("code") != "Ok":
            return None
        return [_normalise_osrm_route(route, index) for index, route in enumerate(payload.get("routes", [])[:3])]
    except (httpx.HTTPError, ValueError, KeyError, TypeError):
        return None


def _normalise_osrm_route(route: dict[str, Any], index: int) -> dict[str, Any]:
    road_class = "expressway" if index == 0 else "highway"
    return {
        "id": f"route-live-{index + 1}", "name": f"Live route alternative {index + 1}",
        "geometry": [(lat, lon) for lon, lat in route["geometry"]["coordinates"]],
        "distance_km": round(route["distance"] / 1000, 1),
        "road_class": road_class, "toll_inr": 620 if index == 0 else 180,
        "base_speed_kmh": max(25, route["distance"] / max(route["duration"], 1) * 3.6),
        "steps": route.get("legs", [{}])[0].get("steps", []),
        "source": "live",
    }


def _normalise_ors_route(route: dict[str, Any], index: int) -> dict[str, Any]:
    summary = route["summary"]
    return {
        "id": f"route-live-{index + 1}", "name": f"Truck route alternative {index + 1}",
        "geometry": [(lat, lon) for lon, lat in route["geometry"]["coordinates"]],
        "distance_km": round(summary["distance"] / 1000, 1), "road_class": "highway",
        "toll_inr": 620 if index == 0 else 180,
        "base_speed_kmh": max(25, summary["distance"] / max(summary["duration"], 1) * 3.6),
        "steps": route.get("segments", [{}])[0].get("steps", []), "source": "live",
    }
