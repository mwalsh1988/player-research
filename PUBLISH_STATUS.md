# Research engine deployment checkpoint

Active: https://player-research.michaelbwalsh1.workers.dev/

Tavily and Cloudflare AI are connected. Live end-to-end verification completed November 16, 2026 for Ohio State, November 14-15: eight searches, 24 sources retrieved, 12 selected for analysis, seven cited player drafts and one team assessment saved to R2. Browser verification after reload confirmed the player drafts, school/status filtering and separate team assessment.

An initial AI context-window failure was fixed by ranking sources and bounding article input. Retries reused saved sources rather than repeating paid searches. School/status filters now preserve AI findings, and dashboard counts include completed reports. Fourteen tests pass, including the new large-source regression check.

Outputs remain AI drafts requiring review. Some findings are routine photo captions rather than strong editorial leads; content relevance and editorial specificity need further refinement. Pricing output has no connected market/sales/fill-speed data and must not be treated as a validated price recommendation.

Access remains enabled for the owner. GitHub automatic deployment is not configured; deployment uses the connected Cloudflare API. Credentials are stored only as Worker secrets.
