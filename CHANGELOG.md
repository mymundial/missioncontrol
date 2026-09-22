## Pass 7-08-08 — Comms mission settings
- Added a compact Mission Settings panel above ELF FM on the Comms page.
- Added GPS Location and Mission Audio toggle controls using the same radar and audio icons from onboarding.
- Mission Audio can now be changed at any time from Comms without affecting ELF FM.
- GPS Location can be stopped and restarted from Comms; re-enabling it requests a fresh high-accuracy fix and explicitly switches Demo Mode to live GPS only when the user chooses the GPS control.
- The onboarding Mission Audio copy now points guests to Comms for later changes.
- Renamed the existing ELF FM Sound toggle label to Radio to distinguish station playback from Mission Audio.
- No mission gameplay, route order or audio-priority rules changed.

## Pass 7-08-07 — Sleigh nav icon scale + state stability
- Replaced the undersized Sleigh nav artwork with the approved, clearly recognisable sleigh silhouette.
- Re-cropped the raster states around the real icon content so its optical scale matches the other navigation icons.
- Increased the Sleigh icon display box slightly to compensate for its wider horizontal silhouette.
- Removed the active-state vertical transform and active filter so selecting Sleigh no longer jumps or shifts; the icon now changes colour only.
- Active and inactive assets share identical dimensions and registration.
- No Sleigh status logic, gameplay, GPS, audio or other navigation behaviour changes.

## Pass 7-08-06 — Sleigh status language + nav icon
- Rebuilt the Sleigh navigation icon as a minimal single-colour glyph with matching inactive and active cyan states.
- Removed status nodes from the Sleigh system bank for a cleaner text-only readout.
- ONLINE system states now read green; OFFLINE / BLOCKED remain red.
- LAUNCH CLEAR now reads orange on Sleigh and Lapland Launch.
- After MC-12 Northern Flight is completed, the Sleigh LAUNCH state advances from CLEAR to green COMPLETE.
- No mission gameplay, route, GPS or audio behaviour changes.

## Pass 7-08-05 — onboarding flow cleanup
- Removed the Quick Demo button from the splash page so Start Mission is the only entry action.
- Locked onboarding order to Start Mission → System Scan → Mission Briefing → Mission Audio → Mission Radar → Radar.
- Renamed the radar setup heading from Enable Live Radar to Mission Radar.
- Renamed setup actions to Enable GPS Location and Demo Mode.
- Demo Mode is now selected only from Mission Radar setup and goes directly to the radar; the redundant demo scan/introduction step has been removed.
- No mission gameplay, GPS detection logic, audio-priority behaviour or mission content changes.

## Pass 7-08-04 — Comet Curve ELF FM restore reliability
- Fixed a Comet Curve-specific radio hand-back case where ELF FM could remain logically On but silent after the mission completed.
- Shared radio restoration now explicitly reasserts playback before fading back to the user's listening level.
- Comet Curve adds a guarded second restore after its completion sting and again on mission teardown, so mobile browser audio suspension cannot leave the radio at zero volume.
- Lapland Launch audio-priority behaviour is unchanged.
- No gameplay, mission timing, visual or asset changes.

## Pass 7-08-03 — Mission audio priority over ELF FM
- Comet Curve and Lapland Launch bedding music now take priority over ELF FM whenever the radio is already playing.
- ELF FM quickly fades to silence as mission music starts, remains suppressed for the entire mission-audio sequence, and fades back to its previous listening level only after that sequence has finished.
- Comet Curve keeps the radio suppressed through the rhythm loop and dedicated completion sting, then restores the station after the sting ends (or immediately on a mid-mission exit).
- Lapland Launch keeps the radio suppressed through the backing track, Chief Engineer clearance and completion flow; on Return it remains muted through the Positive Celebration exit sting and only then fades back in.
- No mission gameplay, timing, visual or asset changes.

## Pass 7-08-02 — Lapland return transition
- Added the supplied Positive Celebration sting as a lightweight 96 kbps production MP3 (~24 KB).
- On Lapland Launch completion, the backing track now hands off to the celebration sting when the guest presses the return button, avoiding an abrupt silent cut.
- The sting respects the global Mission Audio setting and is only used for the completed Lapland Launch return flow.
- No gameplay, verification timing or light-show changes.

