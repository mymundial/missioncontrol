# Silverstone Mission Control — Pass 6.84

Pass 6.84 is the **final production-audit baseline** following the infrastructure, asset, CSS and JavaScript cleanup passes.

## Production status

- Production `dist/`: **6,642,092 bytes (~6.33 MiB), 39 files**.
- Runtime output is **byte-for-byte identical to Pass 6.83**; this pass does not intentionally change UI, mission logic, GPS behaviour, audio behaviour, saved-state behaviour or gameplay.
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
