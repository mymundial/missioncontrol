# Circuit georeference — Pass 7.38.0

## Purpose
`CHECKPOINTS[*].lat/lng` is the single source of truth for each installation. The same coordinate now controls:

- live geofence/distance behaviour;
- its position on `assets/f1-circuit.svg`;
- the close-up circuit view in Radar after MC01;
- the approach path used by Demo Mode.

No per-installation SVG coordinates should be added.

## Calibration
The GP circuit geometry was matched to the centreline of `assets/f1-circuit.svg` and represented by one affine calibration in `src/modules/03-circuit-georef.js`.

The SVG viewBox is `0 0 210 126`. `geoToCircuitPoint(lat,lng)` converts a real coordinate directly into that viewBox.

MC01 (`52.07317077672548, -1.0116046670979981`) currently maps to approximately:

- SVG X: `88.88`
- SVG Y: `31.11`

This is the National Link Road / circuit-entry point used by the Circuit Link animation.

## Current checkpoint mapping

| Mission | SVG X | SVG Y |
| --- | ---: | ---: |
| MC01 | 88.88 | 31.11 |
| MC02 | 50.70 | 67.82 |
| MC03 | 57.84 | 82.59 |
| MC04 | 31.64 | 65.21 |
| MC05 | 31.49 | 31.48 |
| MC06 | 73.53 | 21.12 |
| MC07 | 96.59 | 21.45 |
| MC08 | 144.14 | 46.14 |
| MC09 | 180.05 | 72.86 |
| MC10 | 160.15 | 92.53 |
| MC11 | 131.15 | 108.99 |
| MC12 | 95.71 | 46.05 |

These values are outputs of the calibration, not independent configuration values.

## Updating an installation later
Only edit the checkpoint `lat` / `lng` in `src/modules/00-runtime-state.js` (or the relevant admin override during testing). Do **not** edit an SVG marker. The mapped position is calculated at runtime.

## Demo behaviour
Before MC01, Demo Mode retains the original generic radar. After MC01, the circuit is revealed and each subsequent demo approach starts roughly 180 m before the next checkpoint along the GP route, then progresses in lap direction until the mission activates.
## Demo route behaviour (7.38.1)
After MC01, Demo Mode maintains a persistent distance along `SILVERSTONE_GP_ROUTE`. It never seeds itself near the next checkpoint. Each demo leg advances only forward along the closed route until it reaches the next checkpoint's projected route distance. This same route centreline is also drawn inside the radar, so the animated user position and the visible circuit path are mathematically identical.

