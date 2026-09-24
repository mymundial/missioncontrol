# Mission Control — System Diagnostics correction (7.36.2)

## Corrected
- Restored the Santa-1 sleigh visual in System Diagnostics by removing the JavaScript/CSS opacity gate introduced in 7.36.0.
- Preloads `sleigh-stage-1.webp` and uses an empty image fallback alt so no text flashes in the visual while the WebP loads.
- Uses the exact eight supplied subsystem SVGs, recoloured to a fixed Mission Control light blue.
- System icons remain light blue regardless of Standby / Checking / Offline / Online / Blocked / Clear state.
- System names remain the standard muted blue-grey regardless of status; only the status value changes colour.
- Retains the agreed labels: CONTROL replaces RESPONSE, and GUIDANCE replaces CONTROL.
- Retains the title SYSTEM DIAGNOSTICS.

## Validation
- Full production build completed successfully.
- Production audit: 19 passed, 0 failures, 3 existing non-blocking warnings.
