# Judge walkthrough

This is the canonical two-minute judge flow. Use a fresh page and synthetic baseline.

1. In a WebMCP-enabled Chrome 149+ runtime, discover the three tools: `inspect_demo_household`, `get_approval_state`, and `perform_sensitive_change`.
2. Run `inspect_demo_household`. Confirm the returned household is synthetic and the three issue cards are unchanged.
3. Run `get_approval_state`. Confirm `pending: null` and `approved: false`.
4. Run `perform_sensitive_change` with `{ "issueId": "account-mfa" }`. Confirm `status: "refused"`, `reason: "human_approval_missing"`, and a bounded `requestId`. The page shows the pending request.
5. Retry without approval. Confirm refusal with `request_id_required`; the request ID remains unchanged.
6. Try `router-update` while the first request is pending. Confirm `another_request_pending`; the original request remains visible.
7. Physically activate **Approve this action** in the page. Confirm `HUMAN_APPROVED` in the audit trail.
8. Retry `account-mfa` with the exact returned `requestId`. Confirm `status: "allowed"`, the issue becomes `resolved`, and `ACTION_ALLOWED` is visible.
9. Replay the same request. Confirm no second execution; the result is `already_resolved`.
10. Run both read-only tools again. Confirm the resolved synthetic issue and no reusable approval.

The key message is: “Agents can request authority. They cannot manufacture it.”

The repository also contains a dependency-free Node harness covering this flow and adversarial variants: `npm test`.
