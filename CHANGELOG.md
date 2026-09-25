# Pass 7.38.34 — MC02 icon placement correction

## Fixed
- Corrected the MC02 icon visual zone so it sits inside the 98px scan card instead of extending below the card.
- Centred each of the six icons in the space between the scan title and the `Tap to scan` state.
- Measured each SVG's actual visible artwork bounds and scaled the icons to approximately the same visible height, rather than matching their SVG viewBox sizes.
- Preserved the static icon treatment: no icon animation or extra telemetry layers.
- No changes to scan timings, mechanics, labels, card dimensions, completion behaviour, or other missions.

## Icon mapping retained
- Aero — Pit Perfect garage/fan
- Stability — Stunt Driving
- Power — Propulsion speedometer
- Control — Guidance steering wheel
- Traction — Control skidding car
- Response — Response cone diagram
