# GREENROUTE-AI

## Backend services

The backend is in [`Backend/`](./Backend/). It exposes the frontend-compatible
FastAPI endpoints and caches all route enrichment responses on disk. Start it with
`pip install -r Backend/requirements.txt` followed by
`uvicorn app.main:app --app-dir Backend --reload`, then run the frontend with
`npm run dev` from [`Frontend/`](./Frontend/).

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
