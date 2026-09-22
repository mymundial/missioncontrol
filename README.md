# Silverstone Mission Control — Pass 7-08-03

This pass adds shared audio-priority handling so mission bedding never competes with ELF FM.

## This pass

- **Comet Curve:** ELF FM fades out as the rhythm mission begins, stays suppressed through the gameplay and completion sting, then fades back in after mission audio ends.
- **Lapland Launch:** ELF FM stays suppressed through the Vegas backing track, Chief Engineer clearance and final return sting, then fades back in.
- Mid-mission exits restore the radio cleanly.
- Mission Audio remains authoritative: if Mission Audio is disabled, the radio is not suppressed.
- No gameplay, mission timing, graphics or audio assets changed in this pass.

## Production status

- Production `dist/`: approximately **8.35 MiB / 45 files**.
- No WAV/source-master audio or development modules are shipped in `dist/`.
- Runtime images are WebP/SVG, audio is MP3, and fonts are WOFF2.
- Vercel remains a static deployment using `npm run build` and `dist/`.
- The legacy service worker remains a retirement shim only and does not intercept requests or create caches.

## Audit

```bash
npm run audit
```

Current result: **19 passed / 3 warnings / 0 failures**. See `PRODUCTION-AUDIT.md` for detail.
