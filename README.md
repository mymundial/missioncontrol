# Silverstone Mission Control — Pass 7-00-00

Pass 7-00-00 builds on the 6.84 production-audit baseline and introduces the new **MC-00 system scan** onboarding flow plus the global masthead strapline cleanup.

## This pass

- Adds **MC-00 / System Scan** immediately after **Start Mission** and **Quick Demo**.
- Uses a simplified scan composition: Santa-1 visual, vertical scan beam, single live diagnostic line, and horizontal 0–100% progress bar.
- Removes **Santa's Sleigh Recovery** from the shared masthead / landing logo treatment.
- Keeps the streamlined source structure introduced by Passes A–E and rebuilds `dist/`.

## Production status

- Production `dist/`: **6,650,571 bytes (~6.34 MiB), 39 files**.
- This pass intentionally changes the guest onboarding UI/flow by adding MC-00 and removing the shared masthead strapline; the remaining mission logic, GPS behaviour, audio behaviour, saved-state behaviour and gameplay stay aligned with the 6.84 baseline.
- All deployed assets/fonts are referenced; no dead production files were found.
- No PNG/JPEG/WAV/TTF/OTF or temporary test files are shipped in `dist/`.
- Runtime images are WebP/SVG, audio is MP3, and fonts are WOFF2.
- Vercel remains a static deployment using `npm run build` and `dist/`.
- The legacy service worker remains only as a retirement shim: it does not intercept requests or create caches.

## Audit

Run the repeatable production audit with:

```bash
npm run audit
```

The audit rebuilds the app and checks JavaScript syntax, static references, dead assets, file signatures, CSS structure, Vercel configuration, the route/mission map, the approved Lapland Launch dependency, Power Pulse mobile protections, and the service-worker retirement state.

See [`PRODUCTION-AUDIT.md`](./PRODUCTION-AUDIT.md) for the final report and launch checklist. Historical pass notes have been moved to [`CHANGELOG.md`](./CHANGELOG.md).

## Run locally

```bash
npm run dev
```

Main app: `http://localhost:5173`  
Admin: `http://localhost:5173/admin`

## Build

```bash
npm run build
```

The canonical JavaScript source lives in `src/modules/`. `bundle-js.cjs` assembles those ordered source modules into the single browser payload `src/main.js`; only that generated bundle is deployed.

## Known pre-launch decisions

1. **ELF FM stream** — the current Radio Mast URL is still labelled in source as a test stream. Replace it if/when the final production stream is supplied.
2. **Add-to-home-screen icon** — the web app manifest intentionally has no install icon. This does not affect normal QR/browser use, but an icon should be added if home-screen installation is part of the guest experience.
3. **Physical-device QA** — complete one final iPhone Safari and Android Chrome smoke test with live GPS before public launch. The automated audit is structural and cannot replace real-device GPS/audio/viewport testing.
