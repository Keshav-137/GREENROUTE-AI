from __future__ import annotations

import math
from datetime import datetime
from typing import Any

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
    key = cache.key("routes", request)
    cached = cache.get(key)
    if cached:
        for route in cached:
            route["source"] = "cached"
        return cached

    specs = [
        ("route-opt-1", "Yashwantrao Chavan Expressway (NH 48)", 0, "expressway", 620, 52),
        ("route-opt-2", "Old NH 48 Highway via Khandala Ghat", 1, "highway", 180, 43),
        ("route-opt-3", "SH 54 Panvel Bypass Corridor", 2, "highway", 320, 47),
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
