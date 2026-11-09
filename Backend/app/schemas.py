from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class Location(BaseModel):
    name: str
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    address: str | None = None


class Vehicle(BaseModel):
    type: str = "medium_truck"


class TripRequest(BaseModel):
    origin: Location
    destination: Location
    vehicle_type: str = "medium_truck"
    cargo_load_tons: float = Field(default=2.5, ge=0)
    departure_time: datetime
    deadline: datetime
    priority_weights: dict[str, float] = Field(
        default_factory=lambda: {
            "time": 0.2, "fuel": 0.2, "co2": 0.2, "cost": 0.2, "risk": 0.2
        }
    )
    what_if_rain: bool = False


class RerankRequest(BaseModel):
    trip_id: str
    weights: dict[str, float]


class RoutePoint(BaseModel):
    lat: float
    lon: float
    elevation_m: float = 0


class Segment(BaseModel):
    id: str
    start_coord: tuple[float, float]
    end_coord: tuple[float, float]
    distance_km: float
    gradient_pct: float
    elevation_change_m: float
    road_class: str
    speed_kmh: float
    rain_mm_h: float
    temp_c: float
    wind_head_kmh: float
    risk_score: float
    risk_level: Literal["low", "medium", "high"]
    hazard_type: str | None = None
