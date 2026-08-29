# Judge walkthrough

This is the canonical two-minute judge flow. Use the public deployment, a fresh page, and the synthetic baseline.

Public deployment: https://cyber-seeds-webmcp-challenge.pages.dev/

1. In a WebMCP-enabled Chrome 149+ runtime, discover the three tools: `inspect_demo_household`, `get_approval_state`, and `perform_sensitive_change`.
2. Run `inspect_demo_household`. Confirm the returned household is synthetic and the three issue cards are unchanged.
3. Run `get_approval_state`. Confirm `pending: null` and `approved: false`.
4. Run `perform_sensitive_change` with `{ "issueId": "account-mfa" }`. Confirm `status: "refused"`, `reason: "human_approval_missing"`, and a bounded `requestId`. The page shows the pending request.
5. Confirm the refusal creates a pending request. In the live acceptance, its exact ID was `95b235b9-a427-4efb-a290-161fe75b9d23`.
6. Physically activate **Approve this action** in the visible page. Approval must occur in the page, not through a Site Tool.
7. Check approval state, then retry `account-mfa` with the exact returned `requestId`. Confirm successful execution and `RESOLVED` state.
8. Replay the same MFA change. Confirm `status: "no_change"` and `reason: "already_resolved"`; no authority is reusable.
9. Run `get_approval_state` again. Confirm `phase: "RESOLVED"`, `pending: null`, `approved: false`, and `expiresAt: null`.

The live ChatGPT acceptance record captures the completed workflow and the returned synthetic issue data.

The key message is: “Agents can request authority. They cannot manufacture it.”

The repository also contains a dependency-free Node harness covering this flow and adversarial variants: `npm test`.