## Pass 7-08-01 — Lapland Launch audio finale
- Added the full supplied Las Vegas backing track as a compressed 112 kbps MP3; it loops while Lapland Launch remains open.
- Added the updated Chief Engineer clearance recording as a compressed mono 96 kbps MP3.
- Background music now starts with the mission, ducks for the final launch check and radio transmission, then punches back up after clearance.
- Added short generated radio static bookends around the Chief Engineer transmission.
- Added a restrained Mission Control / Las Vegas light-show payoff: moving reflected points, faceted light, cyan-white beams, sponsor glow and system-row pulses.
- ALL SYSTEMS GO now appears after the spoken clearance and light-show trigger rather than immediately on launch clear.
- Lapland audio is stopped and reset when the mission is exited or completed.
- Source WAV masters are excluded from production.

# Pass 7-08-00

- Refreshed Lapland Launch as the final MC-00 bookend using the same eight-system vocabulary and compact four-column status bank.
- Added the supplied Las Vegas sponsor logo above the Lapland Launch title with restrained Mission Control styling.
- Final verification now runs POWER / COMMS / CORE / CONTROL / PROPULSION / RESPONSE / NAVIGATION through STANDBY → CHECKING → ONLINE, then LAUNCH through STANDBY → CHECKING → CLEAR.
- Added progressive cyan/white panel illumination and a brief sponsor light pulse as checks resolve.
- Added an in-game ALL SYSTEMS GO payoff before the existing completion flow.
- No new gameplay mechanic; final verification remains deliberately simple and mobile-first.

# Pass 7-07-01

- Replaced the MC-09 gantry base artwork with a clean premium all-off gantry asset.
- Removed baked-in red glow from the lower lamps; inactive lights are now fully neutral.
- Re-aligned CSS lamp overlays to the replacement gantry lens centres.
- Preserved the flatter diffuser-style active red/green illumination from 7-07-00.
- No gameplay or timing changes.

# Pass 7-07-00

- MC-09 Lightspeed Lando light-treatment refresh only; reaction timing and gameplay are unchanged.
- Inactive gantry lamps now render as genuinely dark smoked diffuser lenses with no red halo or bright rim, masking the baked lower-row pre-glow in the gantry artwork.
- Active red lamps use a flatter LED/diffuser treatment with an even illuminated face, smaller internal highlight and stronger outward bloom instead of glossy spherical shading.
- Green capture lamps use the same believable diffuser language for visual consistency.
- No new image or audio assets added.

# Pass 7-06-00

- MC-08 Jingle Beams visual refresh: three propulsion chambers retained and upgraded with engineered housings, nozzles, target gates, trails, particles and lock bursts.
- Increased propulsion timing pace to approximately 1.6s / 1.25s / 0.95s end-to-end.
- Added EARLY / LATE miss feedback and a three-pulse progress indicator.
- Reworked Sync Pulse control to match the premium Mission Control visual language.

# Pass 7-05-01

- MC-07 Comet Curve upgraded into a beat-synchronised four-direction rhythm game.
- Added fixed LEFT / DOWN / UP / RIGHT receptor row and canonical centred arrow geometry.
- Added PERFECT / GOOD / MISS timing feedback, combo display and stronger miss response.
- Added beat-reactive field motion and receptor pulses.
- Integrated an optimised 32-second edit of the supplied arcade music track at ~129 BPM.
- Falling signals and target timing now lock to the track beat clock while retaining a silent fallback when mission audio is disabled.

# Silverstone Mission Control — Pass 7-00-00

## MC-00 system scan + masthead cleanup

- Adds a new MC-00 onboarding screen that sits immediately after **Start Mission** or **Quick Demo**.
- The MC-00 screen uses the existing Mission Control UI language: shared masthead, panel styling, Santa-1 visual, one live diagnostic line, a vertical scan beam and a horizontal 0–100% progress bar.
- Replaces the previous side-callout scan layout with a cleaner single-focus composition.
- Routes **Start Mission → MC-00 → Mission Briefing → Mission Audio → Enable Live Radar**.
- Routes **Quick Demo → MC-00 → Demo Mode → Radar**.
- Removes the global **Santa's Sleigh Recovery** strapline from the masthead / landing treatment so mission and page titles carry the context instead.
- Rebuilds the production `dist/` package.

