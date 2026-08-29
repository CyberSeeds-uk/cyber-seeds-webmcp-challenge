# Challenge threat model

This is a client-only, synthetic browser demonstration. It illustrates an authority workflow; it is not a production security boundary and cannot establish the physical identity of a human using a local browser.

| Threat | Boundary and response |
|---|---|
| AI agent using exposed capability | Read-only tools may inspect. The sensitive tool always requires a matching human-approved request. Capability is not authority. |
| Malformed or adversarial arguments | Minimal schemas use `additionalProperties: false`; the implementation rejects bad types, unknown properties, unknown issues, and invalid request IDs without household mutation. |
| Replay, request confusion, cross-action reuse | Request and issue are both checked at execution. Wrong IDs and wrong actions fail closed and never replace the active request. Approval is single-use. |
| Request churn / rapid calls | One pending request remains active. Same-action retries need the active ID; other actions return `another_request_pending`. |
| Stale, expired, revoked, or malformed authority | Expiration, consumption, revocation, request binding, and action binding are checked at execution. Unknown authority state is not treated as approval. |
| Duplicate execution | Successful execution resolves the synthetic issue and clears authority; a replay returns `already_resolved`. |
| Synthetic/programmatic UI interaction | Approval rejects untrusted DOM events. This is demonstrative only; a malicious local browser user can alter client code or state. |
| Refresh, multiple tabs, local DevTools | State is in memory per page. Refresh resets it; tabs are independent. DevTools/local-user manipulation is outside client-only guarantees. Server-side enforcement would be required for production authority. |
| Annotation error / accidental write | The two inspection tools are registered with `readOnlyHint: true`; only `perform_sensitive_change` is state-changing and annotated false. |
| Privacy and IP leakage | Data is synthetic, no tracking or third-party runtime dependency is used, and the repository is kept separate from private Cyber Seeds material. |

The intentional guarantee is narrow: within an unmodified page, an agent cannot manufacture the visible human approval needed for the synthetic change. It does not prove authentication, authorization against a real account, cross-tab consistency, or server-side tamper resistance.
