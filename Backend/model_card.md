# GreenRoute AI demo model card

## Intended use

The backend compares freight route/departure combinations for the three Maharashtra
demo corridors shown in the frontend. It is a decision-support demo, not a safety
critical dispatch or flood warning system.

## Fuel estimate

Fuel is a vectorized physics baseline with load, grade, rain and speed adjustments.
The current checked-in demo uses a deterministic correction-free baseline so the
demo is reproducible; an XGBoost residual and split-conformal calibration can be
added once measured trip labels are available. The UI uncertainty field is therefore
an explicitly conservative demo bound, not a validated confidence interval.

## Climate risk

`risk = 0.5 * mean(segment_risk) + 0.5 * max(segment_risk)`.
Segment risk combines IMD-style rain severity, a low-lying flood flag, and a
ghat/steep-grade landslide flag. The values and curated Maharashtra locations are
intended for corridor demonstration and must be replaced with verified municipal
or DEM layers before operational use.

## Data status and limitations

Every request-derived enrichment is written to `data/cache/requests.sqlite3`.
The checked-in route, elevation and weather providers are deterministic simulated
fallbacks (`data_status` reports this). Congestion is a modeled typical-day curve,
not live traffic. The CO2 factor is tank-to-wheel diesel at 2.68 kg CO2/L, sourced
from the repository's emission-factor dataset and IPCC/MoEFCC reference.
