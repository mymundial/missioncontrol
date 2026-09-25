# Pass 7.38.31 — MC02 icon remap / static diagnostic cleanup

## Updated
- Remapped MC02 diagnostic icons to the requested Silverstone family:
  - Control now uses the guidance steering-wheel icon.
  - Traction now uses the skidding-car icon.
  - Power now uses the propulsion speedometer icon.
  - Response remains the cone diagram icon.
- Replaced the cropped Aero fan with the full Pit Perfect / garage icon.
- Removed all diagnostic icon animations for this pass.
- Rescaled the MC02 icon stage so the artwork fills the scan card space more appropriately.
- Kept green capture feedback restrained to the intended data layer where applicable.

## Files changed
- `src/styles.css`
- `assets/mc02-aero-pit-perfect.svg`
