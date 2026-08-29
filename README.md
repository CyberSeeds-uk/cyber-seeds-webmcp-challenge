# Cyber Seeds WebMCP Challenge

Cyber Seeds is a deliberately isolated, synthetic browser capsule demonstrating human-authorised agentic action. An agent can discover and inspect structured capability, and can request a sensitive change, but it cannot manufacture the human approval required to execute it.

## What the demo proves

The three exposed WebMCP tools are:

- `inspect_demo_household` — read-only synthetic household inspection;
- `get_approval_state` — read-only pending/approval inspection;
- `perform_sensitive_change` — state-changing attempt that fails closed until the visible human gate approves the exact issue and request.

Requests are action-bound, request-bound, expiring, single-use, and resistant to request churn. Wrong, repeated, stale, revoked, malformed, or mismatched attempts do not execute. The visible audit trail records the important synthetic transitions.

## Run locally

From the repository root, serve the static files on localhost, then open the page in Chrome 149 or newer:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. In a WebMCP-enabled Chrome runtime, discover the three tools, inspect the synthetic data, call `perform_sensitive_change` without a request ID, approve the displayed request in the page, then retry with the exact returned `requestId`. Without WebMCP, the page remains a readable demonstration of the authority gate.

Run the dependency-free conformance battery with:

```sh
npm test
```

Use `npm run check` for JavaScript syntax validation.

## Compatibility and boundaries

Registration prefers `document.modelContext` and falls back to `navigator.modelContext`, preserving the verified Chrome 149 path. The project contains synthetic data only and has no analytics, external scripts, external fonts, cookies, API keys, or private Cyber Seeds dependencies. See [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md), [docs/WEBMCP_CONFORMANCE.md](docs/WEBMCP_CONFORMANCE.md), and [IP_BOUNDARY.md](IP_BOUNDARY.md).

This is not production security. Authority is held in browser memory, refresh resets the demo, tabs are independent, and a local user with DevTools can alter the page. Production enforcement would require a server-side authority service and a genuine human identity boundary. The demo does not claim to prove either.

Status: submission-grade challenge capsule. The public deployment has passed genuine live ChatGPT WebMCP acceptance; application behaviour is frozen for submission.

Live acceptance evidence: [docs/CHATGPT_SITE_TOOLS_ACCEPTANCE.md](docs/CHATGPT_SITE_TOOLS_ACCEPTANCE.md).
