"""Train the physics-informed residual model from the repository telematics data.

Run from Backend:
    python scripts/train_model.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_percentage_error
from xgboost import XGBRegressor

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from app.ml.physics import estimate_fuel

DATA = ROOT.parent / "Data" / "06_Fuel_Consumption" / "cleaned_fuel_records.csv"
ARTIFACTS = ROOT / "artifacts"
FEATURES = ["load_ratio", "total_mass", "mean_speed", "speed_variance", "grade",
            "grade_abs", "road_class", "rain_mm_h", "temp_c", "wind_head", "segment_length"]


def main() -> None:
    frame = pd.read_csv(DATA)
    frame = frame.dropna(subset=["fuel_consumed_litres", "distance_km", "avg_speed_kmh",
                                 "total_vehicle_mass_kg", "estimated_payload_kg"])
    frame["grade"] = frame["road_gradient_pct"].fillna(0)
    frame["rain_mm_h"] = frame["rainfall_mm"].fillna(0)
    frame["temp_c"] = frame["ambient_temperature_celsius"].fillna(27)
    frame["load_ratio"] = (frame["estimated_payload_kg"] / frame["gross_vehicle_weight_rating_kg"]).clip(0, 1)
    frame["segment_length"] = frame["distance_km"]
    frame["speed_variance"] = ((frame["max_speed_kmh"] - frame["avg_speed_kmh"]).fillna(0) / 3) ** 2
    frame["grade_abs"] = frame["grade"].abs()
    frame["road_class"] = 0.0
    frame["wind_head"] = 0.0
    vehicle_segments = [{
        "distance_km": row.distance_km, "speed_kmh": row.avg_speed_kmh,
        "gradient_pct": row.grade, "rain_mm_h": row.rain_mm_h, "temp_c": row.temp_c,
        "wind_head_kmh": 0,
    } for row in frame.itertuples()]
    baseline = np.array([estimate_fuel([segment], "heavy_truck", float(row.total_vehicle_mass_kg) - 10500)[0]
                         for segment, row in zip(vehicle_segments, frame.itertuples())])
    target = frame["fuel_consumed_litres"].to_numpy() - baseline
    x_train, x_hold, y_train, y_hold = train_test_split(frame[FEATURES], target, test_size=.3, random_state=42)
    model = XGBRegressor(n_estimators=300, max_depth=4, learning_rate=.04, subsample=.85,
                         colsample_bytree=.85, objective="reg:squarederror", random_state=42,
                         monotone_constraints="(1,1,0,0,0,1,0,1,0,0,1)")
    model.fit(x_train, y_train)
    hybrid_residual = model.predict(x_hold)
    hybrid_predictions = np.maximum(0, baseline[x_hold.index] + hybrid_residual)
    physics_predictions = np.maximum(0, baseline[x_hold.index])
    actual = frame.loc[x_hold.index, "fuel_consumed_litres"].to_numpy()
    residuals = np.abs(actual - hybrid_predictions)
    monotonicity = {}
    for feature in ("load_ratio", "total_mass", "grade_abs", "rain_mm_h", "segment_length"):
        low = x_hold.copy()
        high = x_hold.copy()
        low[feature] = low[feature].quantile(.25)
        high[feature] = high[feature].quantile(.75)
        monotonicity[feature] = bool(np.all(model.predict(high) >= model.predict(low) - 1e-8))
    ARTIFACTS.mkdir(exist_ok=True)
    model.save_model(ARTIFACTS / "fuel_residual.json")
    (ARTIFACTS / "conformal_q.json").write_text(json.dumps({"q90_litres": float(np.quantile(residuals, .9))}), encoding="utf-8")
    (ARTIFACTS / "metrics.json").write_text(json.dumps({
        "rows": int(len(frame)), "calibration_rows": int(len(x_hold)),
        "vehicle_classes": sorted(frame["vehicle_category"].dropna().unique().tolist()),
        "physics_mape_pct": float(mean_absolute_percentage_error(actual, physics_predictions) * 100),
        "hybrid_mape_pct": float(mean_absolute_percentage_error(actual, hybrid_predictions) * 100),
        "conformal_coverage_target": .9, "q90_litres": float(np.quantile(residuals, .9)),
        "interval_coverage_pct": float(np.mean(
            (actual >= np.maximum(0, hybrid_predictions - np.quantile(residuals, .9)))
            & (actual <= hybrid_predictions + np.quantile(residuals, .9))
        ) * 100),
        "monotonicity_check": monotonicity,
        "monotonicity_passed": all(monotonicity.values()),
    }, indent=2), encoding="utf-8")
    print(f"trained {len(frame)} rows; q90={np.quantile(residuals, .9):.3f} L")


if __name__ == "__main__":
    main()
