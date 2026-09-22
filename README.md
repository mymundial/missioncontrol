# Silverstone Mission Control — Pass 7-08-06

This pass refines the Sleigh navigation icon and locks the final system-status colour language through Northern Flight.

## This pass

- **Sleigh navigation:** simplified single-colour sleigh glyph; muted when inactive and cyan when selected, matching the other navigation icons.
- **Sleigh System Status:** status nodes removed for a cleaner text-only readout.
- **Status colours:** ONLINE is green, OFFLINE / BLOCKED remain red, and CLEAR is orange.
- **Lapland Launch:** CLEAR now reads orange in the final verification bank; ONLINE reads green.
- **Northern Flight:** once MC-12 is completed, the Sleigh LAUNCH state advances from CLEAR to green COMPLETE.
- No gameplay, route, GPS or mission-audio behaviour changed in this pass.

## Production status

- Production `dist/`: approximately **8.25 MiB / 45 files**.
- No WAV/source-master audio or development modules are shipped in `dist/`.
- Runtime images are WebP/SVG, audio is MP3, and fonts are WOFF2.
- Vercel remains a static deployment using `npm run build` and `dist/`.
- The legacy service worker remains a retirement shim only and does not intercept requests or create caches.

## Audit

```bash
npm run audit
```

See `PRODUCTION-AUDIT.md` for the current result.
