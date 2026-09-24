# Pass 7.38.7 — Production Audit

**26 automated checks passed · 0 failures · 3 non-blocking warnings.**

Validated: production build, generated JS syntax, source/deploy parity, runtime references, dead-asset hygiene, asset integrity, CSS balance, route/handler coverage, the eight-system Lapland dependency, Reindeer Raceway mobile protections, circuit georeferencing, coordinate single-source behaviour, continuous forward Demo route travel, original circuit SVG radar rendering at 1.3x, post-MC01 circuit-radar bootstrap/refresh state, immediate checkpoint handoff, leave-without-completing route progression, Demo route-distance countdown, and the revised circuit/user/installation visual hierarchy.

Pass 7.38.7 keeps the 1.3x circuit framing but changes the radar hierarchy: the circuit body is now fully opaque with only a tight 1.5px edge halo; the fixed guest marker is reduced from 18px to 12px and uses a stronger white/cyan glow; installation markers are enlarged to 20px, coloured to match the circuit, and use only a restrained edge glow so they remain larger and more solid than the track.

No georeferencing, Demo routing, checkpoint handoff, distance countdown or circuit-scale behaviour changed in this pass.

Existing non-blocking warnings remain: deployment footprint is 8.18 MB (above the 7 MB target), ELF FM still uses the test Radio Mast stream, and the web app manifest has no install icon.
