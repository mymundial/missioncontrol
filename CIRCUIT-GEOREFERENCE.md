# Circuit georeference — Pass 7.38.5

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

## Demo and radar behaviour
Before MC01, Demo Mode retains the original generic radar. After MC01, Demo Mode maintains a persistent distance along `SILVERSTONE_GP_ROUTE`; it never reseeds near the next checkpoint. Each leg advances only forward along the closed route until it reaches the next checkpoint's projected route distance.

The radar draws the original `assets/f1-circuit.svg` silhouette at a 1.6x close-up scale, while movement follows the calibrated route centreline. Both remain registered through the same coordinate→SVG georeference, so checkpoint lat/lng remains the single source of truth. The 1.6x scale deliberately makes the fixed centre marker visually larger than the SVG road ribbon and exposes more local circuit geometry around the guest.

