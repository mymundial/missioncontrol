# Silverstone Mission Control — Pass 7-08-08

This pass adds persistent mission controls to Comms so the onboarding promise that Mission Audio can be changed later is now true.

## This pass

- **Mission Settings:** added a compact settings panel above ELF FM on the Comms page.
- **GPS Location:** toggle live location tracking on/off using the same radar icon from Mission Radar setup.
- **Mission Audio:** toggle mission voice, music and effects on/off using the same Mission Audio icon from onboarding.
- **Demo to live GPS:** Demo Mode stays deliberate; pressing GPS Location ON from Comms explicitly requests a fresh GPS fix and switches to live mode only after permission succeeds.
- **ELF FM:** remains independent from Mission Audio; its existing playback toggle is now labelled Radio to avoid ambiguity.
- **Onboarding copy:** now tells guests Mission Audio can be changed later in Comms.
- No mission gameplay, route order or mission-audio priority rules changed.

## Production status

- Production `dist/`: approximately **8.26 MiB / 45 files**.
- No WAV/source-master audio or development modules are shipped in `dist/`.
- Runtime images are WebP/SVG, audio is MP3, and fonts are WOFF2.
- Vercel remains a static deployment using `npm run build` and `dist/`.
- The legacy service worker remains a retirement shim only and does not intercept requests or create caches.

## Audit

```bash
npm run audit
```

See `PRODUCTION-AUDIT.md` for the current result.
