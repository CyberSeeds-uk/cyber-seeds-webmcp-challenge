# Release acceptance record

## Candidate

- Commit: `19a2960851ac6902ee546961979967b01e108d25`
- Recorded: 2026-08-29
- Clean clone: `/tmp/cyber-seeds-webmcp-judge-acceptance`
- Publication: not published, pushed, or deployed

## Automated and source checks

- Clean clone contains only expected public challenge files: PASS.
- `npm test`: 27 passed, 0 failed: PASS.
- `npm run check`: JavaScript syntax passed: PASS.
- HTTP server from clone: page, `app.js`, and `webmcp.js` returned HTTP 200: PASS.
- No remotes, symlinks into private repositories, secrets, real household data, or external runtime scripts: PASS.

## WebMCP evidence

The source and Node conformance harness verify exactly three registrations, both compatibility surfaces, annotations, schemas, and duplicate-registration protection. The installed browser reports Chrome `149.0.7827.114`, but this headless/container invocation exposed neither `navigator.modelContext` nor `navigator.modelContextTesting`. Therefore live `listTools()` / `getTools()` evidence and a physical WebMCP judge walkthrough remain unverified in this environment.

## Visual evidence

The page loaded and rendered at 320 CSS px in headless Chrome with the expected WebMCP fallback. Attempts to obtain genuine 390px, 768px, desktop, and 200% browser-zoom evidence failed because the available headless Chromium/Firefox processes crashed before producing output. CSS and native keyboard semantics were reviewed, but those widths are not claimed as browser-tested.

## Security and boundary checks

- Privacy/no tracking: PASS.
- Synthetic-only data: PASS.
- IP boundary: PASS.
- Client-only limitations documented: PASS.

## Outstanding release blockers

1. Run the clean-clone walkthrough in a stable WebMCP-enabled Chrome 149+ session and capture `navigator.modelContextTesting.listTools()` plus producer annotations.
2. Run genuine browser visual acceptance at 390px, 768px, desktop, and 200% zoom, including keyboard-only navigation and overflow checks.
