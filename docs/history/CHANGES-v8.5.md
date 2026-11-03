ASTRA v8.5

1. INTRO CAPTIONS — literal narration excerpts
- 00-welcome-v8.mp3 was NOT regenerated or modified.
- Captions now use only literal excerpts from the narration script.
- The recording was analyzed for speech/silence boundaries and the visual windows were aligned to those boundaries.
- Caption opacity fade shortened to 340 ms so short lines ("Others, hundreds.", "Look up.") can actually synchronize with the voice.

Literal caption sequence:
- Welcome to ASTRA.
- We begin here, on Earth, looking outward.
- In the next few minutes,
- we'll cross the real night sky and visit five stars at their true positions.
- Some are tens of light-years away.
- Others, hundreds.
- Look up.
- We're leaving home.

2. FINISH JOURNEY BOTTLENECK
- Removed synchronous canvas PNG capture from the Finish-button transition.
- The carry frame is now captured while Aldebaran is already stationary.
- Finale resize, AIT projection switch and initial camera write are split across separate animation frames.
- The carry frame masks the renderer warm-up and dissolves over ~2.7 s while the camera is still moving almost imperceptibly.
- Outro audio remains unchanged.

3. FINALE MAP QUALITY
- The hidden Aladin viewer is repurposed during the final stop to prewarm the exact finale camera route.
- It samples the same AIT projection, center path and FoV progression used by the final animation before the Finish button becomes available.
- This populates the browser/HiPS tile cache before the visible pan/zoom-out begins.
- Prewarming is disabled when Save-Data is enabled and keeps the existing low-memory safeguard.

Files modified:
- index.html
- finale.js
