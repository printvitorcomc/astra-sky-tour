# ASTRA v8 — implementation notes

- Onboarding sky motion increased to a perceptible 32 s cycle; reduced-motion respected.
- Removed the EARTH marker/semantic anchor. The intro now begins from the exact onboarding view and runs as a continuous 22.8 s real-sky overview.
- Added editorial line: “The real sky, seen from Earth.”
- ASTRA progress now has upcoming/current/completed states, with gold current letter and accessible state labels.
- Reworked playback around one Web Audio AudioContext: music through GainNode, decoded narration buffers, 0.19 base gain / 0.045 voice duck, 250 ms duck and 1100 ms restore, next-narration preload, retry/continue recovery UI.
- Added visibility pause/resume UI.
- Finale retains the 44 s monotonic zoom, title cues, screen-space UI and carry frame, while adding a broad full-turn pan/rotation, full-viewport map sizing and separate label-safe bounds. End-card overlays the map and the old 3.2 s artificial hold is removed.
- Finale transformation/inversion and framing checks were run for portrait, short landscape, 16:9 and ultrawide geometries. JavaScript syntax and MP3 presence/duration were checked.

## Pending physical verification
- iPhone/Safari hardware playback/mix behavior and actual interruption/resume behavior.
- Android/Chrome and desktop visual pass for final frame sequences.

## Welcome narration asset
- Final `00-welcome-v8.mp3` supplied from the approved `google/gemini-3.1-flash-tts-preview` / `Gacrux` generation.
- Verified as MP3 mono, 24 kHz, 64 kbps, with a duration of 27.456 seconds.
- No runtime TTS, generation SDK or secret is included in the site.
