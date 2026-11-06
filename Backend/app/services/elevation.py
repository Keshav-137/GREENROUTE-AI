from __future__ import annotations

import math
from typing import Any

from app.cache import cache


def add_gradient(route: dict[str, Any]) -> dict[str, Any]:
    key = cache.key("elevation", route["geometry"])
    cached = cache.get(key)
    if cached:
        route["points"] = cached
        route["source_elevation"] = "cached"
        return route
    points = []
    for lat, lon in route["geometry"]:
        # Deterministic corridor DEM approximation; external DEM responses use the same schema.
        ghat = max(0.0, 520 * math.exp(-((lon - 73.34) / 0.10) ** 2))
        elevation = 30 + ghat + 55 * math.sin((lon - 72.95) * 4)
        points.append({"lat": lat, "lon": lon, "elevation_m": round(elevation, 1)})
    cache.set(key, points)
    route["points"] = points
    route["source_elevation"] = "simulated"
    return route
