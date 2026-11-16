# Gravity Research Room

Private research prototype for ONIT Gravity Football. Player notes support editorial work. Separate school-level assessments support manual break pricing review.

## Run

`npm run build`, `npm test`, then `npm run dev` for a local preview. No dependencies are required. Local JSON storage under ignored `.sites-runtime` is separate from the hosted R2 bucket.

## Source updates

The current UI runs a staged research pipeline: Tavily web searches include the school and grouped roster names; article text is retrieved; Cloudflare Workers AI generates cited player editorial drafts and one team-level pricing assessment. Each stage saves to R2 and can be resumed from Update history. Unsupported athlete IDs, event dates, source IDs and evidence quotations are rejected. Snippets alone cannot generate a report. AI drafts require human review, and pricing assessments do not contain live sales or fill-speed data. The old RSS endpoint remains for backward compatibility but is not used by Run research.

Setup: create a Tavily API key at https://app.tavily.com/ and add it as a **Secret** named `TAVILY_API_KEY` in Cloudflare Workers & Pages > player-research > Settings > Variables and Secrets. The AI binding is already configured. Never put the key in source or browser code. Search and extract calls consume Tavily credits; each school uses up to eight advanced searches and one extraction batch. Pausing takes effect after the active stage. The R2 in-flight guard is best effort; avoid concurrent tabs running the same job.

Live AI connectivity and structured JSON were verified. The complete pipeline passes provider-fixture tests; live Tavily search/retrieval still needs the key and a real school run before it is verified.

The Google Sheet is a read-only snapshot loaded November 15, 2026. One apparent Brandon Innis / Brandon Inniss variation was merged; 256 athlete-school records remain. Card families are linked to each athlete; they are not inventory data. Source card IDs are not globally unique, so athlete-school IDs are used throughout.

Hosted data persists in the `BUCKET` R2 binding. The library reads the first 100 research summaries, 100 legacy school scans and 200 saved notes per request; this is a prototype retention view and should be paginated before broad ongoing use. Cloudflare Access restricts the deployed site to the owner using email-code sign-in. The Cloudflare entrypoint requires platform-validated `ctx.access` identity on every research route. Mutation routes additionally require same-origin POST. The Tavily key is not configured. No scheduled research emails are configured.

Initial November 14–15 findings are explicitly editorial drafts, carried over from the research session. They require source review before external use.

## Cloudflare deployment

The active site is https://player-research.michaelbwalsh1.workers.dev/. Build with `npm run build`; `wrangler.jsonc` deploys `dist/server/cloudflare.js` and binds the private `player-research` R2 bucket. Keep the Worker's Access application enabled for all traffic. GitHub automatic deployment has not been connected; this deployment was uploaded with the Cloudflare API.

Run `npm test` to test the core application and Cloudflare authentication boundary. `worker/index.js` remains the core app; `worker/cloudflare-wrapper.js` adds the Cloudflare boundary during the build. No API credentials belong in this repository.
