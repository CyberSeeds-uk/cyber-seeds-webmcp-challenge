# Cyber Seeds WebMCP

A human-authority safety pattern for agent-operated digital environments.

The demo explores a simple question: what should happen when an AI agent is technically capable of performing an action but does not have the human authority to perform it?

Cyber Seeds is a deliberately isolated, synthetic browser capsule. WebMCP gives the agent a structured interface to the live page; the visible page remains the authority boundary for consequential change.

## What WebMCP exposes

The three exposed WebMCP tools are:

- `inspect_demo_household` — read-only synthetic household inspection;
- `get_approval_state` — read-only pending/approval inspection;
- `perform_sensitive_change` — state-changing attempt that fails closed until the visible human gate approves the exact request.

There is deliberately no approval WebMCP tool. The two inspection tools are read-only; the sensitive tool can request authority but cannot create it.

## Authority lifecycle

1. The agent inspects synthetic household state.
2. A sensitive request fails closed and creates one pending request.
3. The human reviews the exact target and action in the page and approves or denies it.
4. Approval is bound to a deterministic canonical request identity, not to the agent, session, or tool.
5. The agent retries the exact request; modified targets or parameters are rejected.
6. Successful execution consumes authority. Replays return a no-change result.

See [docs/authority-protocol.md](docs/authority-protocol.md) for the invariants and state model.

Requests are action-bound, request-bound, expiring, single-use, and resistant to request churn. Wrong, repeated, stale, revoked, malformed, or mismatched attempts do not execute. The visible audit trail records the important synthetic transitions.

## Run locally

From the repository root, serve the static files on localhost, then open the page in Chrome 149 or newer:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. In a WebMCP-enabled Chrome runtime, discover the three tools, inspect the synthetic data, call `perform_sensitive_change` without a request ID, review and approve or deny the displayed request in the page, then retry only with the exact returned `requestId`. Without WebMCP, the page remains a readable demonstration of the authority gate.

Run the dependency-free conformance and adversarial authority battery with:

```sh
npm test
```

Use `npm run check` for JavaScript syntax validation.

## Architecture and limits

The project is static HTML/CSS/JavaScript with synthetic in-memory state. `webmcp.js` registers the stable tool surface; `app.js` owns canonical requests, authority validation, state transitions, UI rendering, and the live event ledger; `demo-data.js` contains the synthetic baseline; `tests/conformance.test.js` exercises the authority protocol.

The implementation uses stable tool registration rather than dynamic tool exposure because the supported WebMCP surface does not require brittle registration churn. Authority state is returned through deterministic structured JSON results.

## Compatibility and boundaries

Registration prefers `document.modelContext` and falls back to `navigator.modelContext`, preserving the verified Chrome 149 path. The project contains synthetic data only and has no analytics, external scripts, external fonts, cookies, API keys, or private Cyber Seeds dependencies. See [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md), [docs/WEBMCP_CONFORMANCE.md](docs/WEBMCP_CONFORMANCE.md), and [IP_BOUNDARY.md](IP_BOUNDARY.md).

This is not production security. Authority is held in browser memory, refresh resets the demo, tabs are independent, and a local user with DevTools can alter the page. Production enforcement would require a server-side authority service and a genuine human identity boundary. The demo does not claim to prove either.

Status: competition-grade challenge capsule. The earlier public deployment passed genuine live ChatGPT WebMCP acceptance; the hardened implementation is publicly deployed, with its fresh ChatGPT acceptance status recorded separately.

Live acceptance evidence: [docs/CHATGPT_SITE_TOOLS_ACCEPTANCE.md](docs/CHATGPT_SITE_TOOLS_ACCEPTANCE.md).
