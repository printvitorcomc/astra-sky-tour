ASTRA v8.4

Refinements from v8.3:
- Rewrote intro editorials to track the actual welcome narration closely.
- Re-timed the intro captions against the supplied 00-welcome-v8.mp3 recording.
- Raised music slightly during narration (duck level 0.075).
- Smoothed music duck/restore transitions (longer gain ramps on voice in/out).
- Reworked mobile portrait arrival composition: the camera now aims for the elevated final composition from the start of each leg, eliminating the late position jump.
- Improved real-sky loading quality and startup priority:
  - pinned high-priority Aladin script starts loading during HTML parse,
  - dynamic fallback remains intact,
  - DSSColor properties are preloaded,
  - main Aladin viewer starts immediately at the actual gate FoV, avoiding a late FoV change that previously delayed high-resolution tile requests,
  - first destination prewarm begins after the initial gate quality window,
  - loader handoff shortened.

No finale interaction/framing behavior was otherwise changed in this pass.
