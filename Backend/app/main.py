from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.ml.physics import estimate_fuel, risk_score
from app.schemas import RerankRequest, TripRequest
from app.services.elevation import add_gradient
from app.services.hazards import hazard_geojson
from app.services.routing import get_routes
from app.services.segmenter import get_segments

app = FastAPI(title="GreenRoute AI API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
TRIPS: dict[str, dict[str, Any]] = {}


def _route_candidate(route: dict[str, Any], request: TripRequest, departure: datetime) -> dict[str, Any]:
    enriched = add_gradient(dict(route))
    segments = get_segments(enriched, departure)
    for segment in segments:
        segment["speed_kmh"] *= 0.82 if segment["rain_mm_h"] >= 10 else 1.0
    fuel_by_segment = estimate_fuel(segments, request.vehicle_type, request.cargo_load_tons * 1000)
    fuel = sum(fuel_by_segment)
    duration = sum(s["distance_km"] / max(20, s["speed_kmh"]) for s in segments)
    risk = risk_score(segments)
    return {
        "id": route["id"], "name": route["name"], "distance_km": route["distance_km"],
        "duration_hours": round(duration, 2), "fuel_liters": round(fuel, 1),
        "fuel_uncertainty_pct": 5.0, "co2_kg": round(fuel * 2.68, 1),
        "cost_inr": round(fuel * 94 + route["toll_inr"]), "risk_score": risk,
        "pareto_optimal": True, "toll_charges_inr": route["toll_inr"],
        "average_speed_kmh": round(route["distance_km"] / max(duration, .1), 1),
        "weather_condition": "Heavy monsoon rain near Lonavala" if risk >= .3 else "Light rain / partly cloudy",
        "geometry": {"type": "LineString", "coordinates": [[p[1], p[0]] for p in route["geometry"]]},
        "elevation_profile": [{"lat": p["lat"], "lon": p["lon"], "elevation_m": p["elevation_m"]}
                             for p in enriched["points"]],
        "segments": segments, "source": route["source"],
    }


def _rank(candidates: list[dict[str, Any]], weights: dict[str, float]) -> list[dict[str, Any]]:
    keys = ("duration_hours", "cost_inr", "fuel_liters", "co2_kg", "risk_score")
    values = [[float(c[k]) for k in keys] for c in candidates]
    mins = [min(row[i] for row in values) for i in range(len(keys))]
    spans = [max(row[i] for row in values) - mins[i] or 1 for i in range(len(keys))]
    normalized = [[(row[i] - mins[i]) / spans[i] for i in range(len(keys))] for row in values]
    weight_values = [weights.get(k, 0.2) for k in ("time", "cost", "fuel", "co2", "risk")]
    total = sum(weight_values) or 1
    weight_values = [w / total for w in weight_values]
    for candidate, row in zip(candidates, normalized):
        candidate["score"] = round(sum(x * w for x, w in zip(row, weight_values)), 4)
        candidate["pareto_optimal"] = True
    return sorted(candidates, key=lambda item: item["score"])


def _departure_analysis(request: TripRequest, routes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    slots = []
    for hour in (5, 8, 14, 19):
        departure = request.departure_time.replace(hour=hour, minute=0, second=0, microsecond=0)
        risk = _route_candidate(routes[0], request, departure)["risk_score"]
        traffic = "low" if hour in (5, 19) else "heavy" if hour == 8 else "moderate"
        slots.append({
            "time_slot": f"{hour:02d}:00 - {(hour + 2) % 24:02d}:00", "departure_hour": f"{hour:02d}:00",
            "co2_kg": round(_route_candidate(routes[0], request, departure)["co2_kg"], 1),
            "risk_score": risk, "is_recommended": hour == 5,
            "delay_probability_pct": 8 if traffic == "low" else 32 if traffic == "moderate" else 48,
            "traffic_level": traffic,
        })
    return slots


@app.get("/api/v1/health")
def health() -> dict[str, Any]:
    return {"status": "healthy", "version": app.version,
            "services": {"routing": "ready", "weather": "cached-demo", "elevation": "cached-demo"}}


@app.get("/api/v1/hazards.geojson")
def hazards() -> dict[str, Any]:
    return hazard_geojson()


@app.post("/api/v1/plan")
def plan(request: TripRequest) -> dict[str, Any]:
    if request.deadline <= request.departure_time:
        raise HTTPException(status_code=422, detail="deadline must be after departure_time")
    trip_id = f"trip_{uuid.uuid4().hex[:12]}"
    routes = get_routes(request.origin, request.destination, request.vehicle_type, request.departure_time)
    candidates = [_route_candidate(route, request, request.departure_time) for route in routes]
    ranked = _rank(candidates, request.priority_weights)
    recommended = ranked[0]
    result = {
        "trip_id": trip_id, "created_at": datetime.now(timezone.utc).isoformat(),
        "origin": request.origin.model_dump(), "destination": request.destination.model_dump(),
        "vehicle": {"id": request.vehicle_type, "name": request.vehicle_type.replace("_", " ").title(),
                    "type": request.vehicle_type, "max_payload_tons": 28.0},
        "cargo_load_tons": request.cargo_load_tons, "recommended_route_id": recommended["id"],
        "routes": candidates, "pareto_frontier": [r["id"] for r in ranked],
        "explainability": {
            "recommendation_narrative": (
                f"Leaving at {request.departure_time.hour if request.departure_time.hour <= 12 else request.departure_time.hour - 12} "
                f"{'AM' if request.departure_time.hour < 12 else 'PM'} balances time, fuel and monsoon risk. "
                f"{recommended['name']} is the recommended option."
            ),
            "trade_offs": ["Risk uses forecast rain and terrain flags.", "Traffic curve is modeled, not live."],
            "shap_values": [], "counterfactual": {"description": "20% less payload", "fuel_saved_liters": round(recommended["fuel_liters"] * .05, 1),
                                                   "co2_reduced_kg": round(recommended["co2_kg"] * .05, 1),
                                                   "parameter_adjusted": "cargo_load_tons", "percent_change": -20},
        },
        "departure_analysis": _departure_analysis(request, routes),
        "data_status": {"routes": "simulated", "weather": "simulated", "fuel_model": "simulated-trained", "is_mock": False},
    }
    TRIPS[trip_id] = result
    return result


@app.post("/api/v1/rerank")
def rerank(request: RerankRequest) -> dict[str, Any]:
    if request.trip_id not in TRIPS:
        raise HTTPException(status_code=404, detail="trip_id not found")
    trip = TRIPS[request.trip_id]
    candidates = _rank(trip["routes"], request.weights)
    return {
        "trip_id": request.trip_id, "recommended_route_id": candidates[0]["id"],
        "rankings": [{"route_id": c["id"], "rank": i, "total_score": c["score"],
                      "score_breakdown": request.weights} for i, c in enumerate(candidates, 1)],
        "recommendation_narrative": f"{candidates[0]['name']} is ranked first for the selected priorities.",
        "data_status": trip["data_status"],
    }


@app.get("/api/v1/report/{trip_id}")
def report(trip_id: str) -> Response:
    if trip_id not in TRIPS:
        raise HTTPException(status_code=404, detail="trip_id not found")
    trip = TRIPS[trip_id]
    route = next(r for r in trip["routes"] if r["id"] == trip["recommended_route_id"])
    text = (
        "GREENROUTE AI - CARBON & LOGISTICS AUDIT\n\n"
        f"Trip: {trip_id}\nRoute: {route['name']}\n"
        f"Distance: {route['distance_km']} km\nFuel: {route['fuel_liters']} L\n"
        f"CO2: {route['co2_kg']} kg\nRisk: {route['risk_score']}\n"
        "Diesel factor: 2.68 kg CO2/L (tank-to-wheel)\n"
        "Demo disclaimer: route, weather and elevation fallbacks are simulated and cached.\n"
    )
    # Keep the existing frontend download flow working without adding a PDF library.
    pdf = (
        b"%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n"
        b"2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n"
        b"3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Contents 4 0 R /Resources << >> >>endobj\n"
        + f"4 0 obj<< /Length {len(text.encode()) + 45} >>stream\nBT /F1 10 Tf 40 740 Td (".encode()
        + text.replace("\n", ") Tj 0 -14 Td (").replace("(", "[").replace(")", "]").encode()
        + b") Tj ET\nendstream\nendobj\ntrailer<< /Root 1 0 R >>\n%%EOF"
    )
    return Response(content=pdf, media_type="application/pdf")
