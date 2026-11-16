# Gravity Research Room

Private research prototype for ONIT Gravity Football. Player notes support editorial work. Separate school-level assessments support manual break pricing review.

## Run

`npm run build`, `npm test`, then `npm run dev` for a local preview. No dependencies are required. Local JSON storage under ignored `.sites-runtime` is separate from the hosted R2 bucket.

## Source updates

The server scans Google News RSS for each selected school and date range. It matches full roster names in headlines, saves source scans and retains previous research after source errors. No API key is required. This is source discovery, not AI article analysis: it does not read full articles, validate statistics, or automatically recommend price changes. Review an original source and add a player note; team assessments are separate, manual records. Publishing dates can differ from event dates.

The Google Sheet is a read-only snapshot loaded November 15, 2026. One apparent Brandon Innis / Brandon Inniss variation was merged; 256 athlete-school records remain. Card families are linked to each athlete; they are not inventory data. Source card IDs are not globally unique, so athlete-school IDs are used throughout.

Hosted data persists in the `BUCKET` R2 binding. The library reads the first 100 saved school scans and 200 saved notes per request; this is a prototype retention view and should be paginated before broad ongoing use. Cloudflare Access restricts the deployed site to the owner using email-code sign-in. The Cloudflare entrypoint requires platform-validated `ctx.access` identity on every research route. Mutation routes additionally require same-origin POST. No third-party keys or scheduled research emails are configured.

Initial November 14–15 findings are explicitly editorial drafts, carried over from the research session. They require source review before external use.

## Cloudflare deployment

The active site is https://player-research.michaelbwalsh1.workers.dev/. Build with `npm run build`; `wrangler.jsonc` deploys `dist/server/cloudflare.js` and binds the private `player-research` R2 bucket. Keep the Worker's Access application enabled for all traffic. GitHub automatic deployment has not been connected; this deployment was uploaded with the Cloudflare API.

Run `node --test tests.mjs cloudflare-tests.mjs` to test the core application and Cloudflare authentication boundary. `worker/index.js` remains the core app; `worker/cloudflare-wrapper.js` adds the Cloudflare boundary during the build. No API credentials belong in this repository.
