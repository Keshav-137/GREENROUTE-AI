from __future__ import annotations

from typing import Any

import numpy as np


VEHICLES = {
    "light_truck": {"empty": 925, "payload": 750, "base": 12.0, "cd": 0.75, "area": 3.2, "crr": .010},
    "medium_duty_diesel": {"empty": 5200, "payload": 12000, "base": 24.0, "cd": .75, "area": 7.0, "crr": .007},
    "medium_truck": {"empty": 5200, "payload": 12000, "base": 24.0, "cd": .75, "area": 7.0, "crr": .007},
    "medium_duty_diesel": {"empty": 5200, "payload": 12000, "base": 24.0, "cd": .75, "area": 7.0, "crr": .007},
    "heavy_duty_diesel": {"empty": 10500, "payload": 28000, "base": 32.0, "cd": .75, "area": 8.5, "crr": .007},
    "heavy_truck": {"empty": 10500, "payload": 28000, "base": 32.0, "cd": .75, "area": 8.5, "crr": .007},
}


def feature_row(segment: dict[str, Any], vehicle: str, load_kg: float) -> list[float]:
    spec = VEHICLES.get(vehicle, VEHICLES["medium_truck"])
    return [
        min(1.0, load_kg / spec["payload"]), spec["empty"] + load_kg,
        segment["speed_kmh"], 0.0, segment["gradient_pct"],
        abs(segment["gradient_pct"]), 0.0, segment["rain_mm_h"],
        segment["temp_c"], segment["wind_head_kmh"], segment["distance_km"],
    ]


def estimate_fuel(segments: list[dict[str, Any]], vehicle: str, load_kg: float) -> list[float]:
    """Physics baseline: rolling resistance, gravity, aerodynamic drag and auxiliaries."""
    spec = VEHICLES.get(vehicle, VEHICLES["medium_truck"])
    mass = spec["empty"] + load_kg
    speed = np.array([max(1.0, s["speed_kmh"]) / 3.6 for s in segments])
    distance_m = np.array([s["distance_km"] * 1000 for s in segments])
    grade = np.array([s["gradient_pct"] / 100 for s in segments])
    rain = np.array([min(30.0, s["rain_mm_h"]) for s in segments])
    gravity = mass * 9.81 * grade
    rolling = mass * 9.81 * spec["crr"] * (1 + rain * .003)
    drag = .5 * 1.225 * spec["cd"] * spec["area"] * speed ** 2
    traction_energy_mj = np.maximum(rolling + gravity + drag, rolling + drag) * distance_m / 1e6
    load_ratio = min(1.0, load_kg / spec["payload"])
    base_litres = distance_m / 100000 * spec["base"] * (0.72 + 0.28 * load_ratio)
    tractive_litres = traction_energy_mj / (35.86 * 0.36)
    litres = base_litres + tractive_litres
    return [float(round(value, 5)) for value in litres]


def risk_score(segments: list[dict[str, Any]]) -> float:
    if not segments:
        return 0.0
    values = [s["risk_score"] for s in segments]
    return round(0.5 * (sum(values) / len(values)) + 0.5 * max(values), 3)
