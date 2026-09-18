# Pass 6.84 — Final Production Audit

## Result

**20 automated checks passed · 0 failures · 2 non-blocking warnings.**

The production runtime in Pass 6.84 is byte-for-byte identical to Pass 6.83. Pass 6.84 adds only audit/documentation tooling and establishes the cleaned application as the production baseline.

## Production footprint

- `dist/`: **6,642,092 bytes (~6.33 MiB)**
- Production files: **39**
- Browser JavaScript: **127,652 bytes**
- CSS: **141,874 bytes**
- Canonical JS source chunks: **21**
- Runtime assets: **29**
- Web fonts: **4 WOFF2 files**

## Automated checks passed

- Clean production build completes.
- Generated browser JavaScript parses successfully.
- Development JS modules are not deployed individually.
- No legacy PNG/JPEG/WAV/TTF/OTF or test/temp files are present in `dist/`.
- `src/main.js` and `src/styles.css` match their deployed copies exactly.
- All static runtime asset, font, stylesheet and script references resolve.
- Every deployed asset and font is referenced by the runtime.
- WebP, WOFF2 and MP3 file signatures match their extensions.
- CSS brace structure is balanced.
- Vercel is configured for `npm run build` → `dist/` static output.
- `/admin` retains the correct root asset base.
- The service worker is retirement-only: no fetch interception and no new cache creation.
- The 13-checkpoint route is present in the expected order from Entrance Gantry through Northern Flight.
- Every route checkpoint type has a render/bind or approved automatic flow.
- Lapland Launch Comms verification checks **MC-03 Luffield completion**, not optional ELF FM radio tuning.
- Power Pulse retains iOS long-press selection/callout protection.
- Power Pulse scenery geometry remains fixed at high velocity rather than scaling with speed.

## Non-blocking warnings / launch decisions

### 1. ELF FM production stream

The current stream remains:

`https://streams.radiomast.io/ref-128k-mp3-stereo`

The source still identifies this as a **test stream**. This is the only external runtime URL found by the audit. Replace it before launch if a final ELF FM stream is supplied.

### 2. Web app install icon

`manifest.webmanifest` has no icon definitions. This has no effect on normal QR-code/browser use. It only affects presentation if guests add the experience to their home screen.

## Service-worker position

The previous cache-first service worker has been retired. The remaining `sw.js` is intentionally a cleanup shim for older devices: it deletes legacy `mission-control-sleigh-*` caches, unregisters itself, and never intercepts network requests.

Keeping the shim through the first production deployment is the safer option for returning test devices that may still carry old registrations. It can be removed after the production transition once legacy test installs no longer matter.

## Required physical-device smoke test before public launch

The code/asset audit is not a substitute for a final real-device check. Before opening to guests, test at least one current iPhone/Safari and one Android/Chrome device through the following:

- Fresh first load from the QR URL.
- Returning load with existing local state.
- Mission Briefing → Mission Audio → Live/Demo setup card layout.
- Live GPS permission accepted, denied, and recovered after refresh.
- Real checkpoint detection/activation accuracy at representative circuit locations.
- Demo progression from Circuit Entry through the next mission.
- MC-02 Performance Scan complete flow and mobile viewport fit.
- MC-03 Luffield completion with ELF FM radio left untuned.
- MC-04 Power Pulse sustained maximum speed with scenery intact and no iOS text magnifier.
- Audio enable/disable and user-gesture playback behaviour.
- Sleigh, Missions and Comms navigation/state persistence.
- Lapland Launch verification and Northern Flight completion.
- `/admin` scrolling and GPS override controls.

## Re-run

```bash
npm run audit
```

A zero exit status means all blocking production checks passed.
