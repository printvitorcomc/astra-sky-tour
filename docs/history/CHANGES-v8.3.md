ASTRA v8.3

Implemented changes:
- Added timed editorial intro captions (fade in/out, desktop/mobile responsive).
- Raised underscored music level during voice playback slightly.
- Reduced finale desktop wheel/trackpad zoom sensitivity.
- Restored faster/crisper sky loading behavior:
  - audio preloads for intro,
  - script preload for Aladin,
  - restored DSSColor survey source,
  - reduced loader fade delay,
  - restored longer initial stillness for sharp tile loading,
  - re-enabled sky preloader on most mobile devices (only blocks very low-memory devices).
- Preserved finale behavior while removing black borders by changing cover framing.
- Shifted mobile portrait arrival framing slightly upward during the final settle/zoom for better label alignment.

Patched files:
- index.html
- finale.js
