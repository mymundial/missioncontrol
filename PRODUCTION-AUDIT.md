# Pass 7.38.6 — Production Audit

**26 automated checks passed · 0 failures · 3 non-blocking warnings.**

Validated: production build, generated JS syntax, source/deploy parity, runtime references, dead-asset hygiene, asset integrity, CSS balance, route/handler coverage, the eight-system Lapland dependency, Reindeer Raceway mobile protections, circuit georeferencing, coordinate single-source behaviour, continuous forward Demo route travel, the original circuit SVG radar treatment at the refined 1.3x scale, post-MC01 circuit-radar bootstrap/refresh state, immediate checkpoint handoff, leave-without-completing route progression, Demo route-distance countdown, and the sharper marker-dominant radar hierarchy.

Pass 7.38.6 pulls the circuit back from 1.6x to 1.3x, makes the fixed user marker an opaque 18px core, removes circuit blur/drop-shadow, places the sweep beneath the circuit art, and increases the road body to 90% opacity.

After a completed challenge the next checkpoint is exposed immediately. If a live guest unlocks a challenge but leaves its activation radius without completing it, the skipped mission remains available in Missions and navigation advances after a short reliable-GPS dwell. Demo Mode exposes the next marker immediately and counts down remaining calibrated route metres while travelling forward along the circuit.

Existing non-blocking warnings remain: deployment footprint is 8.18 MB (above the 7 MB target), ELF FM still uses the test Radio Mast stream, and the web app manifest has no install icon.
