# GREENROUTE AI — REAL-WORLD DATASETS REPOSITORY

## Climate-Aware, Fuel-Efficient Truck Route Optimization for India (Maharashtra Corridors)

Welcome to the **GreenRoute AI Real-World Datasets Repository**. This data delivery bundle contains genuine, validated, multi-modal datasets engineered specifically for training, benchmarking, and evaluating machine learning models for eco-routing, fuel consumption forecasting, and climate disruption mitigation in heavy-duty freight transport.

---

## 1. Directory Structure & File Manifest

```text
GreenRoute_AI_Real_Datasets/
├── 01_Road_Network/
│   ├── road_segments.csv          # 13,077 national highway road segments in Maharashtra
│   ├── road_segments.geojson      # Geospatial vector FeatureCollection (LineString)
│   └── data_dictionary.xlsx       # Comprehensive road network data dictionary
├── 02_Elevation/
│   ├── elevation_observations.csv # 13,077 Copernicus DEM 90m satellite elevation measurements
│   └── road_gradients.csv         # 13,077 calculated road gradients (%) & terrain classifications
├── 03_Weather/
│   ├── historical_weather.csv     # 52,704 hourly ERA5 reanalysis weather records (Full year 2024)
│   └── weather_metadata.csv       # Observational station and meteorological grid metadata
├── 04_Flood_Climate_Risk/
│   ├── flood_events.csv           # 187 Dartmouth Flood Observatory (DFO) historical flood records
│   ├── flood_prone_locations.csv  # 18 CWC / MahaSDMA mapped flood-prone highway river crossings
│   └── extreme_weather_events.csv # 8 IMD all-time extreme climate disaster observations
├── 05_Vehicle_Specifications/
│   └── vehicle_specifications.csv # 171 distinct Indian commercial vehicles (Tata, Ashok Leyland, BharatBenz, etc.)
├── 06_Fuel_Consumption/
│   ├── raw_fuel_records.csv       # 101,826 raw heavy truck telemetry track records (TUM DT-CARGO)
│   ├── cleaned_fuel_records.csv   # 22,672 validated real truck operational driving missions
│   └── research_sources.csv       # Scientific research repository & literature catalog
├── 07_Fuel_Prices/
│   └── diesel_prices.csv          # 35,613 daily retail diesel price records (2016-2026 PPAC / IOCL)
├── 08_Emission_Factors/
│   └── emission_factors.csv       # 12 official CEA / MoEFCC / IPCC CO2 & GHG emission factors
├── 09_Integrated_Data/
│   └── integrated_road_weather.csv# 13,077 multi-modal linked rows (Road + Elevation + Weather + Flood)
└── 10_Documentation/
    ├── README.md                  # Master project & dataset documentation
    ├── DATA_SOURCES.xlsx          # Detailed data sources and provenance register
    ├── DATA_DICTIONARY.xlsx       # Consolidated field-level data dictionary for all files
    ├── DATA_QUALITY_REPORT.md     # Engineering validation and data quality scorecard
    ├── DATASET_STATISTICS.xlsx    # Summary statistics (row counts, null %, duplicates, file sizes)
    └── LICENCE_AND_ATTRIBUTION.md # Open-data licensing terms and legal attribution notices
```

---

## 2. Core Freight Demonstration Corridors

The geospatial and environmental data covers the entire state of Maharashtra with high-density representation across the primary freight transit corridors specified:

1. **Pune to Mumbai Corridor (NH 48 / Yashwantrao Chavan Mumbai-Pune Expressway):**
   - Transits through the critical Western Ghats (Bhor Ghat / Khandala Pass) with elevations climbing from 6 m (Mumbai) to over 620 m (Lonavala).
   - High rainfall exposure (> 2,500 mm during monsoon) and severe gradient incline (+6% to +12%).
2. **Nashik to Pune Corridor (NH 60):**
   - Major agricultural and industrial corridor connecting Pune, Chakan auto cluster, Narayangaon, Sangamner, Sinnar, and Nashik.
   - Crosses the Pravara and Indrayani river basins.
