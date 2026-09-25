# Pass 7.38.19 — MC03 restore + relay audio

- Restored the earlier MC03 relay layout and readable node presentation while keeping interaction geometry and timing frozen.
- Removed the visible offset capture circles; the expanding pulse now visually meets the relay node rim within the existing success window.
- Restored one-line node captions: TRANSMITTER, RELAY 01–04 and RECEIVER; removed MISSION CONTROL and SANTA-1 from endpoint captions so all six labels align consistently.
- Retained the objective subtitle: “Restore two-way communications with Santa-1.”
- Kept the full-width Signal Strength bar and centred its title above the bar.
- Refined the live connection carrier into a brighter single travelling energy packet.
- Added web-optimised MC03 feedback audio: first 1s walkie-talkie sting for successful Relays 01–03, full walkie-talkie sting after Relay 04, and radio-tone feedback for a mistimed click.
- Delayed the incoming-transmission handoff until the final walkie-talkie sting has completed.

# Pass 7.38.18 — MC03 objective + relay clarity

- Updated MC03 subtitle to “Restore two-way communications with Santa-1.”
- Kept relay hit areas, positions, pulse scale and timing windows unchanged.
- Restyled relay hardware inside the existing hit area so the fixed capture ring is visibly centred around each node.
- Added a travelling carrier pulse to the currently active route segment.
- Removed Relay 01–04 captions beneath relay nodes while retaining transmitter/receiver endpoint labels.
- Moved SIGNAL STRENGTH above a full-width progress bar and removed WEAK/ACQUIRED/ROUTED/STRONG/LOCKED text from the visible UI.

# Pass 7.38.15 — MC03 Comms Relay interaction redesign

- reversed the over-compressed 7.38.14 relay layout and restored generous vertical breathing room so endpoint and relay labels are no longer squeezed.
- made the timing mechanic materially clearer: only the active relay exposes the large concentric capture ring and expanding pulse; future relays remain simple subdued nodes until armed.
- increased the active relay scale and contrast while keeping completed relays compact and locked, creating a stronger current / future / complete hierarchy.
- expanded the zig-zag route field and strengthened live-route feedback with a moving cyan dash; successful captures now send a short bright lock pulse through the completed route segment.
- improved endpoint typography so TRANSMITTER / MISSION CONTROL and RECEIVER / SANTA-1 have dedicated two-line hierarchy instead of cramped labels.
- strengthened the Signal Strength meter with more breathing room, quarter-stage markers and the existing WEAK → ACQUIRING → STABLE → STRONG → LINKED progression.
- relay timing windows, difficulty, Santa transmission audio, mission completion logic and checkpoint behaviour are unchanged.

# Pass 7.38.14 — MC03 Comms Relay clarity pass

- tightened the MC03 relay network into a cleaner, more instrument-like zig-zag layout while keeping the existing four-relay timing mechanic and difficulty unchanged.
- made only the current relay fully prominent; future relays now stay subdued until armed, while completed relays retain a restrained green locked state.
- made the fixed capture ring and expanding pulse read as one concentric timing interaction, removing inactive pulse clutter.
- made the route progressive: the live hop is highlighted in cyan, completed hops lock in sequence, and the Santa-1 receiver only brightens as the final relay is approached.
- strengthened successful relay feedback with a short lock burst while preserving the existing haptic and audio confirmation.
- upgraded Signal Strength into a clearer full-width meter with the progression `WEAK → ACQUIRING → STABLE → STRONG → LINKED`.
- no mission routing, completion logic, Santa transmission audio, checkpoint logic or radar behaviour changed.

# Pass 7.38.13 — Radar circuit crispness + scan layering

- removed the white outline from post-MC01 installation markers; markers now use a solid circuit-cyan body with only a tight restrained cyan halo.
- removed the remaining circuit SVG drop-shadow so the full-opacity circuit mask renders as a cleaner, harder-edged navigation trace.
- moved the radar sweep above both the circuit SVG and installation markers so they are visibly scanned by the radar beam.
- kept the fixed guest marker above the sweep so the user position remains the clearest navigation reference.
- circuit scale, georeferencing, route movement, checkpoint handoff and Demo countdown behaviour are unchanged.

# Pass 7.38.12 — MC01 Circuit Link scan language

- changed the MC01 mission subtitle to `You have now entered the live circuit zone.` from the moment the activation opens, including the scan state.
- removed the Silverstone S mark from the initial MC01 mission header; the S mark remains reserved for the ENERGY TRANSFER COMPLETE payoff.
- standardised the staged scan language around the mission name: `CIRCUIT LINK / SIGNAL DETECTED` → `CIRCUIT LINK / CONNECTION ESTABLISHING` → `CIRCUIT LINK / ENERGY ROUTING` → `POWER TRANSFER / ROUTING TO SANTA-1` → `RECOVERY SEQUENCE / INITIATED`.
- retained the kinetic-energy explanation as the supporting copy beneath the universal `MISSION COMPLETE` heading.
- scan timing, 3-second ENERGY TRANSFER COMPLETE hold, audio bloom and direct completion handoff are unchanged.

