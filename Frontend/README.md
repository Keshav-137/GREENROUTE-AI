# GreenRoute AI – Climate-Aware Freight Route Optimization Platform

GreenRoute AI is a climate-aware freight route optimization platform designed for commercial logistics operators traversing complex topographical terrains such as the Western Ghats (Pune – Mumbai NH 48 corridor).

It unifies **SRTM 30m Digital Elevation Models (DEM)**, **real-time atmospheric radar observations**, and **calibrated multi-axle commercial vehicle fuel models** to evaluate multi-objective Pareto frontiers balancing transit time, fuel consumption, Scope-1 greenhouse gas emissions, toll expenses, and climate hazards (monsoon fog, heavy braking switchbacks, and runaway gradients).

---

## 1. Key Features

- **Multi-Objective Freight Optimizer (`/planner`)**:
  - Full corridor optimization between industrial hubs (e.g. Bhosari/Chakan MIDC Pune to JNPT Container Port Navi Mumbai).
  - Commercial vehicle presets (Tata Signa Heavy-Duty Rigid, Eicher Pro Medium-Duty, Tata Prima CNG, and Heavy Battery-Electric EV Hauler).
  - Cargo load slider with maximum GVW enforcement.
  - Interactive multi-objective priority sliders (Transit Time, Fuel Burn, CO₂, Toll Costs, Climate Risk) backed by real-time `/api/v1/rerank`.

- **Interactive Geospatial Map (`MapView`)**:
  - Rendered via **MapLibre GL JS** on dark vector tiles (**OpenFreeMap** - 100% free, no secret API key required).
  - Multi-alternative route geometries (NH 48 Expressway, Old NH 48 Khandala Ghat, SH 54 Panvel Bypass).
  - Highlighting of AI Recommended vs Dominated alternatives.
  - Segment-level Ghat risk heatmap with gradient slope (%) and elevation change (m) tooltips.
  - Interactive click-to-select and automatic corridor bounding (`fitBounds`).

- **Physics-ML Analytics & Explainability (`/analytics`)**:
  - **Pareto Efficiency Frontier (Recharts)**: Visualizes non-dominated candidates (Fuel vs Travel Time, sized by CO₂, colored by risk score).
  - **Temporal Departure Analysis (Recharts)**: Diurnal weather sensitivity and traffic congestion by departure slot.
  - **SHAP Feature Attribution**: Physics-ML impact vectors for road gradient profiles, stop-and-go thermal cycles, payload weight, and fog conditions.
  - **Counterfactual "What-If" Engine**: Explains dynamic savings (e.g., -20% payload saves 5.8L fuel and 15.3 kg CO₂).

- **Carbon & GHG Compliance Audit (`/reports`)**:
  - GLEC Framework v3.0 / IPCC Tier 2 direct Scope-1 emissions assessment.
  - Fuel consumption uncertainty bounds (±).
  - Auditable export action (`.pdf` / `.txt`).

---

## 2. Technology Stack

- **Framework**: React 18 with Vite and TypeScript (Strict mode)
- **Styling**: Tailwind CSS with custom Dark Forest palette (`#12231e`, `#1a5c47`, `#2f8a9d`, `#d8993a`, `#c0504d`)
- **Mapping**: MapLibre GL JS with OpenFreeMap dark vector tiles
- **State Management**: Zustand (`tripStore`, `routeStore`, `optimizationStore`)
- **Server State & Data Fetching**: TanStack React Query v5
- **Charts**: Recharts (ScatterChart, ComposedChart, BarChart)
- **Icons**: Lucide React

---

