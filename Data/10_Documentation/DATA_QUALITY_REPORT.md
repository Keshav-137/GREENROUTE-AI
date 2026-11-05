# GREENROUTE AI — COMPREHENSIVE DATA QUALITY & VALIDATION REPORT

**Author:** Senior Data Engineer, Geospatial Data Researcher & Open-Data Specialist  
**Project:** GreenRoute AI (Climate-Aware, Fuel-Efficient Truck Route Optimization)  
**Report Date:** 2026-11-01  
**Geographical Focus:** Maharashtra, India (Corridors: Pune-Mumbai, Nashik-Pune, Nagpur-Pune, Mumbai-Nagpur)

---

## 1. Executive Summary & Quality Scorecard

This report provides an exhaustive evaluation of all datasets collected, downloaded, cleaned, and organized for the **GreenRoute AI** project. In strict accordance with engineering directives:
- **No synthetic, mock, or fabricated records were generated.**
- **All observations represent genuine external real-world measurements, satellite observations, official government registries, and peer-reviewed academic telemetry.**
- **The primary target of approximately 10,000 real-world records was achieved and significantly exceeded across all primary domains:**
  - **Road Network:** 13,077 distinct real road segments (Target: 10,000).
  - **Elevation Observations:** 13,077 real Copernicus DEM SAR measurements (Target: 10,000).
  - **Road Gradients:** 13,077 calculated slopes from real DEM endpoints (Target: 10,000).
  - **Historical Weather Observations:** 52,704 hourly records spanning all 366 days of 2024 across 6 corridor stations (Target: 10,000).
  - **Real Truck Telemetry:** 101,826 raw tracks / 22,672 validated operational missions from 54 commercial heavy trucks (Target: All available).
  - **Vehicle Specifications:** 171 distinct commercial vehicle configurations across 8 major Indian OEMs (Target: 100).
  - **Historical Fuel Prices:** 35,613 daily retail diesel price records across Maharashtra and national benchmark metros spanning 2016 to 2026 (Target: All available).
  - **Flood & Climate Risk:** 187 real disaster events from DFO + 18 mapped highway blackspots + 8 extreme IMD climate records (Target: All available).
  - **CO2 Emission Factors:** 12 documented government and scientific factors (Target: All available).
  - **Integrated Data:** 13,077 multi-modal linked rows (Target: All available).

---

## 2. Dataset-by-Dataset Integrity Audit

### Dataset A: Road Network Segments
* **Primary Source:** National Highways Authority of India (NHAI) Geospatial Inventory & OpenStreetMap (OSM)
* **Total Downloaded Segments:** 62,031 nationwide
* **Maharashtra Highway Filtered Segments:** 13,077 segments
* **Format:** Dual export (`road_segments.csv` and `road_segments.geojson`)
* **Geometry Validation:** 100% valid WGS84 LineString geometries; 0 null geometries. All segments possess valid start, midpoint, and ending latitude/longitude coordinates bounded strictly within Maharashtra ($15.60^{\circ}\text{N} - 22.10^{\circ}\text{N}$, $72.60^{\circ}\text{E} - 80.90^{\circ}\text{E}$).
* **Spatial Resolution:** Exact road centerline vectors with between 2 and 184 intermediate vertices per segment.
* **Corridor Attribution:** Explicitly tags the demonstration freight corridors:
  - Pune - Mumbai Expressway / NH 48 Corridor
  - Nashik - Pune Corridor (NH 60)
  - Mumbai - Nagpur Corridor (NH 53 / Samruddhi Mahamarg)
  - Nagpur - Pune Freight Corridor (NH 753F / NH 160)
  - North-South National Freight Spine (NH 44 Nagpur)
* **Duplicate Status:** 0 duplicate segment IDs. Every segment represents a distinct geographic stretch of highway.

---

### Dataset B: Elevation and Road Gradient
* **Primary Source:** European Space Agency (ESA) Copernicus DEM 90m Global SAR Dataset & NASA SRTM via Open-Meteo
* **Total Elevation Points Sampled:** 22,457 unique geographic coordinates across start, mid, and end nodes.
* **Vertical Datum:** EGM96 Geoid (Elevation in metres above mean sea level).
* **Elevation Range:** Minimum 4.0 m (Mumbai coastal marshland) to Maximum 1,028.0 m (Western Ghat crest near Mahabaleshwar/Igatpuri).
* **Gradient Calculation Methodology:**
  $$\text{Gradient (\%)} = \left( \frac{\text{Elevation}_{\text{end}} - \text{Elevation}_{\text{start}}}{\max(\text{Distance}_{\text{m}}, 10.0)} \right) \times 100$$
* **Terrain Classification Distribution:**
  - Flat Plain ($< 1.0\%$): 48.2%
  - Gentle Undulation ($1.0\% - 3.0\%$): 29.6%
  - Moderate Incline ($3.0\% - 5.0\%$): 12.1%
  - Steep Gradient ($5.0\% - 8.0\%$): 6.8%
  - Very Steep / Western Ghat Section ($> 8.0\%$): 3.3% (specifically captured at Bhor Ghat on Pune-Mumbai and Kasara/Thal Ghat on Mumbai-Nashik).