## 7.38.11 — Universal mission-complete hierarchy
- Standardised activation completion cards so the small redundant `MISSION COMPLETE` kicker is removed and the main completion heading is always `MISSION COMPLETE`.
- Preserved each activation's mission-specific outcome as the supporting sentence beneath the generic completion heading; when an existing completion had no separate copy, its previous completion title is retained as that outcome line.
- MC01 now changes the header support copy on completion to `You have now entered the live circuit zone.`
- MC01 moves the original Circuit Link recovery explanation into the completion card beneath `MISSION COMPLETE`, replacing `Santa-1's recovery has begun.`
- Completion supporting copy now uses the same approved challenge support-copy size, line-height and colour treatment as the mission-header support text.

## 7.38.10 — MC01 scan pacing + direct completion handoff
- redistributed MC01 scan timing across visible 25% / 50% / 75% / 100% beats, adding a mid-scan percentage marker while shortening the final 100% hold to 750 ms.
- removed the small explanatory paragraph from the `ENERGY TRANSFER COMPLETE` payoff so the state is cleaner and readable at a glance.
- holds `ENERGY TRANSFER COMPLETE` for 3.0 seconds.
- renders `CIRCUIT LINK COMPLETE` underneath the bloom before fading the bloom away, preventing the scan screen from flashing back between payoff and completion.
- retained the supplied Silverstone S mark and optimised Christmas Magic sting.

## 7.38.9 — MC01 energy bloom payoff
- Added the supplied Silverstone S mark above the Circuit Link title on the MC01 scan screen, using an optimised transparent WebP asset.
- MC01 now holds the completed 100% Energy Transfer state for 1.5 seconds so guests can consciously register the successful scan before the reaction begins.
- Added a full-screen Circuit Link energy bloom with a fast cyan/white sweep, radial energy pulse and a readable `ENERGY TRANSFER COMPLETE` payoff state.
- The energy bloom remains visible for 4.7 seconds before returning to the existing stable `CIRCUIT LINK COMPLETE` screen and `CONTINUE` CTA.
- Added the supplied `Christmas Magic 01` sting, web-optimised from 320 kbps to 96 kbps MP3 (about 54 KB), preloaded with MC01 when Mission Audio is enabled and fired with the bloom.
- Exiting MC01 now also cleans up any active bloom overlay and stops/resets the bloom audio.

## 7.38.8 — Final full-circuit radar state
- After MC12 / Northern Flight is completed, Radar now leaves the moving local-navigation view and shows the complete Silverstone circuit SVG centred within the radar face.
- The final circuit overview is fixed at 84% radar width (50.4% height to preserve the 210:126 SVG aspect ratio), giving the full circuit comfortable breathing room inside the bezel.
- The guest/user marker and all checkpoint/installation markers are removed in the final state.
- GPS and Demo position no longer translate the circuit after mission completion; the radar grid and sweep continue running so the screen still feels live.
- The post-MC01 navigation radar remains unchanged before Northern Flight is completed.

## 7.38.7 — Radar marker visual hierarchy
- Kept the approved 1.3x circuit framing and made the circuit body fully opaque for a cleaner, more solid navigation trace.
- Added only a very tight 1.5px circuit edge halo so the road stays crisp under the radar sweep instead of reading as blurred neon.
- Reduced the fixed guest marker from 18px to 12px and restored the bright white/cyan multi-stage glow used by the activation cue, making the user position smaller but more luminous.
- Increased circuit installation markers to 20px, larger than the road ribbon, and restyled them in the circuit cyan with a bright edge and restrained glow rather than a large white pulse.
- No georeferencing, route, checkpoint handoff, Demo countdown or scale behaviour changed in this pass.

## 7.38.6 — Circuit hierarchy + immediate checkpoint handoff
- Pulled the visible post-MC01 circuit SVG back from 1.6x to 1.3x so the fixed user marker is clearly wider than the circuit ribbon.
- Made the circuit user marker a fully opaque 18px core with a crisp border and removed the translucent halo treatment.
- Removed the circuit-art blur/drop-shadow and moved the radar sweep behind the circuit layer so the track remains sharp as the sweep passes.
- Increased the circuit body opacity to 90% for a cleaner plotted-road appearance without relying on glow.
- After a completed challenge, the next circuit checkpoint is exposed immediately instead of waiting for its proximity detection radius.
- If a live user enters a checkpoint but does not complete it, route navigation advances once they have reliably left that checkpoint's activation radius; the skipped mission remains stored in Missions.
- Demo Mode now reveals the next checkpoint immediately on completion, restarts route travel without the previous handoff delay, and counts down remaining calibrated route metres monotonically while travelling to it.

