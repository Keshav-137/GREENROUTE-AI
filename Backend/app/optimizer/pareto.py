from __future__ import annotations

import numpy as np

try:
    from pymoo.util.nds.non_dominated_sorting import NonDominatedSorting
except ImportError:
    NonDominatedSorting = None

OBJECTIVES = ("time_min", "cost_inr", "fuel_l", "co2_kg", "risk")


def pareto_mask(values: np.ndarray) -> np.ndarray:
    if NonDominatedSorting is not None:
        front = NonDominatedSorting().do(values, only_non_dominated_front=True)
        keep = np.zeros(len(values), dtype=bool)
        keep[front] = True
        return keep
    keep = np.ones(len(values), dtype=bool)
    for index, row in enumerate(values):
        dominated = np.all(values <= row, axis=1) & np.any(values < row, axis=1)
        keep[index] = not bool(dominated.any())
    return keep


def rank(candidates: list[dict], weights: dict[str, float]) -> list[dict]:
    matrix = np.array([[candidate[key] for key in OBJECTIVES] for candidate in candidates], dtype=float)
    mask = pareto_mask(matrix)
    scale = np.ptp(matrix, axis=0)
    scale[scale == 0] = 1
    normalized = (matrix - matrix.min(axis=0)) / scale
    weight_vector = np.array([weights.get(key.split("_")[0], .2) for key in OBJECTIVES])
    weight_vector /= weight_vector.sum() or 1
    for candidate, score, is_pareto in zip(candidates, normalized @ weight_vector, mask):
        candidate["score"] = round(float(score), 4)
        candidate["pareto_optimal"] = bool(is_pareto)
    return sorted(candidates, key=lambda candidate: candidate["score"])
