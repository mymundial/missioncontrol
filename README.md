# Silverstone Mission Control — Pass 7-08-04

This pass fixes Comet Curve's ELF FM hand-back after mission audio completes.

## This pass

- **Comet Curve:** ELF FM still fades out for the rhythm track and completion sting, but restoration is now reasserted after the sting and on mission teardown so the radio cannot remain silently stuck at zero volume while its UI says On.
- **Lapland Launch:** existing mission-audio priority and radio restoration are unchanged.
- Mission Audio still takes precedence; no sustained double audio is introduced.
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

See `PRODUCTION-AUDIT.md` for the current result.
