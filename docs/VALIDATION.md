# Validation

## Import checks

- All recovered ZIPs checked for integrity and SHA-256; duplicate copies compared byte for byte.
- All 23 imported public trees checked for credential patterns, private-key blocks, personal
  contact details and unexpected files before upload.
- JavaScript syntax, referenced DOM IDs and local asset paths checked.
- All narration files checked with ffprobe; final MP3s are unchanged.
- Public bundle contains no runtime TTS or backend credentials.
- Only `public/` is selected for deployment; docs and repository files are not served.

## Manual acceptance

On desktop, Android/Chrome and a real iPhone/Safari:

1. Confirm the sky loads, or a retryable error appears if CDS is unavailable.
2. Begin the journey; listen to the intro and all five stars in ASTRA order.
3. Confirm each Continue button waits for narration to finish.
4. Background the tab and resume; check camera/audio synchronization.
5. Finish the journey; check the finale, portrait labels, map gestures and replay.
6. If optional licensed music is configured, check its ducking during voice.

Physical iPhone/Safari audio/GPU behavior requires real-device validation.
Static checks are not a formal penetration test. CDS script, WASM and survey
availability remain external runtime dependencies.
