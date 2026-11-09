# GreenRoute AI

Climate-aware freight route optimization for Maharashtra logistics corridors.
GreenRoute AI compares real route alternatives, fuel use, cost, CO2, delivery
time, and monsoon-related climate risk.

## What the project does

For a trip request, the system:

1. Validates origin, destination, vehicle, payload, departure, and deadline.
2. Fetches up to three real route alternatives:
   - OpenRouteService `driving-hgv` when `ORS_API_KEY` is configured.
   - Public OSRM alternatives otherwise.
   - Cached responses are reused before making a new request.
3. Enriches route points with elevation and gradient.
4. Fetches hourly Open-Meteo precipitation, temperature, wind, and visibility.
   Historical scenario dates use the Open-Meteo archive API.
5. Flags flood-prone and landslide/ghat segments.
6. Estimates fuel with a physics baseline and optional trained XGBoost residual.
7. Produces a conformal uncertainty interval when trained artifacts exist.
8. Calculates climate risk for every segment and route.
9. Selects the Pareto front using NSGA-II non-dominated sorting.
10. Returns SHAP values, counterfactuals, and an optional Gemini/Claude narrative.

The numeric calculations never depend on the LLM. The LLM only rewrites
structured results into plain language.

## Project structure

```text
GreenRouteAI/
├── Backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI API
│   │   ├── schemas.py               # Pydantic request models
│   │   ├── cache.py                 # SQLite disk cache
│   │   ├── ml/
│   │   │   ├── physics.py           # Physics fuel baseline
│   │   │   ├── model.py             # XGBoost residual + SHAP + intervals
│   │   │   └── explainer.py         # Optional Gemini/Claude wording
│   │   ├── optimizer/pareto.py      # Pareto/NSGA-II ranking
│   │   └── services/
│   │       ├── routing.py           # ORS/OSRM route alternatives
│   │       ├── elevation.py         # Open-Meteo elevation + gradients
│   │       ├── weather.py           # Open-Meteo forecast
│   │       ├── hazards.py           # Flood and landslide flags
│   │       ├── segmenter.py         # Segment-level feature assembly
│   │       └── fuel_prices.py       # India API fuel prices
│   ├── scripts/train_model.py       # Train model artifacts
│   ├── scripts/precache.py          # Warm demo cache
│   ├── demo_scenarios.yaml          # Video/demo inputs
│   ├── vehicles.yaml                # Vehicle parameters
│   ├── config.yaml                  # Fuel, toll, congestion settings
│   ├── emission_factors.yaml        # Diesel CO2 factor
│   ├── model_card.md                # Model limitations and intended use
│   ├── requirements.txt
│   └── .env.example
├── Data/                            # Existing project datasets
├── Frontend/                        # React + Vite + TypeScript UI
└── docker-compose.yml
```

## Requirements

- Python 3.11+
- Node.js 18+
- npm
- Internet access for live routing and weather providers

## Run procedure

The application has a FastAPI backend and a React/Vite frontend. For a quick
UI demonstration, the frontend can run independently in mock mode. For live
route planning, run both services.

### Quick start (mock mode)

From the repository root, install the frontend dependencies and start Vite:

```powershell
Set-Location Frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:3000`. The default `Frontend/.env` setting
`VITE_USE_MOCK_DATA=true` uses the bundled demonstration data and does not
require the backend.

### Full run (frontend with backend)

1. In a terminal at the repository root, create the Python environment and
   install backend dependencies:

   ```powershell
   py -3.11 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install --upgrade pip
   python -m pip install -r Backend\requirements.txt
   Copy-Item Backend\.env.example Backend\.env
   ```

2. Start the backend:

   ```powershell
   .\.venv\Scripts\python.exe -m uvicorn app.main:app `
     --app-dir Backend --host 0.0.0.0 --port 8000 --reload
   ```

3. In a second terminal, configure and start the frontend:

   ```powershell
   Set-Location Frontend
   Copy-Item .env.example .env
   ```

   Set these values in `Frontend/.env`:

   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_USE_MOCK_DATA=false
   ```

   Then run:

   ```powershell
   npm ci
   npm run dev
   ```

4. Open `http://localhost:3000`.

5. Verify the backend is available at
   `http://localhost:8000/api/v1/health` and view interactive API
   documentation at `http://localhost:8000/docs`.

Stop each development server with `Ctrl+C`.

For production-build validation, run `npm run build` from `Frontend`. For
Docker-based backend startup, run `docker compose up --build` from the
repository root.

## Backend setup on Windows

From the repository root:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r Backend\requirements.txt
```

If PowerShell blocks activation, run the backend with the virtual environment
interpreter directly:

```powershell
.\.venv\Scripts\python.exe -m pip install -r Backend\requirements.txt
```

## Environment configuration

Create a local environment file:

```powershell
Copy-Item Backend\.env.example Backend\.env
```

Example configuration:

```env
# India fuel price API
FUEL_API_KEY=replace_with_rotated_india_api_key
FUEL_API_BASE_URL=https://fuel.indianapi.in

# Truck-aware routing. Without this, OSRM is used.
ORS_API_KEY=replace_with_openrouteservice_key

# Optional LLM wording. Use either Gemini or Anthropic.
GEMINI_API_KEY=replace_with_google_ai_studio_key
GEMINI_MODEL=gemini-2.0-flash
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-haiku-latest

