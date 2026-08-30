# Human authority protocol

Cyber Seeds separates technical capability from human authority. A WebMCP caller may inspect the synthetic household and propose a sensitive change, but a request is never permission to execute it.

## Lifecycle

```text
IDLE
  ↓
REQUEST_PENDING
  ├── HUMAN_DENIED → DENIED
  ├── HUMAN_REVOKED → REVOKED
  ├── expiry → EXPIRED
  └── HUMAN_APPROVED → HUMAN_APPROVED
                              ↓
                          EXECUTING
                              ↓
                           RESOLVED
                         (authority consumed)
```

Each pending request contains a deterministic canonical identity:

```json
{
  "action": "synthetic_sensitive_change",
  "target": "account-mfa"
}
```

The identity is the stable serialization of all authorization-relevant fields. In this demo the synthetic issue ID is the target. Approval stores the request ID, issue ID, and request identity together; the execution boundary checks all of them before mutating state.

## Invariants

- INV-01 Sensitive actions fail closed.
- INV-02 The agent cannot approve its own request.
- INV-03 Approval is bound to one canonical request.
- INV-04 Authorization-relevant parameter changes invalidate approval.
- INV-05 Approval is single-use.
- INV-06 Successful execution consumes approval.
- INV-07 Consumed approval cannot be replayed.
- INV-08 Human denial cannot authorize execution.
- INV-09 At most one active human-decision request exists, preventing stale-request confusion.
- INV-10 UI state is not the authorization boundary; the action validates authority itself.
- INV-11 Inspection remains read-only.
- INV-12 No real household data is required.

This is an intentionally client-only demonstration. Authority lives in browser memory, so this protocol is not a production identity or authorization service.
