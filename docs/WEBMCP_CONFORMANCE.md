# WebMCP conformance

The capsule exposes exactly three tools:

| Tool | Inputs | `readOnlyHint` | Effect |
|---|---|---:|---|
| `inspect_demo_household` | `{}` | `true` | Reads synthetic issue state. |
| `get_approval_state` | `{}` | `true` | Reads pending/approval state. |
| `perform_sensitive_change` | `issueId`, optional `requestId` | `false` | Attempts a bounded synthetic state change; exact human authority is required and single-use. |

All schemas are objects with `additionalProperties: false`. The sensitive issue enum is limited to `account-mfa` and `router-update`. No tool grants approval, bypasses the gate, or force-executes an action. The human approval path exists only as a visible DOM control and rejects untrusted events.

Registration prefers `document.modelContext` and falls back to `navigator.modelContext`, preserving the Chrome 149 compatibility path. Registration is guarded against duplicate script execution and reports registration failures in the visible status element. The expected success status is “WebMCP active · 3 tools registered”.

The repository does not claim that client-side annotations or UI checks are sufficient for production security. A production implementation would need server-side enforcement and a genuine human identity boundary.