# Fallback when the fuel provider is unavailable.
DIESEL_PRICE_INR_PER_LITRE=94.0
```

Never commit `Backend/.env`. API keys shared in screenshots, chat, or commits
must be revoked and replaced.

## Train the model

The repository includes measured telematics fuel records in
`Data/06_Fuel_Consumption/cleaned_fuel_records.csv`.

Run:

```powershell
.\.venv\Scripts\python.exe Backend\scripts\train_model.py
```

The training script:

- Builds physics-baseline fuel estimates.
- Trains an XGBoost residual model.
- Uses a held-out calibration split.
- Writes a 90% conformal residual interval.
- Saves metrics and model artifacts under `Backend/artifacts/`.

Generated artifacts:

```text
Backend/artifacts/
├── fuel_residual.json
├── conformal_q.json
└── metrics.json
```

The artifacts directory is ignored by Git. Until training is run, the API
explicitly reports `physics-baseline` and uses a conservative fallback interval.

## Start the backend

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app `
  --app-dir Backend --host 0.0.0.0 --port 8000 --reload
```

Health check:

```text
http://localhost:8000/api/v1/health
```

OpenAPI documentation:

```text
http://localhost:8000/docs
```

## Start the frontend

In a second terminal:

```powershell
Set-Location Frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

For the real backend, set this in `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_DATA=false
```

Open the URL printed by Vite, normally `http://localhost:3000`.

Build validation:

```powershell
Set-Location Frontend
npm run build
```

## API endpoints

### `GET /api/v1/health`

Returns API version and provider status.

### `POST /api/v1/plan`

Creates a route plan. Example body:

```json
{
  "origin": {
    "name": "Pune Freight Hub, Bhosari MIDC",
    "lat": 18.6275,
    "lon": 73.8443
  },
  "destination": {
    "name": "JNPT Container Port, Navi Mumbai",
    "lat": 18.9482,
    "lon": 72.9514
  },
  "vehicle_type": "medium_truck",
  "cargo_load_tons": 2.5,
  "departure_time": "2024-07-25T08:00:00+05:30",
  "deadline": "2024-07-25T18:00:00+05:30",
  "priority_weights": {
    "time": 0.2,
    "fuel": 0.2,
    "co2": 0.2,
    "cost": 0.2,
    "risk": 0.2
  }
}
```

The response includes route geometry, segment gradients, weather, hazards,
fuel intervals, CO2, cost, Pareto flags, SHAP values, counterfactuals,
departure analysis, and `data_status`.

### `POST /api/v1/rerank`

Reranks the stored plan when the frontend priority sliders change.

### `GET /api/v1/hazards.geojson`

Returns curated Maharashtra waterlogging/flood locations as GeoJSON.

### `GET /api/v1/report/{trip_id}`

Downloads the selected trip's carbon audit report.

## Data status

Every response identifies whether data is live, cached, or simulated:

- `live`: fetched successfully from an external provider.
- `cached`: returned from the SQLite request cache.
- `simulated`: deterministic fallback used when a provider or key is unavailable.
- `fuel_model: calibrated`: trained XGBoost and conformal artifacts are present.
- `fuel_model: simulated-trained`: training artifacts are not installed yet.

Cache location:

```text
Backend/data/cache/requests.sqlite3
```

The cache prevents repeated external calls and protects the demo from provider
timeouts. Do not treat simulated fallback routes or weather as operational data.

## Demo scenarios

`Backend/demo_scenarios.yaml` contains:

1. Pune to Mumbai during monsoon, comparing morning departure times.
2. Nashik to Pune mandi with a deadline before the auction.
3. Pune to Mumbai early departure to avoid the rain window.

Warm the cache:

```powershell
.\.venv\Scripts\python.exe Backend\scripts\precache.py
```

## Fuel model and risk methodology

### Physics-informed fuel

The baseline uses:

- Total vehicle mass and payload ratio.
- Rolling resistance.
- Road gradient and gravity.
- Aerodynamic drag using drag coefficient and frontal area.
- Speed and rain adjustments.

XGBoost predicts the residual between measured fuel and the physics baseline.
Monotonic constraints prevent load and segment length from reducing predicted
fuel. SHAP explains the residual model when the trained artifact is available.

### Climate risk

Segment risk combines:

- Forecast precipitation severity.
- Flood-prone/low-lying exposure.
- Steep ghat and rain-triggered landslide flags.
- Heat-related conditions where available.

Route risk is:

```text
0.5 * mean(segment_risk) + 0.5 * max(segment_risk)
```

### Optimization

The optimizer minimizes:

```text
time, cost, fuel, CO2, climate risk
```

Non-dominated routes are marked as the Pareto front. Priority weights only
choose among the non-dominated candidates; they do not hide the trade-offs.

## Important limitations

- OSRM does not provide truck restrictions; use `ORS_API_KEY` for
  truck-aware `driving-hgv` routing.
- Public APIs can rate-limit or fail; cached and simulated fallbacks are
  intentional and shown in `data_status`.
- Congestion is a modeled typical-day curve, not live traffic.
- Climate-risk flags are decision-support indicators, not official warnings.
- The model is trained on available telematics data and should be validated
  against the target fleet before operational deployment.
- The LLM is never trusted to calculate route, fuel, risk, or emissions values.

See [Backend/model_card.md](./Backend/model_card.md) for model scope,
assumptions, and validation notes.

## Docker

```powershell
docker compose up --build
```

The backend is then available at `http://localhost:8000`.
