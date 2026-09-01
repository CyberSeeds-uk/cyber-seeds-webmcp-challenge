# Historical live ChatGPT Site Tools acceptance


> **Current status — 2026-09-01:** The pending hardened-implementation acceptance referenced later in this historical record has now been completed. See [Live Agent Authority-Path Acceptance](LIVE_AGENT_AUTHORITY_PATH_ACCEPTANCE.md) and [Live Human Authority Lifecycle Acceptance](LIVE_HUMAN_AUTHORITY_LIFECYCLE_ACCEPTANCE.md). The historical observations below are intentionally preserved unchanged.
This record describes the pre-hardening public acceptance. It is preserved as historical evidence and does not claim acceptance of the later human-authority hardening commit. New closure evidence must be appended with its deployed commit SHA and timestamp.

Recorded: 2026-08-29

Public deployment: https://cyber-seeds-webmcp-challenge.pages.dev/

## LIVE VERIFIED BEHAVIOUR

The public Cloudflare deployment was successfully tested in ChatGPT’s built-in browser using genuine WebMCP Site Tools. ChatGPT discovered exactly these three tools:

- `inspect_demo_household`
- `get_approval_state`
- `perform_sensitive_change`

The discovery result correctly distinguished two read-only tools from one state-changing tool:

- `inspect_demo_household` — read-only synthetic household inspection
- `get_approval_state` — read-only authority-state inspection
- `perform_sensitive_change` — state-changing sensitive action

The completed live workflow was:

1. `inspect_demo_household` returned the synthetic issues: `account-mfa` HIGH/open/sensitive, `router-update` MEDIUM/open/sensitive, and `scam-review` LOW/open/read-only. Inspection caused no state-changing action.
2. `get_approval_state` returned `phase = IDLE`, `pending = null`, `approved = false`, and `expiresAt = null`.
3. `perform_sensitive_change` for `account-mfa` failed closed with `status = refused` and `reason = human_approval_missing`. It created the pending request `95b235b9-a427-4efb-a290-161fe75b9d23` with `phase = REQUEST_PENDING` and `approved = false`.
4. ChatGPT correctly reported that approval had to occur in the visible Cyber Seeds page and could not be granted through the WebMCP tool.
5. A human physically approved the exact pending action in the visible Cyber Seeds interface.
6. ChatGPT checked the approval state, confirmed valid human authority for the exact pending request, and retried the exact `account-mfa` request. The synthetic MFA action completed successfully.
7. Authority became `RESOLVED`: `pending = null` and `approved = false`.
8. Repeating the same MFA change returned `status = no_change` and `reason = already_resolved`. The prior human authority was not reusable.
9. The final authority check returned `phase = RESOLVED`, `pending = null`, `approved = false`, and `expiresAt = null`.

The acceptance demonstrates the intended sequence: read-only discovery and inspection, fail-closed sensitive execution, human-only approval, exact approved retry, and single-use authority consumption.

## PRODUCTION SECURITY CLAIMS

This challenge capsule is intentionally synthetic and client-only. The live workflow does not establish physical human identity, production-grade authorisation, or the security properties of a real household system. Browser memory can be reset or modified by a local user, and tabs are independent. A production implementation would require a server-side authority service and a genuine human identity boundary.

The repository contains no real household data, secrets, credentials, private Cyber Seeds dependency, or production platform code. The public-source IP firewall remains intact. This evidence is limited to the isolated challenge repository and its synthetic demonstration.

## Hardened deployment closure check — 2026-08-30

This is new deployment evidence for the human-authority hardening commit, distinct from the historical ChatGPT session above.

- Hardened commit: `a76135d2a880b1a70291478d067c62c4e580e19d`
- Remote `main`: matched the hardened commit before deployment verification.
- Deployment: existing Cloudflare Pages Git deployment at https://cyber-seeds-webmcp-challenge.pages.dev/
- Verified at: `2026-08-30T03:42:15Z` (UTC)
- Public hardening markers: visible `Deny request` control; canonical request identity and exact-request/single-use wording in `app.js` and `webmcp.js`.
- Public asset verification: `app.js`, `webmcp.js`, and canonical-redirected `index.html` matched the local hardened files byte-for-byte.
- Public build: VERIFIED for static deployment content.

The available environment does not expose a genuine ChatGPT/WebMCP interaction surface or `navigator.modelContextTesting`. Therefore this closure run did not claim a new live ChatGPT lifecycle, tool discovery through ChatGPT, human denial/approval, or replay evidence. The historical lifecycle above must not be attributed to the hardened commit. The remaining acceptance step is a fresh ChatGPT WebMCP session against this deployed SHA.

Headless Chromium rendered the deployed page at desktop (`1440×1200`) and mobile (`390×844`) viewports. The page exposed semantic Approve, Deny, Revoke, and Reset buttons, visible authority status/request context, and an aria-live authority ledger. Keyboard reachability and focus semantics are present in the native button markup; genuine keyboard interaction in a WebMCP-enabled ChatGPT browser remains unverified here. No production-security claim is made.
