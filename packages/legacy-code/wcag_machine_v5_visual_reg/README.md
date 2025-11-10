# WCAG Machine – Agentic Accessibility Compliance Pipeline

`wcag_machine` implements a modular, agent‑oriented pipeline for discovering Web Content Accessibility Guidelines (WCAG) violations, orchestrating outreach to site owners and deploying a dashboard to visualise compliance.  It combines automated search, scanning, enrichment, drafting and deployment tasks into separate agents that can be composed or replaced independently.  The project draws inspiration from the agentic orchestration pack described in the Kimi collaboration【450866152419010†screenshot】.

## Architecture Overview

The pipeline is broken into **five small agents** that communicate via Redis and can run in parallel.  Each agent exposes a simple command‑line interface, a health endpoint and a built‑in test, enabling them to be orchestrated by scripts or other agents without tightly coupling code【450866152419010†screenshot】.  The high‑level flow looks like this:

1. **Keyword → URLs (Agent 1)** – Given a search keyword, fetch up to 100 organic search result links using the [SerpApi](https://serpapi.com/) and push them into a Redis queue.  Output JSON summarises how many URLs were queued.
2. **Scan 1 URL (Agent 2)** – Pop a URL from the queue and launch a headless browser with axe‑core to measure WCAG violations.  The full report is stored in Redis and the number of violations is printed【488929966257325†screenshot】.
3. **Mine CEO (Agent 3)** – Derive the CEO’s contact information from the domain (placeholder implementation) and create a HubSpot contact.  Returns the contact ID and email【264826787727789†screenshot】.
4. **Draft Outreach (Agent 4)** – Generate a personalised e‑mail using the scan report and CEO details.  This module is a stub; integrate your favourite LLM or templating engine via `lib/draft.js`.
5. **Deploy & Health (Agent 5)** – Publish the live dashboard (e.g. to Render or Railway) and return a URL【271340365084928†screenshot】.

These agents are orchestrated by `orchestrate.sh`, which spawns each service concurrently and waits for all to succeed before declaring the pipeline live.  Because each service is ≤50 lines and self‑tests【450866152419010†screenshot】, you can swap, scale or schedule them independently.  In addition to runtime orchestration, this repository includes a **GitHub Actions workflow** that automates visual regression tests on every push or pull request.  The workflow lives at `.github/workflows/visual-regression.yml` and runs the capture script, checks the results against the golden baseline and uploads artefacts for review.  When a PR is labelled `update-golden` the workflow will automatically update the `test-golden` baseline with the new screenshots.

### Visual Regression Testing

The repository includes a **visual regression workflow** to guard against unintended UI changes.  The `scripts/capture‑all.js` script drives Playwright to take screenshots of key pages (dashboard, review modal, etc.) and writes them into `test‑artefacts`.  The Jest‑style test `test/visual‑capture.test.js` uses `pixelmatch` and `pngjs` to compare live captures against committed baseline images within a 2 % threshold.  On CI, the `visual‑regression.yml` workflow runs these steps on every push or PR, uploads artefacts for inspection and, when the `update‑golden` label is applied to a pull request, commits the new screenshots into the `test‑golden` branch【138200628228501†screenshot】.

### Repository Structure

```text
wcag_machine/
├── agent‑keyword.service.js       # Agent 1: fetch SERP results and queue URLs
├── agent‑scan.service.js          # Agent 2: run axe‑core scan on a URL
├── agent‑ceo.service.js           # Agent 3: find CEO contact and create HubSpot contact
├── agent‑draft.service.js         # Agent 4: draft personalised e‑mail (stub)
├── agent‑deploy.service.js        # Agent 5: deploy dashboard (stub)
├── orchestrate.sh                 # Shell orchestrator to run all agents in parallel
├── scripts/capture‑all.js         # Playwright script to capture UI screenshots
├── test/visual‑capture.test.js    # Visual diff test using pixelmatch
├── test‑artefacts/                # Generated screenshots (tracked via .gitkeep)
├── test‑golden/                   # Committed baseline images for comparison
├── lib/                           # Helper modules (redis, serpapi, scan, ceo, draft, hubspot, deploy)
├── .github/workflows/visual‑regression.yml  # CI workflow for visual regression
└── README.md
```

## Installation

1. **Prerequisites:**
   * [Node.js ≥ 20](https://nodejs.org/) and `npm`.
   * A [Redis](https://upstash.com/) database; the scripts use [Upstash](https://upstash.com/) via REST.
   * API keys for SerpApi (`SERPAPI_KEY`) and HubSpot (`HUBSPOT_API_KEY`).
   * Optional: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for Redis; `DEPLOY_URL` for deployment.

2. **Clone and install dependencies:**

   ```bash
   git clone <your‑repo>
   cd wcag_machine
   npm install
   ```

3. **Set environment variables:**  Create an `.env` file or export variables in your shell:

   ```bash
   export SERPAPI_KEY=your_serpapi_key
   export UPSTASH_REDIS_REST_URL=your_upstash_url
   export UPSTASH_REDIS_REST_TOKEN=your_upstash_token
   export HUBSPOT_API_KEY=your_hubspot_key
   export DEPLOY_URL=https://your‑dashboard.onrender.com
   ```

## Usage

### Running Agents Individually

Each agent is a standalone script.  For example, to fetch URLs for the keyword “oil”:

```bash
node agent‑keyword.service.js oil
# → {"ok":true,"count":100,"urls":[...]}
```

To scan a specific URL:

```bash
node agent‑scan.service.js https://example.com
# → {"ok":true,"url":"https://example.com","violations":12}
```

### Orchestrated Pipeline

Run the entire pipeline with a single command.  The orchestrator takes a keyword, launches all agents concurrently and waits until they complete:

```bash
bash orchestrate.sh oil
```

If every agent exits successfully the script prints:

```
🚀 All agents passed – pipeline live
```

### Visual Regression

To generate fresh screenshots of your UI and compare them with the baseline:

```bash
npm run capture
npm run test:visual
```

If you change the UI intentionally, update the baselines by copying files from `test‑artefacts` into `test‑golden` and committing them.

### Deployment

The deployment agent is a stub that simply echoes `DEPLOY_URL`.  To deploy a real dashboard you can follow the [Zero‑Budget outreach pipeline guide]【628026163413504†screenshot】, which shows how to build a minimal Express server and publish it to Render with a single API call.  For containerised projects, see the Dockerfile & Railway deployment guide【96249953111154†screenshot】.

## What's New in v5.0

This release (v5.0) integrates production‑grade enhancements drawn from the Kimi collaboration.  Highlights:

* **Persistent job queue:** When `USE_BULLMQ=true` the keyword agent enqueues URLs onto a BullMQ queue namespaced by `TENANT_ID` (e.g. `t:default:queue:scan`).  The new `agent-scan-worker.service.js` listens on this queue and processes scans concurrently.  Legacy Redis list mode is still supported.
* **Tenant‑aware namespaces:** All Redis keys and queue names are automatically prefixed with `t:<TENANT_ID>` via `lib/tenant.js` to isolate customer data.  Set `TENANT_ID` in your environment; defaults to `default`.
* **Database persistence (stub):** Scan reports and badges can be persisted to Postgres via `lib/db.js` when `DATABASE_URL` is defined.  If no database is configured the persistence functions no‑op and log a warning.
* **Re‑audit & remediation loop:** The new `agent-replay.service.js` implements a closed loop: re‑scan pages, compare against `VIOLATION_THRESHOLD`, mint a WCAG badge via `lib/badge.js` and enqueue follow‑up jobs.  `agent-badge.service.js` consumes badge jobs and logs badge URLs for integration with e‑mail or CRM systems.
* **Multi‑tenant SaaS plumbing:** A minimal SaaS model is included—tenant IDs are loaded from environment, and queues/keys are namespaced.  The foundation is laid for billing tiers and per‑tenant rate limiting.
* **UI quality checklist:** See the “UI STILL‑WORKS” checklist near the end of this document for guidance on visual, accessibility and performance regression tests to run in CI.

### New environment variables

| Variable | Description |
| --- | --- |
| `USE_BULLMQ` | Set to `true` to enable BullMQ job queues.  Falls back to simple Redis lists when unset. |
| `TENANT_ID` | Namespace for queues and keys (default `default`). |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Connection info for BullMQ queues when using a standard Redis server. |
| `DATABASE_URL` | PostgreSQL connection string used by `lib/db.js` to persist scan reports and badges. |
| `VIOLATION_THRESHOLD` | Maximum number of violations allowed when minting a badge during re‑audit (default `5`). |

## Extending to a Full v5.0 App

This repository demonstrates the skeleton of a WCAG compliance machine, but a production‑grade v5.0 application would need additional features.  Below are key enhancements and how to implement them:

| Area | Missing Feature | How to Add |
| --- | --- | --- |
| **Persistent queue** | **Implemented in v5.0.**  URLs are pushed onto a BullMQ queue (when `USE_BULLMQ=true`) and processed by `agent-scan-worker.service.js`.  Redis list mode remains for quick demos. | N/A – already integrated. |
| **Scan scheduler** | The pipeline scans only a single keyword on demand.  A v5.0 app should schedule recurring scans across multiple keywords and domains. | Add a scheduler (cron job or [node-cron](https://www.npmjs.com/package/node-cron)) that periodically invokes the orchestrator with different keywords.  Persist scan metadata (scan ID, timestamp, keyword) in a database so you can track history. |
| **Storage & analytics** | **Partially implemented.**  v5.0 includes a Postgres persistence stub (`lib/db.js`) which stores scan reports and badges when `DATABASE_URL` is configured.  A full analytics dashboard remains to be built. | Use `lib/db.js` to connect to Postgres or ClickHouse.  Build a front‑end that queries aggregated metrics (e.g. violations per guideline) and displays trends over time. |
| **Authentication & multi‑user support** | **Multi‑tenant groundwork added.**  Keys and queue names are namespaced by `TENANT_ID` to isolate customers.  Authentication and per‑user dashboards still need to be integrated. | Integrate an auth provider (e.g. Auth0, Clerk) and associate scans/contacts with user accounts in the database. |
| **Real CEO enrichment** | `mineCeo` returns a dummy contact.  Use a real enrichment API. | Integrate [Hunter.io](https://hunter.io/) or [Clearbit](https://clearbit.com/) to fetch company decision‑makers.  Handle rate limits and fallbacks. |
| **Automated outreach** | The draft agent is a stub.  For high‑quality e‑mails, call a language model (e.g. OpenAI’s GPT‑4) with the scan summary and tone instructions. | Add a `lib/llm.js` module that calls the OpenAI API.  Template the message to highlight specific WCAG violations and recommended fixes. |
| **Live viewer** | The example viewer in the zero‑budget pipeline uses a simple WebSocket to stream scan progress【628026163413504†screenshot】. | Expand it into a real‑time dashboard: use WebSockets or server‑sent events to display the queue status, current URL being scanned and violations found so far. |
| **CI/CD pipeline** | Only visual regression tests run in CI.  Add unit tests, linting and deployment automation. | Extend `.github/workflows` with steps for `npm run test` (Jest or Vitest), ESLint, Prettier and automatic deployment via the deploy agent. |
| **Internationalisation & accessibility** | The dashboard itself must meet WCAG 2.2.  | Use semantic HTML, ARIA attributes and the guidance from the W3C evaluation tools【138200628228501†screenshot】.  Add i18n support via libraries like `react‑i18next`. |
| **Trauma‑informed design** | If your outreach touches sensitive content, incorporate trauma‑informed principles such as consent, transparency and psychological safety. | Include clear opt‑out mechanisms in e‑mails, avoid shaming language and provide educational resources about accessibility. |

## Evaluation Meta Prompts

Use the following 20 prompts to test and interrogate your WCAG Machine.  They exercise the pipeline’s core functions, error handling and extensibility.  You can run them as manual checks or feed them into an agentic testing harness:

1. **Basic SERP ingestion:** “Fetch the top 10 results for the keyword `wheelchair ramp design` and return their URLs.”
2. **Scan a simple site:** “Scan `https://example.com` for WCAG violations and list the first five violations with their impact level.”
3. **Invalid URL handling:** “Attempt to scan `htp://invalid-url` and describe how the agent reports the error.”
4. **Keyword with no results:** “Search for `asdfqwerzxcv1234` and explain what happens when no SERP results are found.”
5. **Large result set:** “Queue and scan the top 100 results for `accessibility consulting` and summarise the average number of violations.”
6. **CEO enrichment:** “Given the domain `mozilla.org`, mine the CEO’s contact and show the output JSON.”
7. **HubSpot integration:** “Simulate creating a new contact for `example.org` and verify that the contact ID is returned.”
8. **Draft generation:** “Generate a personalised outreach e‑mail for `wcagtracker.com` with a friendly yet professional tone.”
9. **Pipeline orchestration:** “Run the full pipeline on the keyword `electric cars` and report when all agents have completed.”
10. **Deployment check:** “Deploy the dashboard and return the URL where the results can be viewed.”
11. **Visual regression happy path:** “Capture the dashboard and compare it against the golden baseline; confirm that the visual drift is under 2 %.”
12. **Visual regression failure:** “Intentionally change the dashboard’s primary colour and run the visual test; observe how the failure is reported.”
13. **Scaling test:** “Launch three concurrent scans for the keywords `air quality`, `accessible travel` and `braille literacy`; ensure that the queue and agents handle parallel workloads.”
14. **Scheduler integration:** “Schedule weekly scans for `openai.com` and `github.com` and show where the next run time is stored.”
15. **Database persistence:** “Save the violations for `example.com` into a Postgres database and query the total count of critical issues.”
16. **API error recovery:** “Simulate SerpApi returning a 429 rate limit error and demonstrate how the keyword agent retries or backs off.”
17. **Security scanning:** “Ensure that the scan agent properly isolates untrusted pages and cannot access the host file system.”
18. **International site:** “Scan a non‑English site such as `https://beeline.ru` and verify that the report still identifies WCAG violations.”
19. **CI integration:** “Describe the CI workflow that runs capture and visual tests on every push and uploads artefacts for review.”
20. **Trauma‑informed outreach:** “Rewrite the outreach e‑mail for `mentalhealth.org` with sensitivity to trauma‑informed language and consent.”

## UI “STILL‑WORKS” Checklist

To prevent regressions as the repository scales, adopt the following guardrails in your CI and production monitoring.  Each bullet should have an owner, an automated test and an alert:

1. **Visual regression guardrails**
   * Run `npm run capture` to produce golden PNGs for `/dashboard`, `/report` and `/onboarding`.
   * Configure a GitHub workflow to run `pixelmatch` on every PR and fail if the diff exceeds 0.2 %.
   * Store baselines in the `test-golden` branch and lock PR merges until baselines are updated via an `update-golden` comment.

2. **Accessibility regression guardrails**
   * In the same CI job, run `axe-core/playwright` against the built dashboard (e.g. `localhost:4173`).
   * Allow zero new WCAG 2.2 AA violations; fail the PR when any are detected.
   * Publish the annotated HTML report as a CI artefact for review.

3. **Cross-browser matrix**
   * Use Playwright to test Chromium, Firefox and WebKit on Node 20.
   * Add Safari–iOS and Chrome–Android emulators in a GitHub Actions large runner once per day (not per PR to save build minutes).

4. **Responsive snap‑points**
   * Cover breakpoints 320, 768, 1280 and 1920 pixels in visual tests.
   * Use full‑page screenshots (`locator.screenshot({ fullPage: true })`) so sticky headers don’t clip.

5. **Performance budget**
   * Enforce a Lighthouse CI gate: Largest Contentful Paint ≤ 2.5 s and Time to Interactive ≤ 3 s.
   * Ensure the dashboard remains fast even with 10 k rows of data.

## GitHub Migration

This repository is prepared within the container under `/home/oai/share/wcag_machine`.  To migrate it to GitHub:

1. **Create a new repository** named `wcag_machine` on your GitHub account.
2. **Initialise git** in the project directory, add all files and commit:

   ```bash
   cd wcag_machine
   git init
   git add .
   git commit -m "Initial commit – WCAG Machine v5.0"
   git remote add origin https://github.com/<your‑username>/wcag_machine.git
   git push -u origin main
   ```

Due to current connector restrictions the assistant cannot push directly to GitHub on your behalf.  Once the repository is created, you can enable GitHub Actions for continuous testing and deployment.

## License

This project is provided as‑is for educational purposes.  You are responsible for ensuring compliance with the licenses of third‑party services used (SerpApi, Upstash, HubSpot, etc.).