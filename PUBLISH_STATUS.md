# Publication checkpoint - Cloudflare deployment active

Production is deployed at https://player-research.michaelbwalsh1.workers.dev/ using the `player-research` Worker and private R2 bucket of the same name.

Cloudflare Access protects all Worker traffic. Email-code sign-in is limited to the owner's configured personal email. The Worker additionally requires Cloudflare's validated `ctx.access` identity and ignores client-supplied identity headers.

Eight functional tests pass. A browser visit confirmed the live Cloudflare Access sign-in gate. Signed-in live news scans and hosted note-saving still require an authenticated end-to-end check.

Use `npm run build` and deploy `dist/server/cloudflare.js` with the repository's `wrangler.jsonc`. The Cloudflare Git integration is not configured; this first production deployment was uploaded through the connected Cloudflare API.

The earlier ChatGPT Site `appgprj_6afaa916ddd48191a8264a6aa882b7e4` is still unpublished; the Cloudflare deployment is now the active host. No credentials are stored in source.
