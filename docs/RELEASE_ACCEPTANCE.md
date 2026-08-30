# Release acceptance record

## Candidate

- Application source baseline: `8c041c7`
- Recorded: 2026-08-29
- Public deployment: https://cyber-seeds-webmcp-challenge.pages.dev/
- Live ChatGPT acceptance: PASS; see [CHATGPT_SITE_TOOLS_ACCEPTANCE.md](CHATGPT_SITE_TOOLS_ACCEPTANCE.md)

## Automated and source checks

- Clean clone contains only expected public challenge files: PASS.
- `npm test`: 32 passed, 0 failed: PASS.
- `node --check app.js`, `node --check webmcp.js`, and `node --check demo-data.js`: PASS.
- No remotes, symlinks into private repositories, secrets, real household data, or external runtime scripts: PASS.

## WebMCP evidence

The source and Node conformance harness verify exactly three registrations, both compatibility surfaces, annotations, schemas, and duplicate-registration protection. A genuine ChatGPT built-in browser session discovered exactly the three public Site Tools, completed the fail-closed request, visible human approval, exact retry, and single-use replay checks documented in [CHATGPT_SITE_TOOLS_ACCEPTANCE.md](CHATGPT_SITE_TOOLS_ACCEPTANCE.md).

## Visual evidence

The page loaded and rendered at 320 CSS px in headless Chrome with the expected WebMCP fallback. Attempts to obtain genuine 390px, 768px, desktop, and 200% browser-zoom evidence failed because the available headless Chromium/Firefox processes crashed before producing output. CSS and native keyboard semantics were reviewed, but those widths are not claimed as browser-tested.

## Security and boundary checks

- Privacy/no tracking: PASS.
- Synthetic-only data: PASS.
- IP boundary: PASS.
- Client-only limitations documented: PASS.

## Security and release boundary

- The public-source IP firewall remains intact: only the isolated challenge repository is in scope.
- The capsule contains synthetic household data only and has no secrets, credentials, private Cyber Seeds dependency, or new external dependency.
- The authority lifecycle and invariants are documented in [authority-protocol.md](authority-protocol.md).
- Live acceptance verifies this challenge capsule’s browser interaction. It does not establish physical human identity or production-grade authorisation.
- Application behaviour is frozen for submission; remaining work is limited to Devpost/submission packaging.
