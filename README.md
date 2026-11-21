# Investment Intelligence

Upload an investment document (10-K, 10-Q, earnings release, S-1, pitch deck, PPM, real estate OM, fund report, credit agreement, CIM) and get:

- Financials by period, every value tied to its page and quote, auto-checked against the page text
- Ratios computed in the browser (growth, margins, earnings quality, leverage, liquidity, returns, valuation, real estate, fund, startup)
- Red flags from fixed rules plus the AI's read of the document
- Deal terms, guidance, segments, gaps and diligence questions
- A research note with clickable page citations
- Exports: Excel (live formulas + source comments), Markdown, Print/PDF
- **Research scorecard** (features.js): growth, profitability, cash and earnings quality, balance sheet, and risk, each 0 to 100 with the factors shown. Property deals skip company-only factors. Data confidence = share of quotes found verbatim.
- **Scenario lab**: operating companies get revenue, margin, opex and rate sliders, presets (recession, rates +200bp, lose top customer), and break-even points. Real estate deals rebuild the equity IRR from price, NOI, loan and equity, with exit cap, growth, rate and hold sliders against the sponsor's projection.
- **Ask**: chat answered only from the document, with page citations, saved with the analysis
- **Compare**: any two saved analyses side by side
- Two built-in fictional samples: a company annual report and a real estate PPM

## How it works

Static PWA, no build step. `app.js` = reading, extraction, verification, ratios, rendering, exports. `features.js` = scorecard, scenarios, ask, compare (wraps `renderResults` and `markdownDoc`). Period labels are normalized ("T-12 Actual" -> "T-12"), and values reported once as "Current" (price, loan, exit cap) stand in for every period when computing ratios. Files are read in the browser (pdf.js, SheetJS, mammoth). Long documents are trimmed to the most data-dense pages (about 120k characters). Four AI extraction passes run in parallel. If a core item (revenue, net income, capex, cash, NOI...) is named on a page with numbers but was missed, a targeted second-look pass recovers it. Results open right away and the research note fills in afterward (about 30 seconds to results, 30 to 50 to the note). All calls go through the shared APX Cloudflare Worker (`studyforge-api`, free Gemini). Each call retries once, because the Worker gives each model 20 seconds and Gemini sometimes returns 503.

Word files keep table rows on one line (mammoth HTML), Excel sheets become one ` | `-joined line per row. Scanned PDFs (no text layer) and images are sent as files to Gemini's vision. That is capped at about 5.5 MB because the Worker rejects bodies over 8 MB.

## Local testing

The Worker only accepts `https://apxaiconsulting.github.io`, so run the scratchpad `devproxy.py` (static server + `/proxy` that forwards to the Worker with that origin), then in the page console:

```js
const of = fetch.bind(window); window.fetch = (u, o) => u === ENDPOINT ? of('/proxy', o) : of(u, o);
```

## Deploy

Repo `apxaiconsulting/investment-intelligence`, GitHub Pages from `main`. On every deploy, bump `VERSION` in `sw.js` and the `?v=` on the script and style tags in `index.html`.
