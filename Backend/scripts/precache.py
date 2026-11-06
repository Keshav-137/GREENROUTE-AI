"""Warm the disk cache for the three video scenarios.

Run from Backend after installing requirements:
    python scripts/precache.py
"""

from pathlib import Path
import sys

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.main import plan
from app.schemas import TripRequest


def main() -> None:
    with open(Path(__file__).parents[1] / "demo_scenarios.yaml", encoding="utf-8") as file:
        scenarios = yaml.safe_load(file)["scenarios"]
    for scenario in scenarios:
        result = plan(TripRequest.model_validate(scenario))
        print(f"cached {scenario['id']}: {result['trip_id']}")


if __name__ == "__main__":
    main()
