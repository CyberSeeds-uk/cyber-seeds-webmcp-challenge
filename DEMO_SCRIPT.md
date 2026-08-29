# Demo script — target 2:30

## 0:00–0:15 — The problem

Show the opening page. Say: “Cyber Seeds demonstrates how an AI agent can help with digital safety without silently becoming the decision-maker. The data on screen is synthetic.”

## 0:15–0:35 — Discoverable capability

Show the WebMCP tool list: `inspect_demo_household`, `get_approval_state`, and `perform_sensitive_change`. Say: “The first two inspect state. The third can change state, so it is explicitly guarded.”

## 0:35–0:55 — Inspect

Run `inspect_demo_household`, then `get_approval_state`. Point out the synthetic issues, `pending: null`, and `approved: false`.

## 0:55–1:10 — Request refused

Call `perform_sensitive_change` for `account-mfa` without a request ID. Say: “The agent has capability, but no authority.” Show `human_approval_missing`, the bounded request ID, and the visible pending request.

## 1:10–1:25 — Confusion resisted

Retry without approval, then try `router-update`. Show refusal and `another_request_pending`. Point out that the original human-reviewable request did not rotate.

## 1:25–1:40 — Human decision

Physically press **Approve this action**. Show `HUMAN_APPROVED` and the exact issue/request binding.

## 1:40–2:00 — Exact retry succeeds

Retry `account-mfa` with the exact request ID. Show `allowed`, the issue changing to `resolved`, and `ACTION_ALLOWED`.

## 2:00–2:15 — Replay fails

Replay the same request. Show `already_resolved` and explain that the approval was consumed; there is no second consequential execution.

## 2:15–2:35 — Evidence and close

Show the audit trail, including refusal, pending request, approval, consumption, and allowed action. Say: “Agents can request authority. They cannot manufacture it.” Finish by showing the synthetic-only boundary and the conformance command `npm test`.