## 3. Architecture & Folder Structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── client.ts                 # Fetch wrapper with typed error handling & base URL
│   │   ├── endpoints.ts              # REST API endpoint definitions
│   │   └── generated/
│   │       └── api-types.ts          # OpenAPI specification contract types
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Collapsible brand navigation sidebar
│   │   │   ├── Topbar.tsx            # Context-aware title, system health & status chip
│   │   │   └── AppLayout.tsx         # Main responsive viewport container
│   │   │
│   │   ├── planner/
│   │   │   ├── TripForm.tsx          # Full parameter dispatch form
│   │   │   ├── LocationAutocomplete.tsx # Debounced geocoding search
│   │   │   └── VehicleSelector.tsx   # Fleet vehicle preset cards
│   │   │
│   │   ├── map/
│   │   │   ├── MapView.tsx           # MapLibre GL map viewport with controls
│   │   │   ├── RouteLayer.tsx        # GeoJSON LineString alternatives and active glows
│   │   │   ├── RiskHeatLayer.tsx     # Segment-level Ghat risk heatmap overlay
│   │   │   └── MapLegend.tsx         # Layer toggles and risk color scale
│   │   │
│   │   ├── routes/
│   │   │   ├── RouteCard.tsx         # Interactive logistics card with uncertainty bounds
│   │   │   └── RouteComparison.tsx   # Detailed comparative trade-off matrix
│   │   │
│   │   ├── optimization/
│   │   │   └── PrioritySliders.tsx   # 5-dimensional debounced re-ranking sliders
│   │   │
│   │   ├── analytics/
│   │   │   ├── ParetoChart.tsx       # Recharts scatter plot of Pareto efficiency
│   │   │   ├── ShapChart.tsx         # Recharts horizontal SHAP feature attribution
│   │   │   └── DepartureChart.tsx    # Diurnal weather risk and emissions by departure hour
│   │   │
│   │   ├── explainability/
│   │   │   ├── ExplainPanel.tsx      # Multi-objective decision intelligence narrative
│   │   │   └── CounterfactualCard.tsx # "What-If" sensitivity savings card
│   │   │
│   │   ├── reports/
│   │   │   └── CarbonReport.tsx      # Auditable Scope-1 GHG compliance summary & export
│   │   │
│   │   └── common/
│   │       ├── LoadingSkeleton.tsx   # Dark forest pulse placeholders
│   │       ├── ErrorState.tsx        # Actionable failure and retry states
│   │       └── DataStatusChip.tsx    # Real-time backend vs simulated badge
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx             # System overview & telemetry
│   │   ├── Planner.tsx               # Primary split-view optimization workstation
│   │   ├── Analytics.tsx             # Deep dive into Pareto & SHAP metrics
│   │   └── CarbonReports.tsx         # Scope-1 regulatory audit reporting
│   │
│   ├── store/
│   │   ├── tripStore.ts              # Origin, destination, cargo, vehicle state
│   │   ├── routeStore.ts             # Route candidates and selection state
│   │   └── optimizationStore.ts      # Normalized priority weights state
│   │
│   ├── hooks/
│   │   ├── usePlan.ts                # TanStack Query mutation for /api/v1/plan
│   │   ├── useRerank.ts              # TanStack Query mutation for /api/v1/rerank
│   │   └── useReport.ts              # PDF/audit download hook
│   │
│   ├── services/
│   │   ├── tripService.ts            # API & realistic Pune-Mumbai mock pipeline
│   │   ├── routeService.ts           # Corridor route catalog
│   │   └── geocodingService.ts       # OpenStreetMap Nominatim / local corridor geocoding
│   │
│   ├── mocks/
│   │   ├── mock_plan.json            # High-fidelity Pune-Mumbai benchmark dataset
│   │   ├── mock_routes.json          # Predefined corridor catalogue
│   │   └── mock_rerank.json          # Priority weight re-ranking baseline
│   │
│   ├── types/                        # Full domain TypeScript contracts
│   ├── utils/                        # Formatters (INR, CO2, Risk, Units) & Constants
│   ├── styles/globals.css            # Tailwind base, dark scrollbars, MapLibre overrides
│   ├── App.tsx                       # React Router & Query Client provider
│   └── main.tsx                      # Vite React entry point
│
├── .env.example                      # Documented environment variables template
├── .env                              # Local configuration
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # Strict TypeScript compiler options
└── vite.config.ts                    # Vite configuration with @ path alias & proxy
```

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- npm 9+

### Installation
```bash
cd frontend
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```env
# Backend API Base URL (FastAPI)
VITE_API_BASE_URL=http://localhost:8000

# Demonstration / Mock Mode Toggle
# Set to 'true' for standalone presentation mode; 'false' to connect to live FastAPI backend
VITE_USE_MOCK_DATA=true

# Vector Tile Provider (Dark OpenFreeMap - Free, no key required)
VITE_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/dark
```

### Development Server
Run Vite in development mode:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Production Build & Type Checking
```bash
npm run build
```
This runs `tsc` to verify zero TypeScript errors and compiles optimized assets into `dist/`.

### Preview Production Build
```bash
npm run preview
```

---

## 5. Backend Integration & OpenAPI Contract

When connecting to the live FastAPI backend:
1. Ensure the backend is running at `http://localhost:8000`.
2. Set `VITE_USE_MOCK_DATA=false` in `.env`.
3. To regenerate API TypeScript types directly from the running FastAPI OpenAPI schema, execute:
```bash
npm run generate-api-types
```

Expected REST Endpoints:
- `POST /api/v1/plan` – Multi-objective route planning
- `POST /api/v1/rerank` – Re-ranking based on custom priority weights
- `GET /api/v1/report/{trip_id}` – PDF carbon report generation
- `GET /api/v1/health` – Backend readiness and data pipeline health