# Silverstone Mission Control — Pass 6.83

## JavaScript modularisation (Pass D)

- Splits the former 2,077-line `src/main.js` source into 21 ordered, purpose-specific modules for runtime/state, audio, geometry, UI rendering, navigation, GPS, demo mode, admin, mission routing and individual mission handlers.
- Keeps browser delivery unchanged: `bundle-js.cjs` concatenates the modules into a single generated `src/main.js`, and production still serves one JavaScript file.
- Preserves the existing private IIFE runtime scope so mission state, GPS behaviour, audio, demo progression and mini-game logic do not change during the refactor.
- Keeps `src/main.js` as a generated local-development entry; edit `src/modules/*.js` as the canonical JavaScript source. `npm run dev` and `npm run build` regenerate the bundle automatically.
- Production `dist/` does not include the development module files, so modularisation adds no extra browser requests.
- The Pass 6.82 JavaScript was split and reassembled byte-for-byte before build-tool changes; the generated 6.83 bundle is verified against that baseline.
- No intended CSS, visual, asset, mission, GPS, gameplay, completion, storage or interaction changes.

# Silverstone Mission Control — Pass 6.82

## CSS consolidation (Pass C)

- Consolidates the production stylesheet without intentionally changing layout, typography, sizing, colour, interaction, mission logic, GPS logic, or game behaviour.
- Removes superseded declarations only where the exact same selector/property is redefined later in the same responsive context with equal or higher cascade priority.
- Removes empty rule/media blocks left behind by those superseded declarations and strips chronological Pass 6.x patch-note comments from the production CSS.
- Reduces CSS from 2,606 lines / ~161 KB to 2,366 lines / ~142 KB, removing 587 provably superseded declarations and 120 obsolete rule blocks.
- Leaves specificity-sensitive overrides and `!important` declarations in place where removing them could change rendering. This is deliberately conservative rather than a cosmetic rewrite.
- Rebuilds `dist/` from the consolidated source.

# Silverstone Mission Control — Pass 6.81

## Asset optimisation (Pass B)

- Converts the four Silverstone TTF/OTF web fonts to WOFF2 with the full glyph sets retained.
- Re-encodes all remaining runtime PNG assets as lossless WebP and verifies decoded RGBA pixels are identical before replacing the PNG sources.
- Keeps the existing sleigh/game WebP artwork and MP3 audio untouched to avoid unnecessary lossy re-encoding from already-compressed source material.
- Updates runtime asset/font references only; no mission logic, GPS logic, game logic, layout, sizing, typography rules, or interaction behaviour is changed.
- Rebuilds `dist/` from the optimised canonical source.

# Silverstone Mission Control — Pass 6.80

## Infrastructure cleanup (Pass A)

- Retires the legacy runtime caching service worker. The temporary `sw.js` in this pass is a one-release cleanup shim only: it deletes old `mission-control-sleigh-*` caches, unregisters itself, and does not intercept requests.
- Adds client-side cleanup for older Mission Control service-worker registrations/caches so returning devices can recover from stale deployments.
- Removes the duplicated `/public` asset tree; `/assets`, `/fonts`, `/src` and `/admin` are now the canonical source directories.
- Removes confirmed-unused production/source assets: the 3.6 MB Santa WAV master, unused Mission Audio SVG, and two unused Silverstone logo variants.
- Removes obsolete manual test HTML files, the unused Vite config, and unused font example/documentation files.
- Rebuilds `dist/` from the cleaned canonical source.
- No CSS, mission logic, GPS logic, game logic, typography, image encoding, or visual layout changes in this pass.

## Pass 6.76 — compact setup cards restored

- Fixes the setup-screen regression introduced by the viewport shell: Mission Briefing, Mission Audio and Enable Live Radar no longer stretch their cards to the bottom of the screen.
- Applies the same content-driven card geometry already used by Demo Mode across all four setup screens.
- Keeps the page itself full-height while leaving clear background space below each setup card.
- No mission/game logic changes.