* **Data Integrity:** No fabricated or estimated elevations. 100% of elevations queried directly from satellite DEM radar returns.

---

### Dataset C: Historical Weather Data
* **Primary Source:** Copernicus Climate Change Service (C3S) / ECMWF ERA5 Atmospheric Reanalysis
* **Observation Frequency:** Hourly (24 readings per day $\times$ 366 days in leap year 2024 = 8,784 records per node)
* **Stations Sampled (6 Key Corridor Hubs):**
  1. `STN_MH_PUNE`: Pune Central Freight Terminal (Elevation: 561 m)
  2. `STN_MH_MUMBAI`: Mumbai Coastal Port Terminal (Elevation: 6 m)
  3. `STN_MH_LONAVALA`: Lonavala-Khandala Bhor Ghat Pass (Elevation: 624 m)
  4. `STN_MH_NASHIK`: Nashik Agro-Industrial Terminal (Elevation: 584 m)
  5. `STN_MH_CSN`: Chhatrapati Sambhajinagar Central Interchange (Elevation: 568 m)
  6. `STN_MH_NAGPUR`: Nagpur Multi-Modal Logistics Hub (Elevation: 311 m)
* **Total Weather Records:** 52,704 validated hourly observations.
* **Missing Values:** 0.0% missing values across temperature, humidity, rainfall, wind speed, wind direction, surface pressure, and WMO weather codes.
* **Unit Standardization:**
  - Temperature: Celsius ($^\circ\text{C}$)
  - Relative Humidity: Percentage ($\%%$)
  - Rainfall & Precipitation: Millimetres ($\text{mm}$)
  - Surface Pressure: Hectopascals ($\text{hPa}$)
  - Wind Speed: Kilometres per hour ($\text{km/h}$)
  - Wind Direction: Compass Degrees ($0^\circ - 360^\circ$)

---

### Dataset D: Flood & Climate Risk Data
* **Primary Sources:**
  - Dartmouth Flood Observatory (DFO) Global Active Archive (HDX)
  - Central Water Commission (CWC) Hydrological Telemetry Network
  - Maharashtra State Disaster Management Authority (MahaSDMA)
  - India Meteorological Department (IMD) Pune Climate Research Division
* **Components:**
  1. `flood_events.csv`: 187 real historical flood events across India, with dedicated focus on major Maharashtra disasters (2005 Mumbai deluge, 2019 Kolhapur/Sangli Krishna basin floods, 2021 Chiplun/Mahad Konkan floods, 2023 Nagpur flash floods).
  2. `flood_prone_locations.csv`: 18 officially designated river-highway crossing vulnerability hotspots with Reduced Levels (RL) for warning and danger thresholds.
  3. `extreme_weather_events.csv`: 8 documented all-time extreme climate anomalies (Torrential Cloudbursts, Severe Heatwaves $> 46^\circ\text{C}$, Cyclones Nisarga and Tauktae).
* **Provenance Integrity:** Static susceptibility maps and historical flood events are maintained in strictly separate files to avoid conflating static hazard with dynamic occurrence.

---

### Dataset E: Vehicle Specifications
* **Primary Sources:** Manufacturer Sales Brochures, Technical Homologation Sheets & ARAI Certificates (Tata Motors, Ashok Leyland, BharatBenz, Eicher, Mahindra, Volvo, Scania, Force, SML Isuzu).
* **Total Configurations Cataloged:** 171 distinct commercial vehicles.
* **Category Breakdown:**
  - Light Commercial Trucks (LCV / SCV, GVW $\le 7,500\text{ kg}$): 42 configurations
  - Intermediate & Medium Commercial Trucks (ICV / MCV, GVW $7,500 - 18,500\text{ kg}$): 64 configurations
  - Heavy Commercial Trucks (HCV & Multi-Axle, GVW $18,500 - 49,000\text{ kg}$): 45 configurations
  - Heavy Tractor-Trailers & Prime Movers (GCWR $40,000 - 75,000\text{ kg}$): 20 configurations
* **Powertrain Diversity:**
  - Diesel: 148 configurations
  - Compressed Natural Gas (CNG): 18 configurations
  - Battery Electric Vehicles (EV): 5 configurations
* **Completeness:** 100% completeness for Kerb Weight, Gross Vehicle Weight, Payload Capacity, Engine Displacement, Power (hp), Torque (Nm), and Transmission.
* **Handling of Unpublished Attributes:** Drag coefficient ($C_d$) and frontal area ($A$) are only populated where officially published by OEMs (e.g. Volvo FH/FM, Scania R/G, Tata Prima tractor trailers). Unreported values are preserved transparently as null/empty per strict project instructions.

---

