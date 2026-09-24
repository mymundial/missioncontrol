## 7.37.2 — MC01 circuit-entry correction
- corrected the Circuit Link animation marker so it is aligned to the circuit SVG at the Village / National Link Road entry area rather than the previous manual 69% / 50% position.
- marker/ripple overlay now shares the circuit SVG's 210×126 viewBox, keeping the marker registered to the track artwork across screen sizes.
- changed the generic mission-completion CTA to `CONTINUE`; its action still returns to the nav view the mission was opened from.
- enlarged the Power icon in the MC01 Circuit Energy readout while retaining the shared `system-power.svg` asset.
- retained the approved MC01 master coordinate `52.07317077672548, -1.0116046670979981`.

## 7.37.1 — MC01 Circuit Entry alignment
- updated the MC01 master GPS coordinate to `52.07317077672548, -1.0116046670979981`.
- moved the Circuit Link animation energy marker/ripples to the discussed circuit-entry point near Village.
- replaced the MC01 Power Transfer bolt artwork with the shared `system-power.svg` icon used elsewhere in the app.
- changed the mission completion CTA from `Return to Missions` to `Continue` when returning to the Missions page.

## 7.37.0 — Missions top shade refinement
- reduced the Missions top scroll shade from 18px to 8px so it no longer clips the active mission highlight.
- slightly softened the shade opacity while preserving the masthead-as-scroll-boundary effect.

## 7.36.9 — Missions top-bar scroll boundary
- removed the `MISSION LOG` heading and its separate divider line.
- aligned the missions scroll region directly to the persistent top bar.
- added a subtle top fade and stronger masthead shadow so mission rows disappear naturally beneath the top bar while scrolling.
- retained the existing bottom-nav scroll boundary behaviour.


## 7.36.8 — Missions log header + boundary polish
- replaced the plain Missions list with a dedicated `MISSION LOG` header section, matching the Comms page treatment.
- added a clipped missions scroll viewport with a clean top boundary and bottom disappearance behind the fixed nav bar.
- preserved existing mission row behaviour/statuses while improving readability during vertical scrolling.

# Pass 7.36.4 — Sleigh milestone image triggers

- Separated sleigh artwork stages from rebuild percentage thresholds.
- Stage 1: initial grounded state.
- Stage 2: MC01 Circuit Link / recovery initiated.
- Stage 3: MC05 Spirit Depot / CORE online.
- Stage 4: MC08 Jingle Beams / CONTROL online.
- Stage 5: MC10 Aurora Apex / NAVIGATION online / rebuild complete.
- Rebuild percentage behaviour is unchanged in this pass.

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