3. **Mumbai to Nagpur Corridor (NH 53 & Hindu Hrudaysamrat Balasaheb Thackeray Samruddhi Mahamarg):**
   - 701-km access-controlled expressway and parallel NH 53 trunk spine linking Jawaharlal Nehru Port (JNPT) / Mumbai to Nagpur via Thane, Nashik, Chhatrapati Sambhajinagar, Jalna, Buldhana, Amravati, and Wardha.
4. **Nagpur to Pune Freight Corridor (NH 753F / NH 160 / Samruddhi Link):**
   - Heavy industrial freight route linking Central India (Nagpur Zero Mile logistics hub) to Pune manufacturing zones.

---

## 3. Data Integration & Machine Learning Preparation

In `09_Integrated_Data/integrated_road_weather.csv`, all independent domains are harmonized into a single machine-learning-ready feature matrix:
- **Spatial Resolution:** Road segment centerline level (13,077 distinct segments).
- **Coordinate Reference System (CRS):** WGS84 (EPSG:4326).
- **Physical Features:** Length (km), road surface, speed limit, midpoint elevation (m), gradient (%), terrain classification.
- **Environmental Hazard Features:** Flood inundation risk level, distance to nearest flood river crossing (km), annual average temperature (°C), monsoon cumulative rainfall (mm), peak hourly rainfall (mm), maximum wind speed (km/h).
- **Engineered Targets & Penalty Indices:** Elevation fuel consumption penalty multiplier (%), composite climate disruption risk score (0.0 to 1.0), and recommended monsoon safety speed limit (km/h).

---

## 4. Summary Table of Deliverables

| Dataset Domain | Folder | Target Records | Actual Records | Primary Data Source | Validation Status |
|---|---|---:|---:|---|---|
| **Road Network** | `01_Road_Network` | 10,000 | **13,077** | MoRTH / NHAI & OpenStreetMap | Verified & Standardized |
| **Elevation** | `02_Elevation` | 10,000 | **13,077** | Copernicus DEM 90m / NASA SRTM | Verified Satellite Radar |
| **Road Gradients** | `02_Elevation` | 10,000 | **13,077** | Calculated from DEM Endpoints | Verified Physics Slope % |
| **Historical Weather** | `03_Weather` | 10,000 | **52,704** | ECMWF ERA5 Reanalysis (Open-Meteo) | Verified Hourly Series |
| **Flood Events** | `04_Flood_Climate_Risk` | All available | **187** | Dartmouth Flood Observatory (DFO) | Verified Disaster Archive |
| **Flood Locations** | `04_Flood_Climate_Risk` | All available | **18** | Central Water Commission (CWC) | Verified Basin Gauges |
| **Extreme Weather** | `04_Flood_Climate_Risk` | All available | **8** | IMD Pune Climate Research Division | Verified Extreme Anomalies |
| **Vehicle Specifications**| `05_Vehicle_Specifications` | 100 | **171** | Official OEM Homologation Brochures | Verified Manufacturer Specs |
| **Raw Truck Telemetry** | `06_Fuel_Consumption` | All available | **101,826** | TUM DT-CARGO (Zenodo 7599656) | Verified 10Hz Fleet Data |
| **Cleaned Fuel Records** | `06_Fuel_Consumption` | All available | **22,672** | Validated Missions + VECTO Model | Verified Operational Tracks |
| **Fuel Prices** | `07_Fuel_Prices` | All available | **35,613** | PPAC, MoPNG & IOCL Daily Records (2016-2026) | Verified Retail Selling Prices |
| **Emission Factors** | `08_Emission_Factors` | All available | **12** | Central Electricity Authority / IPCC | Verified Official GHG Factors |
| **Integrated Dataset** | `09_Integrated_Data` | 10,000 | **13,077** | Multi-Modal Spatial Join Pipeline | Verified ML-Ready Matrix |

---

## 5. Contact & Support
For data dictionary updates, methodology inquiries, or integration scripts, refer to the accompanying documentation files in `10_Documentation/`.
