# Pass 7.32.0 — Production Audit

## Result

**19 automated checks passed · 0 failures · 3 non-blocking warnings.**

## Production footprint

- `dist/`: **8.154 MiB**
- Production files: **51**
- Versus Pass 7.31.0: **+4,770 bytes** (**+4.7 KiB**) and **+1 file**.
- The added file is the supplied Radio setting SVG icon; no duplicate radio artwork was added.
- No WAV/source-master audio is deployed.
- No test/temp files are deployed.
- Runtime images remain WebP/SVG and fonts remain WOFF2.

## Comms / Mission Settings verified

- Mission Settings now presents `GPS Location`, `Mission Audio` and `Radio` as three equal top-row controls.
- The supplied radio artwork is deployed as `assets/radio-setting-icon.svg`.
- Enabled GPS, Mission Audio and Radio controls now apply a forced cyan illuminated icon treatment, so dark source icons no longer remain visually unlit in their ON state.
- The old Radio On/Off pill has been removed from the ELF FM waveform panel.
- Before tuning, the Radio setting reads `TUNE` and opens the existing ELF FM tuner; after tuning it functions as the Radio `ON / OFF` control.
- The ELF FM waveform is retained and its status line now resolves to `PLAYING`, `RADIO OFF` or `SIGNAL AVAILABLE` as appropriate.
- Radio stream source, tuner behaviour, mission-audio priority/ducking, GPS behaviour, mission gameplay and route order remain unchanged.

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
- Lapland Launch still verifies Comms via MC-03 Luffield rather than optional ELF FM tuning.
- Reindeer Raceway mobile protections and fixed high-speed geometry remain intact.

## Non-blocking warnings

1. **Deployment footprint:** 8.15 MB exceeds the 7 MB audit target.
2. **ELF FM stream:** current Radio Mast URL is still identified as a test stream and should be replaced when the production stream is supplied.
3. **Web app manifest:** no install icon is defined; normal browser/QR use is unaffected.

## Re-run

```bash
npm run audit
```