## Pass 6.75 — setup card frame spacing

- Restores the lower viewport gap on Mission Audio so the panel no longer touches the bottom edge.
- Applies the same frame spacing to Mission Briefing and Enable Live Radar to keep the setup screens visually registered.
- No mission/game logic changes.

# Silverstone Mission Control — Pass 6.74

- Restores the Demo Mode introduction to the compact settings-card layout used by Mission Briefing.
- Removes the MC-01 placeholder activation page from the guest flow.
- Start Activation now runs the System Initiation Scan immediately and advances the demo route to MC-02.
- Bumps the service-worker cache to v74.

# Silverstone Mission Control — Pass 6.63

- Rebuilds the mobile shell so the shared masthead is truly full-bleed to the top and sides of the device frame.
- Centres the TELEMETRY label above the telemetry panel.
- Places the radar inside a dedicated flexible zone exactly between telemetry and the lower Mission Control state/action panel.
- Lets the radar grow to the largest safe circular size permitted by the available height and width while retaining comfortable padding.
- Keeps a deliberate gap between the lower Mission Control panel and bottom navigation.
- Keeps only the Mission Log and Comms message feed internally scrollable.
- Preserves the scrollable /admin configuration page.
- Bumps the service-worker cache to v63.

## Run locally

```bash
npm run dev
```

Main app: `http://localhost:5173`  
Admin: `http://localhost:5173/admin`

---

# Silverstone Mission Control — Games Pass 6.36

- Fixes demo/radar route progression so MC-05 Spirit Depot is reliably re-armed after Power Pulse.
- Adds route-state recovery that skips checkpoints already completed in saved browser state.
- Adds a second demo-target watchdog so Radar cannot remain indefinitely on SEARCHING after a mission transition.

# Silverstone Mission Control — Sleigh Pass 6.2

Pass 6.2 refines the Sleigh page hierarchy while keeping the GPS, Comms, missions, ELF FM and recovery architecture from Pass 6.1.

## Sleigh page changes

- Added more breathing space between the Mission Control masthead and the Santa-1 status card.
- Reduced `SANTA-1` to the same visual scale as the current recovery percentage.
- Rebuilt the 0–100 development bar as a progressive spectrum:
  - red at the opening of recovery
  - orange through the 40% region
  - yellow through the 70% region
  - green at 100%
  - only the achieved part of the spectrum is revealed; the future portion remains dark.
- Development Status now sits directly beneath the sleigh artwork.
- Removed the old 0 / 10 / 40 / 70 / 100 milestone-circle row.
- Added `SLEIGH SYSTEMS ONLINE` with seven compact LED-style system indicators:
  - Energy
  - Comms
  - Core
  - Guidance
  - Propulsion
  - Control
  - Nav
- LEDs are driven by actual mission completion state and illuminate with a filled blue glow rather than an outline-only state.
- The 70% sleigh artwork is slightly restrained in brightness/saturation so the 100% hero state has a clearer visual payoff.

## Recovery milestones retained

- 0% — initial grounded state
- 10% — after Circuit Entry
- 40% — after Power Pulse
- 70% — after Comet Curve
- 100% — after Aurora Apex
- Lapland Launch — final systems verification
- Northern Flight — final airborne completion

## Run locally

```bash
npm install
npm run dev
```

Or use the included zero-dependency server if preferred:

```bash
node server.js
```

Pass 6.3 updates sleigh layout, five milestone system nodes, and uses an asset-based sleigh nav icon.

Pass 6.4 moves node labels below the LEDs, softens LED glow, updates the recovery gradient, and renders the sleigh nav icon as a standard SVG image asset.


## Pass 6.5
- Communications page now starts with the ELF FM module directly beneath the Mission Control masthead.
- ELF FM is available to tune from the beginning of the experience.
- The tuner is now a Comms-only interaction and no longer controls MC-03 route progression.
- MC-03 Luffield is retained as a GPS checkpoint with a temporary Mission TBC placeholder.
- Final-system Comms verification checks whether ELF FM has been tuned.
- Message-feed count removed.

