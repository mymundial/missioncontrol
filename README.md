# Silverstone Mission Control — Pass 7-08-09

This pass gives MC-08 Jingle Beams / Propulsion Sync a cleaner, more legible three-hit timing game without introducing a new mechanic.

## This pass

- **Cleaner propulsion channels:** reduced decorative machinery and rebuilt the three rows as compact horizontal energy tracks.
- **Clearer sync target:** each channel has a defined SYNC window with a bright centre line; the window tightens on each round.
- **Progressive difficulty:** Channel 01 is most forgiving, Channel 02 is quicker/tighter, and Channel 03 is the fastest/most precise.
- **Persistent build-up:** successful channels stay energised and LOCKED while the next channel becomes active.
- **Responsive feedback:** restrained EARLY / LATE states reset the current channel quickly; accurate hits can read PERFECT.
- **Approach cue:** the existing Sync Pulse button brightens subtly as the travelling pulse approaches the target window.
- **Final payoff:** all three channels illuminate together and resolve to PROPULSION ONLINE before the standard mission-complete flow.
- No route, GPS, onboarding, radio or other mission behaviour was changed.

## Production status

- Production `dist/`: approximately **8.26 MiB / 45 files**.
- No new media assets were added in this pass.
- No WAV/source-master audio or development modules are shipped in `dist/`.
- Runtime images are WebP/SVG, audio is MP3, and fonts are WOFF2.
- Vercel remains a static deployment using `npm run build` and `dist/`.
- The legacy service worker remains a retirement shim only and does not intercept requests or create caches.

## Audit

```bash
npm run audit
```

See `PRODUCTION-AUDIT.md` for the current result.
