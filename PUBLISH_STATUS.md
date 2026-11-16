# Research engine deployment checkpoint

Active: https://player-research.michaelbwalsh1.workers.dev/

The staged Tavily search/article retrieval and Cloudflare AI synthesis pipeline is deployed. The AI binding is configured and a live structured-output call succeeded. Tavily has no API key configured; research runs are disabled with explicit setup instructions until TAVILY_API_KEY is added as a Worker secret.

Thirteen tests pass, including provider-fixture integration, citation rejection and Access boundary tests. Signed-in browser verification confirmed the live setup notice and disabled Run research control. Live search and article retrieval have not been tested; that requires the key and a real school run.

R2 retains job stages and reports. Player editorial findings and team pricing assessments remain separate AI drafts requiring review. No market/sales data is connected. Access remains enabled for the owner. The repository is manually deployed through the Cloudflare API; GitHub automatic deployment is not configured.
