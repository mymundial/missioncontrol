# Pass 7.38.36 — MC02 component animation correction

## MC02 only
- Aero: rebuilt as inline SVG so the garage/frame is fixed; only the fan group rotates. Fan is green during scan and remains green after capture; garage remains cyan.
- Stability: corrected the selected lamp geometry to the actual left/right headlight shapes. Car still performs the gentle stability tilt; only headlights remain green after capture.
- Power: rebuilt gauge/needle as inline SVG. Gauge remains completely static; needle pivots around the true gauge hub, starts at the zero end, then sweeps to the original/source needle position. Only the needle remains green after capture.
- Control: replaced the highlighted outer ring with the second/middle ring. Wheel retains the left-to-right-to-left calibration movement; only the second ring remains green after capture.
- Traction: car is explicitly static and cyan. Original skid-mark SVG geometry only changes colour via a travelling highlight; no scale/geometry animation. Only skid marks remain green after capture.
- Response: cones remain cyan. Original arrow/path receives a slower bottom-to-top green/white flow. Only the arrow remains green after capture.
- Removed superseded split assets no longer referenced by Aero, Power, or Control.
