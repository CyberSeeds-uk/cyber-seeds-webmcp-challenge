# Release acceptance record

## Current live acceptance status — 2026-09-01

**Status: LIVE ACCEPTANCE COMPLETE**

The earlier sections of this document preserve historical release-state evidence and may refer to fresh ChatGPT/WebMCP acceptance as pending. That requirement has since been completed.

Two complementary live WebMCP acceptance runs against the public deployment are now recorded:

1. [Live Agent Authority-Path Acceptance](LIVE_AGENT_AUTHORITY_PATH_ACCEPTANCE.md) — an agent-originated interaction with the visible approval control was rejected as `untrusted_ui_event`; no human authority was manufactured and the consequential action remained blocked.

2. [Live Human Authority Lifecycle Acceptance](LIVE_HUMAN_AUTHORITY_LIFECYCLE_ACCEPTANCE.md) — genuine human approval authorised the exact pending request once; authority was consumed after execution; replay did not execute again; cross-target authority reuse failed.

Together these tests provide current competition-grade evidence for both the negative and positive authority paths.

The project remains a synthetic client-side demonstration and does not claim production identity assurance, cryptographic proof of human presence, or server-side enforcement.

## Candidate

- Application source baseline: `a76135d` (human-authority hardening commit)
- Recorded: 2026-08-29
- Public deployment: https://cyber-seeds-webmcp-challenge.pages.dev/
- Historical live ChatGPT acceptance: PASS for the pre-hardening release only; see [CHATGPT_SITE_TOOLS_ACCEPTANCE.md](CHATGPT_SITE_TOOLS_ACCEPTANCE.md).
- Hardened public static deployment: VERIFIED; fresh ChatGPT acceptance remains pending because the required genuine WebMCP session is unavailable in this environment.

## Automated and source checks

- Clean clone contains only expected public challenge files: PASS.
- `npm test`: 32 passed, 0 failed: PASS.
- `node --check app.js`, `node --check webmcp.js`, and `node --check demo-data.js`: PASS.
- No remotes, symlinks into private repositories, secrets, real household data, or external runtime scripts: PASS.

## WebMCP evidence

The source and Node conformance harness verify exactly three registrations, both compatibility surfaces, annotations, schemas, and duplicate-registration protection. The deployed hardened static assets match the local commit. Historical genuine ChatGPT discovery and lifecycle evidence is preserved in [CHATGPT_SITE_TOOLS_ACCEPTANCE.md](CHATGPT_SITE_TOOLS_ACCEPTANCE.md) but is not relabeled as evidence for the hardened commit.

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
- The hardened implementation is deployed and documented; fresh ChatGPT/WebMCP lifecycle acceptance remains an explicit external/manual step.