Pass 6.6 aligns Sleigh status copy and nodes, matches Santa-1/% typography to the ELF FM 87.7 title, refines spacing, and replaces the sleigh nav SVG with matched selected/unselected PNG assets.


## Pass 6.7 — Missions page
- Removed Mission Log / Route Missions / recovery summary header.
- First mission card now begins with the same masthead spacing as the Sleigh page.
- Removed the third descriptive line from mission cards.
- Added MC-01 Village / Circuit Entry as mission 01 with a temporary activation placeholder while retaining its automatic GPS activation architecture.

Pass 6.8 refines Radar, Sleigh, and Comms layouts per latest feedback.

Pass 6.9 aligns Radar spacing, Sleigh/Comms typography, navigation scale, and completion wording.

Pass 6.10 adds explicit mobile safe-area clearance above the app masthead so the Silverstone logo sits below iPhone camera / Dynamic Island regions.

Pass 6.11 moves the entire app content surface down beneath the iPhone camera/Dynamic Island safe area, with an explicit visible top offset even when the browser reports a zero safe-area inset.

Pass 6.12 uses the supplied stacked Silverstone logo on the landing page only and starts ELF FM automatically after a successful tune-in lock.

Pass 6.13 improves landing balance/background and makes Demo Mode pause on a readable system-check screen before beginning at MC-01 Circuit Entry.

Pass 6.14 uses the supplied official landscape Silverstone logo across all non-landing mastheads and adds the Santa's Sleigh Recovery strap beneath Mission Control on main pages.

Pass 6.15 enlarges and separates the Santa's Sleigh Recovery masthead strap and applies the full Mission Control masthead to setup and mission/game pages. The landing page and scanning animations remain intentionally masthead-free.

Pass 6.16 locks the Silverstone / Mission Control / Santa's Sleigh Recovery masthead to identical spacing and registration across all header pages.

Pass 6.17 rebuilds MC-02 Velocity Vault as a six-channel Audi Performance Scan with unique per-channel diagnostic animations.

Pass 6.18 fixes full-height mission scrolling, removes the redundant diagnostic counter, and upgrades Aero, Stability, Control and Traction animations.

Pass 6.19 shortens the Velocity Vault instruction copy and adds green completion states to Power and Recovery diagnostic visuals.

Pass 6.20 simplifies the Velocity Vault mission completion card to check / mission complete / data captured / return button.

Pass 6.21 replaces the MC-03 Luffield placeholder with Signal Relay: a three-stage radio-wave timing mission (Acquire / Boost / Transmit). Successful completion opens an Incoming Transmission state and plays the supplied Santa voice clip with a radio-style treatment. If ELF FM is already playing, it ducks beneath the Santa transmission and returns to its previous level afterwards. The mission finishes with COMMS LINK RESTORED; ELF FM remains a separate Comms feature available from the start.

Pass 6.22 centres mission challenge titles/instructions across all game pages, enlarges Luffield Signal Relay into a six-circle / three-bank layout with four interactive capture relays plus transmitter and receiver nodes, and updates the relay sequence to four stages. Santa's incoming transmission now has a carrier/static lead-in followed by a clean pause before the voice clip begins, preventing the opening Ho Ho Ho from being masked. ELF FM ducks to a much lower background level during the Santa transmission before smoothly returning to its previous volume.


## Games Pass 6.23
- MC-03 route/activation label changed from Signal Relay to ELF FM while the mission title remains Signal Relay.
- Luffield mission instruction shortened to “Relay the transmission and restore Santa-1 communications.”
- Removed the Acquire/Relay stage label and 0/4 counter from the relay panel.
- Moved the relay timing instruction to the top of the game panel and centred it.

## Games Pass 6.26
- Replaces MC-04 Power Pulse's three-source Energy Scan with a working retro arcade Acceleration Run prototype.
- Adds a rear-view pixel-style race car, perspective road, trackside markers, power/rev HUD, speed readout and speed streaks inside the existing Mission Control UI.
- Player presses and holds the accelerator to build speed through a non-linear acceleration curve; releasing causes the car to coast down.
- Maximum velocity must be sustained briefly to capture the racing-power output, with escalating haptics, a green power-lock state and a short energy-burst payoff.
- Uses a temporary vector/pixel car sprite so camera, scale and game feel can be approved before producing the final art asset.