## 7.38.5 — Circuit radar scale refinement
- Pulled the post-MC01 circuit SVG back again from 1.95x to 1.6x so the fixed centre marker is clearly larger than the track ribbon.
- More surrounding circuit geometry is now visible within the radar, improving route context without changing the calibrated coordinate mapping.
- Retained the existing approximately 75% circuit opacity and restrained glow from 7.38.4.
- Demo/GPS movement, checkpoint positioning, georeferencing and refresh/bootstrap behaviour are unchanged.

## 7.38.4 — Circuit radar framing + opacity refinement
- Pulled the post-MC01 circuit SVG back from 2.3x to 1.95x so more local track geometry is visible around the fixed user marker.
- Increased the visible circuit body to approximately 75% opacity so the road reads more confidently without overpowering the centre marker.
- Reduced the circuit glow radius/intensity so the SVG reads as a cleaner technical navigation trace rather than a soft neon ribbon.
- Demo/GPS movement, checkpoint positioning, georeferencing and refresh/bootstrap behaviour are unchanged.

## 7.38.3 — Circuit radar state bootstrap fix
- Post-MC01 circuit radar now renders hidden by default and is only revealed after a valid user/circuit position has been calculated, eliminating the unpositioned SVG flash seen immediately after Circuit Link and on refresh.
- Demo Mode now persists its calibrated lap distance in saved app state and restores the exact route position after refresh.
- Older Demo sessions with no saved lap distance are seeded from the current in-range checkpoint or most recently completed checkpoint; immediately after MC01 this resolves from the Circuit Link master coordinate.
- Live-mode refresh keeps the circuit hidden until a fresh GPS fix is available rather than exposing stale/default SVG placement.
- Demo startup now clears any previous live GPS fix so Demo radar positioning cannot inherit stale live coordinates.

## 7.38.2 — Circuit SVG radar scale correction
- Restored the original `assets/f1-circuit.svg` silhouette as the visible post-MC01 radar circuit instead of the thin route-centreline polyline.
- Reduced circuit radar zoom from 4.6x to 2.3x so the SVG road ribbon reads at approximately the same visual width as the fixed centre user marker including its halo.
- Kept the calibrated `SILVERSTONE_GP_ROUTE` exclusively for GPS/Demo movement, so Demo Mode continues to travel monotonically along the circuit without changing the visual asset.
- The circuit SVG is rendered as a restrained cyan mask with a minimal glow while installation positions continue to derive from master lat/lng coordinates.
- Removed two already-retired, unreferenced production assets (`mission-audio-icon.webp` and `system-launch.svg`) so the expanded production audit remains clean.

## 7.38.1 — Continuous Demo circuit travel + radar track refinement
- Demo Mode now keeps a persistent route-distance position after MC01 and moves continuously forward around the calibrated GP lap between every subsequent mission.
- Removed the old behaviour that restarted Demo 180 m before each next checkpoint, eliminating backward movement and cross-track jumps.
- Demo traverses the full calibrated route distance to each installation before unlocking it, including the MC07 → MC08 lap wrap.
- Radar circuit rendering now uses the georeferenced route centreline itself rather than the thick filled `f1-circuit.svg` silhouette.
- Added a thin 1.35 px centreline plus restrained glow, both non-scaling, so the track remains crisp at the close radar zoom.
- Radar movement transitions shortened to match the smoother 100 ms demo route updates.

## 7.38.0 — Georeferenced circuit radar
- calibrated `f1-circuit.svg` to real Silverstone GP latitude/longitude coordinates using a single affine circuit georeference.
- added `geoToCircuitPoint()` so checkpoint coordinates are now the single source of truth for both geofences and SVG placement.
- MC01 Circuit Link node now derives from its master coordinate instead of a hard-coded SVG point.
- after MC01 completion, Radar reveals a close-up circuit layer that moves beneath the fixed centre user marker.
- next-checkpoint markers are placed from the checkpoint master lat/lng through the same calibration.
- Demo Mode now approaches each post-MC01 checkpoint along the real lap direction before unlocking it, while still jumping between missions.
- added a simplified real GP route centreline for route-progress/demo interpolation.

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

## 7.38.16 — MC03 Comms Relay visual-only recovery
- Reverted the 7.38.14/7.38.15 MC03 structural redesign so relay positions, click targets, target-ring geometry, pulse geometry and timing behaviour return to the known-working 7.38.13 implementation.
- No mission mechanics or difficulty were changed.
- Applied the approved premium look strictly through the visual layer: deeper glassy nodes, cleaner cyan route lighting, brighter active capture glow, restrained locked-state illumination, refined transmitter/receiver treatments and a segmented instrument-style Signal Strength bar.
- Future relays are visually quieter without changing their hit areas or layout.

## 7.38.17 — MC03 route-state polish
- Kept the known-working MC03 relay positions, target rings, pulse geometry, hit windows and timing unchanged.
- Reworked only the relay-route visual states: future links are faint dashed guides, the current live link is solid cyan, and completed links are stable solid green.
- Route segments remain centre-to-centre in the existing SVG geometry, while relay/endpoint surfaces are now fully opaque beneath their glass treatment so links no longer show through the nodes.
