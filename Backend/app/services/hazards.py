from __future__ import annotations

from typing import Any


GHAT_BOUNDS = (73.20, 73.55)
WATERLOGGING_SPOTS = [
    {"name": "Lonavala low bridge", "lat": 18.75, "lon": 73.41, "source": "curated demo location"},
    {"name": "Panvel creek approach", "lat": 18.98, "lon": 73.11, "source": "curated demo location"},
    {"name": "Pune Swargate underpass", "lat": 18.501, "lon": 73.86, "source": "curated demo location"},
]


def flood_flag(point: dict[str, Any], rain_mm_h: float) -> bool:
    return (point["lat"] < 18.85 and point["lon"] < 73.25) or rain_mm_h >= 25


def landslide_flag(point: dict[str, Any], grade_pct: float, rain_mm_h: float) -> bool:
    return GHAT_BOUNDS[0] < point["lon"] < GHAT_BOUNDS[1] and abs(grade_pct) >= 3 and rain_mm_h >= 10


def hazard_geojson() -> dict[str, Any]:
    return {
        "type": "FeatureCollection",
        "features": [
            {"type": "Feature", "properties": spot,
             "geometry": {"type": "Point", "coordinates": [spot["lon"], spot["lat"]]}}
            for spot in WATERLOGGING_SPOTS
        ],
    }