## Pass 6.26 radar progression fix
- Hardened Demo Mode progression after mission completion so the next checkpoint cannot remain indefinitely on SEARCHING.
- Added an explicit fallback re-arm for the next route target after returning to Radar, including MC-04 Power Pulse after MC-03 Luffield.


## Pass 6.26 — Power Pulse visual environment refinement
- Removed the National Pit Straight gantry and in-game track-name copy.
- Removed the mountain/landscape silhouette for a clean open-sky horizon.
- Added red/white perspective rumble-strip markers along both sides of the road.
- Simplified road markings to one broken centre guide, removing the duplicate lane-marker clutter in front of the car.
- Retained the existing arcade acceleration mechanic; audio integration remains for the next pass.


## Games Pass 6.27 — Power Pulse sprite environment
- Replaced the temporary CSS/SVG driving environment with the approved production sprites.
- Uses separate pixel-art sky, grass, looping road and rear-view blue racing-car assets.
- Road and grass start from one shared CSS horizon variable so both planes meet the sky on exactly the same line.
- Road and grass texture scroll is driven by live vehicle speed; both stop when the car stops and accelerate with the car.
- Kept the existing Power Pulse acceleration mechanic, HUD, speed streaks, haptics and max-power completion flow.
- Car acceleration audio is intentionally not wired in this pass; it remains the next game-feel/audio pass.


## Pass 6.28 — Power Pulse framing cleanup
- Widened the animated road plane so the racing car sits clearly within the tarmac, with visible road surface on both sides before the rumble strips.
- Removed the duplicated visible “Press and hold to accelerate” instruction above the accelerator button while retaining a screen-reader live status.
- Shortened the mission instruction to “Reach maximum velocity and capture racing power for Santa-1.”

## Games Pass 6.29
- Power Pulse road perspective widened/deepened using existing sprites.
- Power Pulse game window made taller for a more immersive phone-screen composition.


## Games Pass 6.32 — Power Pulse audio integration
- Added the supplied Toyota GT86 acceleration recording to the Power Pulse acceleration run.
- Engine audio starts on press-and-hold and fades in with acceleration.
- Releasing the accelerator fades the engine down and pauses it without rewinding.
- Pressing again resumes the same recording from the exact point it previously reached, then fades back up instead of restarting.
- Maximum-power completion fades the engine out cleanly before the mission completion state.


## Pass 6.32 — Spirit Depot refinement
- Larger five-tank hero layout with slower six-tap-per-cell charging.
- Stability state moved to top and instruction added above A/B controls.
- Removed cell counter.
- Added smoke burst across the tank bank when all five cells are full.
- Simplified completion modal copy.


## Pass 6.32
- Replaced the Power Pulse acceleration audio with the newly supplied Toyota GT86 acceleration recording.
- Existing resume-from-current-position and fade-in/fade-out behaviour is unchanged.

## Pass 6.33
- Added the supplied `8bit Game Win.mp3` as the Power Pulse completion sting.
- The win sting starts on the same frame as the acceleration audio begins fading out, creating a short overlap rather than a hard cut.
- Engine fade extended slightly to 520 ms so the transition feels intentional.


## Pass 6.34 — Spirit Depot hero + tank vent audio
- Moves the A/B instruction below the tank bank and directly above the charge buttons.
- Enlarges and spaces the five energy tanks so they become the main visual focus of the mission.
- Adds a battery-style terminal/spout to the top of every tank.
- Each tank now vents its own smoke plume as soon as that individual tank reaches full charge, rather than one combined smoke event at the end.
- Adds the supplied Energy Vortex audio as a low-level charging bed and uses a short derived vent accent each time a tank fills.
- Final Spirit Depot completion remains the simplified MISSION COMPLETE / SPIRIT CORE CHARGED state with no descriptive paragraph.

