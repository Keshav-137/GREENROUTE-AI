# GREENROUTE-AI

## Backend services

The backend is in [`Backend/`](./Backend/). It exposes the frontend-compatible
FastAPI endpoints and caches all route enrichment responses on disk. Start it with
`pip install -r Backend/requirements.txt` followed by
`uvicorn app.main:app --app-dir Backend --reload`, then run the frontend with
`npm run dev` from [`Frontend/`](./Frontend/).

For live diesel pricing, copy `Backend/.env.example` to `Backend/.env`, set
`FUEL_API_KEY`, and load those environment variables before starting Uvicorn.
Never commit the key. If the provider is unavailable, the API uses the configured
fallback price and reports the fuel-price source in the route response.

To train the physics-informed model from the repository data:

```powershell
pip install -r Backend\requirements.txt
python Backend\scripts\train_model.py
```

This writes ignored model artifacts under `Backend/artifacts/`. Configure
`ORS_API_KEY` for truck-aware OpenRouteService routes; without it the backend
uses public OSRM alternatives. Configure `ANTHROPIC_API_KEY` only if LLM wording
is desired; the numeric result and SHAP values never come from the LLM.
Google AI Studio can be used instead by setting `GEMINI_API_KEY` and
`GEMINI_MODEL` in `Backend/.env`. Do not paste either key into source control.

```text
backend/app/services/
  routing.py     # get_routes(origin, dest, vehicle) -> list[Route]
  elevation.py   # add_gradient(route) -> segments with grade
  weather.py     # get_weather(points, hours) -> dict[(point,hour)] -> {rain,temp,wind}
  hazards.py     # flood_flag(segment), landslide_flag(segment)
  segmenter.py   # split route into 0.5-2 km segments with all fields attached
```

## Data

```text
Backend/
  app/services/  # cached routing, elevation, weather, hazards and segmentation
  app/main.py    # /api/v1/plan, /rerank, /health
  scripts/precache.py
data/
  cache/         # SQLite request cache
  geo/           # hazard and DEM layers when supplied
```
