from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np

from app.ml.physics import estimate_fuel, feature_row

ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = ROOT / "artifacts" / "fuel_residual.json"
CALIBRATION_PATH = ROOT / "artifacts" / "conformal_q.json"


def _load_model() -> Any | None:
    if not MODEL_PATH.exists():
        return None
    try:
        from xgboost import XGBRegressor
        model = XGBRegressor()
        model.load_model(MODEL_PATH)
        return model
    except (ImportError, ValueError, OSError):
        return None


def predict_fuel(segments: list[dict[str, Any]], vehicle: str, load_kg: float) -> dict[str, Any]:
    baseline = np.array(estimate_fuel(segments, vehicle, load_kg))
    model = _load_model()
    residual = np.zeros(len(segments))
    model_source = "physics-baseline"
    if model is not None and segments:
        residual = model.predict(np.array([feature_row(s, vehicle, load_kg) for s in segments]))
        model_source = "physics+xgboost-residual"
    litres = np.maximum(0, baseline + residual)
    quantile = _conformal_quantile()
    return {
        "per_segment_litres": [round(float(value), 3) for value in litres],
        "total_litres_raw": float(litres.sum()),
        "total_litres": round(float(litres.sum()), 2),
        "lo_litres": round(float(max(0, litres.sum() - quantile)), 2),
        "hi_litres": round(float(litres.sum() + quantile), 2),
        "uncertainty_pct": round(float(quantile / max(litres.sum(), .01) * 100), 1),
        "model_source": model_source,
    }


def explain(segments: list[dict[str, Any]], vehicle: str, load_kg: float) -> list[dict[str, Any]]:
    model = _load_model()
    if model is None or not segments:
        return [{"feature": "Physics baseline", "impact": 0.0,
                 "description": "No trained residual artifact is installed; physics baseline is used."}]
    try:
        import shap
        values = shap.TreeExplainer(model)(np.array([feature_row(s, vehicle, load_kg) for s in segments])).values
        means = values.mean(axis=0)
        names = ["Load ratio", "Total vehicle mass", "Mean speed", "Speed variance",
                 "Gradient", "Absolute gradient", "Road class", "Rainfall",
                 "Temperature", "Headwind", "Segment length"]
        descriptions = {
            "Load ratio": "Payload relative to the vehicle payload capacity.",
            "Total vehicle mass": "Vehicle tare mass plus payload.",
            "Mean speed": "Average segment speed used by the fuel model.",
            "Speed variance": "Variation between observed maximum and average speed.",
            "Gradient": "Signed road gradient affecting gravitational work.",
            "Absolute gradient": "Magnitude of road gradient affecting tractive effort.",
            "Road class": "Encoded road-class feature from the training data.",
            "Rainfall": "Hourly precipitation in millimetres.",
            "Temperature": "Ambient temperature in degrees Celsius.",
            "Headwind": "Headwind speed in kilometres per hour.",
            "Segment length": "Segment distance in kilometres.",
        }
        return [{"feature": name, "impact": round(float(value), 4),
                 "description": descriptions[name]}
                for name, value in zip(names, means)]
    except (ImportError, ValueError, RuntimeError):
        return []


def _conformal_quantile() -> float:
    try:
        return float(json.loads(CALIBRATION_PATH.read_text(encoding="utf-8"))["q90_litres"])
    except (FileNotFoundError, KeyError, TypeError, ValueError, json.JSONDecodeError):
        return 2.0