## Games Pass 6.36 — Comet Curve directional rhythm game
- Replaces the old three-stage sequence-memory calibration with a dance-machine-style directional guidance game.
- Four lanes use left / down / up / right inputs while illuminated comet-direction signals fall toward a capture line.
- Correctly timed matching taps lock one guidance signal; 10 successful captures complete the mission.
- Missed signals and wrong directions do not reset the score, keeping the experience family-friendly and route-efficient.
- Pace increases after 3 and 7 successful hits for a stronger finish.
- Successful hits flash green and fill a 10-step guidance lock rail; completion remains GUIDANCE PATH RESTORED.

Pass 6.37: Comet Curve Pass 2 adds neon chevron notes and progressive double-fall patterns.

Pass 6.38: Comet Curve Pass 2.1 staggers multi-chevron sequences and makes neon chevrons more prominent.

## Pass 6.39 — Starstream Escapade
MC-06 Escapade is now Energy Interference: a 12-artefact tap-to-clear game with increasing on-screen density, pop FX/haptics and a Starstream stabilisation payoff.


## Pass 6.40
- Fixed Starstream Escapade artefact taps on mobile. Decorative overlay layers no longer intercept pointer events, and artefacts respond immediately on pointer-down.

Pass 6.41: Propulsion Sync now shows all three pulse tests stacked. Locked pulses remain visible; Level 2 uses the former Level 3 speed, and Level 3 is faster.

Pass 6.42: High-Speed Control rebuilt around one large five-column start-light gantry with three sequential reaction rounds and green capture feedback.

Pass 6.43: High-Speed Control upgraded to 4 reaction rounds and a hybrid artwork-based gantry with code-controlled red/green lamp overlays.


Pass 6.44 — Aurora Apex / Aurora Lock: replaced sequence-memory beacons with a large three-ring drag-to-align North Pole navigation puzzle inspired directly by the approved mockup.


## Pass 6.46 — Aurora Lock interaction + visual correction
- Replaced the code-drawn Aurora rings with the approved aurora/star ring artwork derived from the existing concept asset.
- Removed the left-side drag instruction and the bottom Santa-1 Navigation / Same Skies panel.
- Corrected ring hit mapping so visible ring position matches the pointer target.
- Added much larger grab zones and nearest-ring selection.
- Added click-to-select ring status cards; once selected, dragging anywhere on the dial rotates that ring.
- Rotation now uses incremental pointer-angle deltas to prevent cursor/touch jumps at 180°.
- Added easier near-lock and snap behaviour.


## Pass 6.47 — Aurora ring geometry
- Corrected concentric ring sizing and spacing.
- Shrunk middle and inner rings to create clean dark gaps between all three aurora bands.
- Removed the outer tick/degree marker ring.
- Reduced the centre compass so it no longer overlaps the inner aurora ring.
- Recalibrated ring pointer hit centres to match the updated visual positions.


Pass 6.48 — Recovery Mission setup refinement: Mission Briefing title, official briefing icon, setup kicker removed, sticky masthead divider, and global 16px/24px primary supporting-copy rule across onboarding and mission headers.

Pass 6.49: Mission Audio setup now matches Mission Briefing card/icon geometry and uses the supplied live-music icon converted from PSD for browser use.


Pass 6.50: setup icon optical sizing aligned; Mission Audio uses a cleaner line-weight music icon; Radar explicitly carries the persistent masthead and blue boundary in Demo mode.

Pass 6.51 — standardized Mission Briefing, Mission Audio and Enable Live Radar setup-page layout; added supplied radar icon.

Pass 6.52: Demo System Check now uses the full shared masthead and the same registered setup-card geometry as Briefing, Audio and Enable Live Radar.


## Pass 6.55 — GPS reliability hardening
- Activation now requires GPS accuracy of 25 m or better.
- Mission activation requires at least two qualifying fixes sustained for 1.2 seconds.
- Exit/pass dwell is ignored when GPS accuracy is worse than 40 m.
- The next-checkpoint fallback is conservative: 35 m accuracy or better, close to the next activation zone, clearly beyond the current exit zone, sustained for 1.8 seconds.
- Live in-range/target state is revalidated after refresh rather than trusted from localStorage.
- Detection remains more permissive so guests can still see an approaching checkpoint before activation quality is sufficient.

## Pass 6.56 — Vercel-ready package

This pass adds a self-contained static build for Vercel. No Vercel project-setting changes are required for a normal deployment from this project root.

