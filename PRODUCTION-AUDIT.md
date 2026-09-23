# Pass 7.27.0 — Production Audit

## Result

**19 automated checks passed · 0 failures · 3 non-blocking warnings.**

## Production footprint

- `dist/`: **8.195 MiB**
- Production files: **50**
- Versus Pass 7.26.0: **+137,160 bytes** (**+133.9 KiB**) with **no file-count change**.
- The footprint increase comes from the three replacement Aurora ring WebPs; no duplicate assets were added.
- No WAV/source-master audio is deployed.
- No test/temp files are deployed.
- Runtime images remain WebP/SVG and fonts remain WOFF2.

## Aurora Apex verified

- Replaced `aurora-ring-outer.webp`, `aurora-ring-middle.webp` and `aurora-ring-inner.webp` with the newly rebuilt concentric transparent ring artworks.
- The calmer deep-blue / light-green aurora direction is preserved while removing the visibly misaligned earlier artwork used in the previous pass.
- Aurora Apex ring stack geometry, spacing, scaling, active-state emphasis, gameplay timings, background behaviour and mistimed desync feedback remain unchanged.
- No mission copy, HUD structure, audio, routing or interaction logic was changed.
- `src/main.js` was regenerated via `node bundle-js.cjs` and remained functionally unchanged.

## Automated checks passed

- Production build completes successfully.
- Generated browser JavaScript parses successfully.
- Development JS modules are not deployed individually.
- No PNG/JPEG/WAV/TTF/OTF or test/temp files are present in `dist/`.
- Generated JS/CSS match their deployed copies.
- Runtime asset/font/script/style references resolve.
- Every deployed asset and font is referenced.
- Asset signatures match their extensions.
- CSS structure is balanced.
- Vercel remains configured for `npm run build` → `dist/`.
- Service worker remains retirement-only with no fetch interception/runtime caching.
- The 13-checkpoint route and handlers remain intact.
- Lapland Launch still verifies Comms via MC-03 Luffield.
- Power Pulse mobile protections and fixed high-speed geometry remain intact.

## Non-blocking warnings

1. **Deployment footprint:** 8.19 MB exceeds the 7 MB audit target, primarily because the full Lapland Launch music track remains intentionally retained.
2. **ELF FM stream:** current Radio Mast URL is still identified as a test stream and should be replaced when the production stream is supplied.
3. **Web app manifest:** no install icon is defined; normal browser/QR use is unaffected.

## Re-run

```bash
npm run audit
```
