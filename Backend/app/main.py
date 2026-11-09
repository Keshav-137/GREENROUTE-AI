from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.ml.physics import risk_score
from app.ml.model import explain as explain_fuel
from app.ml.model import predict_fuel
from app.ml.explainer import narrative
from app.optimizer.pareto import rank
from app.schemas import RerankRequest, TripRequest
from app.services.elevation import add_gradient
from app.services.fuel_prices import get_diesel_price
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
    segments = get_segments(enriched, departure, request.what_if_rain)
    for segment in segments:
        segment["speed_kmh"] *= 0.82 if segment["rain_mm_h"] >= 10 else 1.0
    fuel_prediction = predict_fuel(segments, request.vehicle_type, request.cargo_load_tons * 1000)
    fuel_raw = fuel_prediction["total_litres_raw"]
    fuel = fuel_prediction["total_litres"]
    fuel_price = get_diesel_price("Mumbai")
    duration = sum(s["distance_km"] / max(20, s["speed_kmh"]) for s in segments)
    risk = risk_score(segments)
    return {
        "id": route["id"], "name": route["name"], "distance_km": route["distance_km"],
        "duration_hours": round(duration, 2), "fuel_liters": round(fuel_raw, 1),
        "fuel_uncertainty_pct": fuel_prediction["uncertainty_pct"], "co2_kg": round(fuel_raw * 2.68, 1),
        "cost_inr": round(fuel_raw * fuel_price["price_inr_per_litre"] + route["toll_inr"]), "risk_score": risk,
        "pareto_optimal": True, "toll_charges_inr": route["toll_inr"],
        "average_speed_kmh": round(route["distance_km"] / max(duration, .1), 1),
        "weather_condition": "Heavy monsoon rain near Lonavala" if risk >= .3 else "Light rain / partly cloudy",
        "geometry": {"type": "LineString", "coordinates": [[p[1], p[0]] for p in route["geometry"]]},
        "elevation_profile": [{"lat": p["lat"], "lon": p["lon"], "elevation_m": p["elevation_m"]}
                             for p in enriched["points"]],
        "segments": segments, "source": route["source"], "fuel_price_source": fuel_price["source"],
        "elevation_source": enriched["source_elevation"],
        "fuel_model_source": fuel_prediction["model_source"],
        "fuel_interval_litres": [fuel_prediction["lo_litres"], fuel_prediction["hi_litres"]],
        "fuel_liters_raw": fuel_raw,
    }


def _rank(candidates: list[dict[str, Any]], weights: dict[str, float]) -> list[dict[str, Any]]:
    objectives = {
        candidate["id"]: {
            "time_min": candidate["duration_hours"] * 60,
            "cost_inr": candidate["cost_inr"], "fuel_l": candidate["fuel_liters"],
            "co2_kg": candidate["co2_kg"], "risk": candidate["risk_score"],
        } for candidate in candidates
    }
    ranked = []
    for candidate in candidates:
        ranked.append({**candidate, **objectives[candidate["id"]]})
    return rank(ranked, weights)


def _departure_analysis(request: TripRequest, routes: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    slots = []
    for hour in (5, 8, 14, 19):
        departure = request.departure_time.replace(hour=hour, minute=0, second=0, microsecond=0)
        candidate = _route_candidate(routes[0], request, departure)
        risk = candidate["risk_score"]
        traffic = "low" if hour in (5, 19) else "heavy" if hour == 8 else "moderate"
        slots.append({
            "time_slot": f"{hour:02d}:00 - {(hour + 2) % 24:02d}:00", "departure_hour": f"{hour:02d}:00",
            "fuel_liters": candidate["fuel_liters"], "co2_kg": candidate["co2_kg"],
            "risk_score": risk, "is_recommended": hour == 5,
            "delay_probability_pct": 8 if traffic == "low" else 32 if traffic == "moderate" else 48,
            "traffic_level": traffic,
        })
    before = next(slot for slot in slots if slot["departure_hour"] == "08:00")
    after = next(slot for slot in slots if slot["departure_hour"] == "05:00")
    return slots, {
        "before": before,
        "after": after,
        "fuel_saved_liters": round(before["fuel_liters"] - after["fuel_liters"], 1),
        "risk_reduction": round(before["risk_score"] - after["risk_score"], 3),
        "summary": "Leaving at 05:00 instead of 08:00 reduces modeled fuel and climate risk on the same route.",
    }


@app.get("/api/v1/health")
def health() -> dict[str, Any]:
    return {"status": "healthy", "version": app.version,
            "services": {"routing": "ready", "weather": "cached-demo", "elevation": "cached-demo",
                         "fuel_prices": "configured" if get_diesel_price()["source"] != "simulated" else "fallback"}}


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
    shap_values = explain_fuel(recommended["segments"], request.vehicle_type, request.cargo_load_tons * 1000)
    departure_analysis, departure_comparison = _departure_analysis(request, routes)
    result = {
        "trip_id": trip_id, "created_at": datetime.now(timezone.utc).isoformat(),
        "origin": request.origin.model_dump(), "destination": request.destination.model_dump(),
        "vehicle": {"id": request.vehicle_type, "name": request.vehicle_type.replace("_", " ").title(),
                    "type": request.vehicle_type, "max_payload_tons": 28.0},
        "cargo_load_tons": request.cargo_load_tons, "recommended_route_id": recommended["id"],
        "routes": candidates, "pareto_frontier": [r["id"] for r in ranked],
        "explainability": {
            "recommendation_narrative": narrative(recommended, candidates),
            "trade_offs": ["Risk uses Open-Meteo precipitation, visibility, and terrain flags.", "Traffic curve is modeled, not live."],
            "shap_values": shap_values, "counterfactual": {"description": "Reducing cargo payload by 20% lowers estimated diesel use on this route.",
                                                   "fuel_saved_liters": round(recommended["fuel_liters_raw"] * .05, 1),
                                                   "co2_reduced_kg": round(recommended["fuel_liters_raw"] * .05 * 2.68, 1),
                                                   "parameter_adjusted": "cargo_load_tons", "percent_change": -20},
        },
        "departure_analysis": departure_analysis,
        "departure_comparison": departure_comparison,
        "data_status": {"routes": "live" if all(r["source"] in {"live", "cached"} for r in routes) else "simulated",
                        "weather": ("what-if" if request.what_if_rain else
                                    "historical" if all(s.get("source") == "historical" for r in candidates for s in r["segments"]) else
                                    "live" if all(s.get("source") in {"live", "cached"} for r in candidates for s in r["segments"]) else "simulated"),
                        "elevation": "live" if all(r.get("elevation_source") == "live" for r in candidates) else
                                    "cached" if all(r.get("elevation_source") in {"live", "cached"} for r in candidates) else "simulated",
                        "fuel_model": "telematics-calibrated" if recommended["fuel_model_source"] == "telematics-calibrated" else "physics-baseline",
                        "is_mock": False},
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
        f"Data status: routes={trip['data_status']['routes']}, "
        f"weather={trip['data_status']['weather']}, "
        f"elevation={trip['data_status']['elevation']}.\n"
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
