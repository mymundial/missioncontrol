# Pass 7.38.35 — MC02 split-SVG diagnostic animation suite

## Scope
- MC02 Velocity Vault only.
- Preserve the verified 7.38.34 card/icon placement geometry and all existing scan timings/mechanics.

## Animation system
- **Aero:** split the original Pit Perfect artwork into garage/frame and fan assembly. During scan only the fan turns green and spins clockwise. Whole icon turns green on capture.
- **Stability:** replaced Stunt Driving with the supplied front-on Top Cars artwork. During scan the car gently tilts left/right while only the two original headlight shapes turn green. Whole icon turns green on capture.
- **Power:** split the original Propulsion speedometer into gauge and needle. During scan only the needle turns green and sweeps from zero to its original source-art position around the real hub. Whole icon turns green on capture.
- **Control:** retained the original Guidance steering-wheel artwork. During scan it moves from its existing left position to the equivalent right position and back; only the original outer ring turns green. Whole icon turns green on capture.
- **Traction:** split the original Control/skidding-car artwork into car and original skid-mark paths. During scan only those original skid marks turn green and carry the travelling green-white highlight. Whole icon turns green on capture.
- **Response:** split the original Response artwork into cones and original arrow/path. During scan only that original arrow/path turns green and carries the travelling green-white highlight. Whole icon turns green on capture.

## Preserved
- One-line Velocity Vault description: `Capture the engineering data needed for Santa-1.`
- Six-card 2x3 layout and verified icon band positioning.
- Existing scan timings `[1600,1900,1700,2000,1800,2200]`.
- `Tap to scan` → `Scanning…` → `Captured ✓` state flow.
- `Complete Scan` CTA and mission-complete behaviour.
