# PUP.SCAN

A desktop photo booth that only unlocks when it sees a dog.

Four cuts are captured automatically once a dog has held still in frame, then
printed as a photo strip and a session receipt. Clicking the receipt opens
`05 PUP PROFILE`, where the ticket becomes the hero object.

## Running it

```bash
npm install
npm run dev
```

Needs a webcam, and a browser that will grant it — which means `localhost` or
HTTPS. Detection runs in the browser on TensorFlow.js COCO-SSD; the first load
downloads the model.

### Dev flags

| Flag | Effect |
|---|---|
| `?mock` | Fake detection, so a session can be run without a dog |
| `?debug` | Per-frame prediction list with accept/reject reasons |
| `?hold` | Parks on `02 DOG DETECTED` |
| `?profile` | Lands straight on `05 PUP PROFILE` once a session finishes |
| `?look=now\|a\|b` | Switches the printer-slot treatment |
| `?compare` | Adds the on-screen look switcher |

## Deploying

```bash
npm run deploy
```

Builds with the GitHub Pages base path and publishes `dist/` to the `gh-pages`
branch.

## Note

The layout is built for a 1920x1080 desktop viewport. It is not responsive yet.
