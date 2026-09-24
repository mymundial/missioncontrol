# Mission Control — core systems remap (7.36.3)

## Core system order
The eight restored Santa-1 systems now follow the physical lap experience from MC-03 to MC-10:

1. Comms Relay — COMMS
2. Power Pulse — POWER
3. Spirit Depot — CORE
4. Reindeer Raceway — PROPULSION
5. Comet Curve — GUIDANCE
6. Jingle Beams — CONTROL
7. Lightspeed Lando — RESPONSE
8. Aurora Apex — NAVIGATION

## Diagnostics grid
The two-column bank is intentionally row-interleaved so it reads top-down by column:

- Left: COMMS / POWER / CORE / PROPULSION
- Right: GUIDANCE / CONTROL / RESPONSE / NAVIGATION

## State logic
- Removed LAUNCH from the eight-system bank.
- All eight core systems now use the same STANDBY -> CHECKING -> OFFLINE/ONLINE model.
- Lapland Launch verifies those eight systems and produces launch clearance as the overall verification result, not as a system row.

## Icons
- GUIDANCE uses the supplied steering-wheel / drive icon.
- CONTROL uses the supplied Caterham icon.
- RESPONSE uses the supplied drift-course / traffic-cone icon.
- All eight system icons remain fixed light blue.

## Copy alignment
- Reindeer Raceway completion now identifies PROPULSION.
- Jingle Beams completion now identifies CONTROL.
- Lightspeed Lando completion now identifies RESPONSE.
