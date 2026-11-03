# Audio

The seven included MP3s are static narration assets recovered from the final
archive. No API, account, key, or TTS request is needed to play them.

To add background music you have permission to publish:

1. Put the file at `public/audio/soundtrack.mp3`.
2. Set `soundtrackUrl` to `'./audio/soundtrack.mp3'` in `public/config.js`.
3. Deploy `public/` normally. Music will duck during narration.

The optional file is gitignored. A deployment made only from the GitHub clone
will therefore include narration without background music. Add the licensed
track to the deployment workspace if you want music in that deployment.

The supplied Interstellar recording is deliberately absent from every commit:
no redistribution license was provided with the project. Nothing in this
repository grants rights to that soundtrack.

`config.js` is public configuration, never a place for secrets. To disable music,
restore `soundtrackUrl: null`.