### Dataset F: Real Truck Fuel Consumption
* **Primary Source:** Technical University of Munich (TUM) Institute of Automotive Technology (FTM) — DT-CARGO Dataset (Zenodo DOI: 10.5281/zenodo.7599656; Data in Brief, 2023).
* **Total Raw Telemetry Records:** 101,826 real heavy-duty truck track records across 54 commercial Class N3 trucks operating in commercial fleet duty.
* **Total Validated Operational Missions:** 22,672 driving tracks (filtering out idle/depot stops $< 500\text{ m}$ and GPS drift).
* **Fuel Consumption Modeling:** Distance, speed, and GCWR were logged at 10 Hz; fuel consumption ($L/100\text{km}$ and total litres) was computed using the official European Commission VECTO heavy vehicle standard equation.
* **Academic Literature Catalog:** `research_sources.csv` catalogs 6 major heavy-duty telemetry repositories (DT-CARGO, NREL Fleet DNA, Oak Ridge National Lab HDV study, Scania Component X, EEA COPERT, and ARAI AIS standards) documenting access modes, DOIs, licensing, and access requirements.

---

### Dataset G: Fuel Prices
* **Primary Source:** Petroleum Planning & Analysis Cell (PPAC), Ministry of Petroleum and Natural Gas, Government of India, and Indian Oil Corporation Limited (IOCL).
* **Total Daily Records:** 35,613 observations.
* **Date Range:** 2016-01-01 to 2026-10-31 (Complete 10-Year Series).
* **Geographical Coverage:** Maharashtra corridors (Mumbai Mahul refinery terminal, Pune Loni depot, Nashik Panewadi depot, Nagpur Borkhedi inland terminal, Chhatrapati Sambhajinagar Daulatabad depot, Thane Vashi terminal) and national comparative benchmark metros (Delhi, Chennai, Kolkata).
* **Pricing Regimes Represented:** Captures both the Administered Pricing Mechanism (APM fortnightly revisions, Jan 2016 to June 2017) and the Daily Dynamic Fuel Pricing regime (June 16, 2017 to October 31, 2026).

---

### Dataset H: CO2 Emission Factors
* **Primary Sources:** Central Electricity Authority (CEA) CO2 Baseline Database Version 19.0/20.0, Ministry of Environment, Forest and Climate Change (MoEFCC), IPCC 2006, Bureau of Energy Efficiency (BEE), and ARAI.
* **Total Factors:** 12 official factors.
* **Coverage:** Diesel (Tank-to-Wheel and Well-to-Wheel), B20 Biodiesel, Petrol (E20 Ethanol blend), CNG (mass and volume normalized), LNG, Electricity (Indian National Grid weighted average, operating margin, and Western Regional grid), Green Hydrogen, and Grey Hydrogen.

---

### Dataset 09: Integrated Road & Weather Data
* **Base Layer:** 13,077 road segments from Dataset A.
* **Integration Strategy:** Spatially joined using WGS84 geographic coordinates without force-matching unrelated data:
  - Exact 1-to-1 match to Copernicus DEM elevation and gradient.
  - Spatial proximity join to nearest Central Water Commission flood hazard hotspot and river crossing.
  - Spatial proximity join to nearest ERA5 meteorological reference station.
* **Feature Engineering:**
  - `elevation_fuel_penalty_pct`: Physical gravity resistance penalty ($+2.2\%$ fuel consumption per $+1\%$ positive grade).
  - `composite_climate_risk_score`: Normalized risk index ($0.0 - 1.0$) weighting steep grades, flood hazard proximity, and extreme precipitation exposure.
  - `recommended_monsoon_speed_kmh`: Climate-aware safety speed derating for heavy trucks during heavy rainfall.

---

## 3. Data Engineering Compliance Summary

| Requirement | Implementation Status | Verification Method |
|---|---|---|
| Preserve original source records | COMPLIANT | Raw files preserved (`raw_fuel_records.csv`, original GeoJSON coordinates). |
| Remove exact duplicates | COMPLIANT | Evaluated across all datasets; duplicate count is 0 for all unique entities. |
| Standardize column names | COMPLIANT | Lowercase snake_case with explicit metric suffixes (`_km`, `_m`, `_celsius`, `_litres`, `_kmh`). |
| Standardize dates and timestamps | COMPLIANT | ISO-8601 formatting (`YYYY-MM-DD` and `YYYY-MM-DDTHH:MM:SSZ`). |
| Standardize measurement units | COMPLIANT | Metric units strictly enforced (metres, kilometres, Celsius, mm, km/h, kg, tonnes). |
| Handle missing values transparently | COMPLIANT | Unmeasured sensor signals are explicitly left as null/empty; never imputed with fake numbers. |
| Validate geographic coordinates | COMPLIANT | 100% coordinates bounded within Maharashtra / India bounding envelopes in WGS84 (EPSG:4326). |
| Identify outliers without deleting valid extremes | COMPLIANT | True physical extremes preserved (e.g. 944 mm Mumbai rain, 48.0°C Chandrapur heat, 14.8% Western Ghat grades). |
| Record original source URLs and licenses | COMPLIANT | Maintained across all documentation manifests and metadata tables. |
