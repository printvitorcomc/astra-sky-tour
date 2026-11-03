# Recovered version history

The repository reconstructs **23 surviving source/deployment snapshots**, from the
original coordinate-map prototype through the final v8.6.1 release. All are on
`main`; the repository initialization is followed by one commit per snapshot.

These are archive-import commits, not the original development commits. Their Git
timestamps reflect the import. The label **v0-map** is an archival label for the
original coordinate viewer, not a version number found in that HTML.

## Sources and order

| Order | Snapshot | Original artifact | SHA-256 |
| --- | --- | --- | --- |
| 1 | v0-map | `mapa_celeste_real_coordenadas.html` | `d6da92447dce8cd2ee2cb14c35915218b473b9fe045ceb4fae269bdd771b9201` |
| 2 | v1 | `ASTRA-final-project.zip` | `85db3ff9ddc0cfd42ffb10aa4787771a11a20870203e409d5af3961d44e5b3c1` |
| 3 | updated | `ASTRA-updated-project.zip` | `c0da346065172e42ed23690ebd4fd73d552f2e8eadecec573585970bc20fbb94` |
| 4 | performance | `ASTRA-performance-optimized.zip` | `026540bbd225e8c1831a39581487ab0518f104f22c08dbd9e0e5b337d44f0dc8` |
| 5 | immersive | `ASTRA-immersive-responsive.zip` | `3eab8b49b32d60046f308fbf947e63be6e0c4d738fb192d90bba43f2fe6d8492` |
| 6 | earth-intro | `ASTRA-earth-intro-finale.zip` | `22a7cf2b2916ec1581c15deb3f931af140438807c0acff5766089978af658007` |
| 7 | camera-audio | `ASTRA-camera-audio-refined.zip` | `313ce388f211f7d7bab5118b0694788c639453919b31c9f8a2768c61893eb464` |
| 8 | cinematic | `ASTRA-cinematic-refinement.zip` | `2272289807a18987d3fb8e366f3eefa2d2d190969cd84d89208e43fe9bb3ae40` |
| 9 | cinematic-v2 | `ASTRA-cinematic-refinement-v2.zip` | `4a6f5f39b36cca52241e18cfaf5f20b7793a547806a94cc6ebd3b53894352552` |
| 10 | cinematic-v4 | `ASTRA-cinematic-refinement-v4.zip` | `60a8f741841c6217e44c63509efc24937a711f12bb10145e2520a439522de981` |
| 11 | v5 | `ASTRA-state-of-the-art-v5.zip` | `98dc48e0eecfd913fcdb0094bf74836e18f3d5d926e5e7f6b2e8ff6b4642888d` |
| 12 | v6 | `ASTRA-state-of-the-art-v6.zip` | `4f41a687055388396e3e24037cebb28a89ddf310c1a85a22809f84d07efc7635` |
| 13 | v7 | `ASTRA-state-of-the-art-v7.zip` | `1eea0f7df09d9c24c774b6893287f5f039628719538f4e1915379622c8fc490a` |
| 14 | v7.1 | `ASTRA-v7.1-NETLIFY.zip` | `3bd9d9e68f8dd30e375a8b3723d71a7b5aee1433e28c1105d83d4a36a3889179` |
| 15 | v8-initial | `ASTRA-v8-NETLIFY.zip` | `8a25b853295faf00f33244a03b345186c7eaeb08ab2fa2a0f7c24166e2f3d503` |
| 16 | v8-refined | `ASTRA-v8-NETLIFY(1).zip` | `829f92715cacb94fc79247ab3f6ddc3ec7f4072ed6b0088f374f737a2b0dda54` |
| 17 | v8-final | `ASTRA-v8-NETLIFY-FINAL.zip` | `6ac5fdc96e360915437d10df269ee0473dd546808cb10e10330a030dae96ef09` |
| 18 | v8.2 | `ASTRA-v8.2-NETLIFY-FINAL.zip` | `7d8b1e88f05468b30b4a2fb304225b8179c3a03f53fa3964f82c1133f31d16e7` |
| 19 | v8.3 | `ASTRA-v8.3-NETLIFY.zip` | `75647e79ea8902d503716cd9f7d0ec5063486a292a51121814a5ab464ccaeffc` |
| 20 | v8.4 | `ASTRA-v8.4-NETLIFY.zip` | `467158ade832f9854d092fab80e22d1aa60be9f8a9e8c532581b557b3f1e2437` |
| 21 | v8.5 | `ASTRA-v8.5-NETLIFY.zip` | `7e0118e86c7806c8f1e105ad319e2915944500f80f0c5398726f72ff284b9929` |
| 22 | v8.6 | `ASTRA-v8.6-NETLIFY.zip` | `1cf009d131290d47059473337ac31cb47e363cadc9dcce55c7b5ae5fbe0b2f9c` |
| 23 | v8.6.1 | `ASTRA-v8.6.1-NETLIFY(1).zip` | `1a80c86ce60ee930c8c1b0d698b9c81e32bf00955be5fd1ae95be8c98d0a9909` |

Order follows explicit version identifiers, source/README content and the original
artifact sequence, rather than later upload dates. For example, v7's README says
it refines v6; v7.1 packages that same runtime for Netlify. Their identical HTML
and finale source were verified. The v7.1 commit records packaging changes.

The three distinct v8 ZIPs are all preserved: initial SFX build, refined Web Audio
build and the final welcome-narration asset. The cinematic-v2/v4 labels reproduce
their filenames; no missing cinematic-v3 or other build has been invented.

## Deduplication

Thirty-one ASTRA ZIP records were found in ChatGPT Library. Of these, 24 are
intermediate records representing 20 byte-distinct ZIPs. The remaining seven
records are copies of the v1/final archives already supplied with the project.
The intermediate duplicate groups below were verified byte for byte:

- `ASTRA-v7.1-NETLIFY(1).zip`, `ASTRA-v7.1-NETLIFY.zip`
- `ASTRA-v8.4-NETLIFY(1).zip`, `ASTRA-v8.4-NETLIFY.zip`
- `ASTRA-state-of-the-art-v6(1).zip`, `ASTRA-state-of-the-art-v6.zip`
- `ASTRA-v8.2-NETLIFY-FINAL(1).zip`, `ASTRA-v8.2-NETLIFY-FINAL.zip`

`ASTRA-updated-self-contained.html` was also recovered. Its six embedded audio
assets match the updated ZIP; replacing the data URIs with those original audio
paths reproduces `ASTRA-updated-project.zip`'s HTML exactly. It is a delivery
variant, so it does not create a duplicate source commit. The original coordinate
map is imported separately as the earliest snapshot.

## Public-repository packaging and safety

- Runtime files live in `public/`; documentation stays outside the deployed root.
- The supplied film soundtrack, including the embedded HTML copy, is absent from
  every public commit. Licensed background music remains optional.
- No ZIPs, private audit notes, TTS-generation scripts, credentials, temporary
  duplicate JS, offline mock renderers or QA captures are published.
- Historical Netlify/Vercel settings are adapted to the `public/` directory.
  The final tree uses the existing static Workers/Pages packaging.
- Historical behavior and known defects are preserved; importing a snapshot does
  not claim that its original bugs have been fixed.

The final v8.6.1 runtime, all seven narration files and `finale.js` remain unchanged
from the preceding public import. Only README/history/validation documentation
changes in that final tree. The HTML and finale source retrieved from
https://astra.renoviolab.com.br on 2026-11-02 matched the original final archive
byte for byte before its documented optional-music packaging adjustment.

The surviving release notes remain in [history/](history/). Later release notes
supersede earlier statements and parameters.