- `npm run build` creates `dist/` with the browser app.
- `vercel.json` tells Vercel to deploy `dist/`.
- `/admin` rewrites to the app entry point so the GPS Admin page works directly.
- The downloadable ZIP is flattened so `index.html`, `package.json`, and `vercel.json` are at the archive root.

## Pass 6.61 — compact viewport layout
- Standard Mission Control masthead reduced globally across Radar, Missions, Sleigh, Comms, setup and mission/game pages. Landing hero remains unchanged.
- Guest app screens now compose to the available mobile viewport rather than relying on page scrolling.
- Missions and Comms retain intentional internal scrolling for the mission list and message feed respectively.
- Radar telemetry, instrument and action panel condensed; radar diameter now responds to viewport height.
- Setup, Sleigh and large game visuals use height-aware sizing with an additional short-phone breakpoint.
- Bottom navigation reduced to reclaim vertical space.
- Service-worker cache key bumped so redeployments pick up the new CSS immediately.


## Pass 6.68
- Standardised all mini-game challenge title/subtitle typography.
- Restored Audi rings proportions/scale on MC-02.
- Kept MC-02 at 2 columns x 3 rows while enlarging and clipping diagnostic visuals safely.
- Short-screen rules now compress the mini-game only, not challenge text.


## Pass 6.69
- MC-02 Velocity Vault diagnostics restored to a compact 2 × 3 bank layout without stretching to fill the page.
- Audi branding explicitly centred and kept at its intended aspect ratio.
- Diagnostic graphic windows are centred and isolated from labels/status copy.
- Confirm Performance Data now uses the shared mission CTA sizing with no MC-02-specific shrink.
- Global challenge title/subtitle sizing remains fixed across all mini-games.


## Pass 6.70
- MC-02 diagnostic labels are now centred as a complete label (for example `01 AERO`) rather than reading as left-weighted number/name pairs.
- Mission number and diagnostic name use the same type size across all six scan banks, including short-screen breakpoints.
- Diagnostic graphic canvases are normalised for more consistent visual weight.
- Traction is deliberately zoomed within its SVG viewBox so it no longer appears undersized beside Aero, Stability, Power, Control and Recovery.
- Recovery and Power visuals have been rebalanced to match the common diagnostic graphic scale.
- Service-worker cache bumped to v70.


## Pass 6.71

- MC-02-only alignment correction: diagnostic title, icon and READY TO SCAN state are hard-centred against each tile.
- Existing 2 × 3 layout, tile sizing, visual sizing and global challenge typography remain unchanged.
- Service-worker cache bumped to v71.


## Pass 6.72

- MC-02 diagnostic graphics moved slightly lower inside each tile to create a consistent gap beneath all six centred titles, especially Power and Recovery.
- Added a small amount of vertical breathing room above and below the Audi rings.
- Tile heights, global challenge typography, diagnostic title sizing, CTA sizing and all other app screens remain unchanged.
- Service-worker cache bumped to v72.


## Pass 6.77
- Locked Mission Briefing, Mission Audio, Enable Live Radar and Demo Mode to one shared setup-card geometry.
- Setup icons now occupy a fixed first grid row and cannot move vertically when copy length or CTA count changes.
- Removed vertical re-centring from the setup-card grid; title, copy and actions flow downward from the anchored icon instead.
- Kept the compact content-driven cards and visible page space below them from Pass 6.76.
- Service-worker cache bumped to v77.


## Pass 6.78
- MC-04 Power Pulse: removed speed-dependent scaling from the transformed road/grass planes to prevent high-speed clipping/flicker on iOS Safari.
- Speed is now conveyed through bounded texture travel, speed lines and existing car motion while the perspective geometry remains fixed.
- Added iOS long-press protections to the accelerator control (`-webkit-user-select`, `-webkit-touch-callout`, plus context/select/drag suppression) so press-and-hold no longer invokes text magnification/selection.
- Service-worker cache bumped to v78.

## Pass 6.79
- Lapland Launch final systems verification now checks MC-03 / Luffield completion for the Comms system.
- ELF FM radio tuning remains an optional Comms interaction and no longer affects mission or launch completion.
- Service-worker cache bumped to v79.
