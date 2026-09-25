# Pass 7.38.33 — MC-02 icon fit/alignment cleanup

## Scope
- MC-02 only
- Static icon sizing and positioning only

## Changes
- Re-centred each MC-02 icon within a fixed visual zone between the tile heading and the "Tap to scan" label.
- Removed the conflicting relative positioning that was pushing icons off-centre and clipping them.
- Rebalanced per-icon widths/heights so the six icons read at a more consistent perceived size.
- Preserved the one-line Velocity Vault subtitle and left copy/layout outside the icon zone untouched.
- Bumped asset query version from `7.38.32` to `7.38.33` in `index.html`.
