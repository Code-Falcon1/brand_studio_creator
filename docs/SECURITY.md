# Security notes

## API keys

This project is a **client-only** web app (no server / no proxy).

- Any API key you provide will be visible to anyone who can open DevTools in your browser.
- If you save a key in the app UI, it is stored in `localStorage` on your device.
- If you bake a key into the build via `REACT_APP_POLLINATIONS_API_KEY`, it becomes part of the shipped JavaScript and is public.

Recommendations:
- Use a limited/public key when possible.
- Rotate keys if you accidentally share them.

## Proxy mode

If you deploy with **Cloudflare Pages Functions** and set `POLLINATIONS_API_KEY` as a Pages environment variable, the browser never sees the secret key. In this mode, users enable **Settings → Network → Use server proxy** and the app calls same-origin `/api/*` endpoints.
