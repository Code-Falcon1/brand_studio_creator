# Brand Studio (CodeFalcon Projects)

Brand-first React app to generate **images, videos, text, and audio** with the Pollinations API — built for creating **consistent social posts** using a brand palette, presets, variations, reference images, and an optional **exact logo overlay** on exported images.

## Features

- Image + Video + Text + Audio (TTS) types
- Uses Pollinations `/image/{prompt}`, `/video/{prompt}`, `/text/{prompt}`, `/audio/{text}`
- Brand profiles (company name, tone, colors) + logo upload → palette extraction
- “Generate variations” (same prompt, different seeds) for fast picking
- Reference image (palette/vibe hints)
- Mobile-friendly settings (collapsed sections) + big preview
- History saved in `localStorage` (API key stripped from URLs)
- English + Arabic UI (RTL auto-switch) via language toggle in the header
- Optional: try to include your brand logo in the scene (best-effort AI)
- Optional: add an exact brand logo overlay on image download (guaranteed)

## Contact

- contact@codefalcon.me

## Quick start

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## API key (recommended: runtime key in UI)

This is a **client-only** app (no proxy). Any key you use is visible in the browser.

You have 2 ways to provide a key:

1) **Runtime key (recommended for open-source demo)**
- Open the app → **Settings → API key**
- Paste your key → **Save**
- It’s stored in `localStorage` on your device only.

2) **Build-time env key (for local dev / your own deploy)**
- Copy `.env.local.example` → `.env.local`
- Set:
  - `REACT_APP_POLLINATIONS_API_KEY=...`
- Restart `npm start`

## Proxy mode (recommended for a public shared deploy)

This repo includes **Cloudflare Pages Functions** that proxy Pollinations calls so your key stays server-side:
- `GET /api/image?prompt=...`
- `GET /api/video?prompt=...`
- `GET /api/text?prompt=...`
- `GET /api/audio?text=...`

Steps:
1) Deploy to Cloudflare Pages (Functions included automatically)
2) In Cloudflare Pages → Project → Settings → Environment Variables, add:
   - `POLLINATIONS_API_KEY` (server secret)
3) In the app UI, enable **Settings → Network → Use server proxy**

Dev/testing proxy locally:
```bash
npm run build
npx wrangler pages dev build
```

## Seeds (how to get a similar background)

To reproduce a similar look, keep these the same:
- **Seed** (Settings → Generation → Seed → Custom)
- Prompt + negative prompt
- Model
- Output size (images) or aspect ratio + duration (videos)
- Brand profile + reference mode (if used)

You can also click **Lock seed** on a generated result.

## Deployment

### Cloudflare Pages (CLI)

```bash
npm run build
npx wrangler pages deploy build --project-name <your-project>
```

If you want a build-time key in Cloudflare Pages:
- Add `REACT_APP_POLLINATIONS_API_KEY` to your project’s environment variables (then rebuild/deploy).

For an open-source public deploy, it’s usually better to **not** bake a key into the build and let each user enter their own key in the UI.

## Security

See `docs/SECURITY.md`.

## Troubleshooting

- **Only some models work**: models can be alpha/slow/limited; try another model or smaller size.
- **Video feels “stuck”**: video generation can take 1–3 minutes; try `grok-video` first.
- **CORS / download issues**: use **Open** then save from the new tab if your browser blocks direct download.

## Tech

- Create React App (`react-scripts`)
- No backend, no proxy
