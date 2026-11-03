# ASTRA v8.6.1 — audio-safe intro captions

- `00-welcome-v8.mp3` is unchanged.
- Re-timed the literal intro captions from measured speech/silence boundaries in the existing recording.
- Decoupled UI/editorial callbacks from narration startup: the Web Audio source now starts first, and a caption/UI callback can no longer interrupt, reject, or cancel narration playback.
- Preserved all v8.5/v8.6 finale loading and map-quality changes.
