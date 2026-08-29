# Cyber Seeds — human-authorised agentic safety

Cyber Seeds is a focused WebMCP demonstration of a consequential action that remains subordinate to explicit human authority. A synthetic household can be inspected by an agent, but a sensitive change cannot be completed simply because the agent has a tool, an issue ID, or a request ID.

WebMCP creates a better experience by making the agent’s permitted capability structured and discoverable while keeping the human decision visible. The agent can inspect the state, request a change, receive a machine-readable refusal, and retry the exact approved request. The human sees the action, scope, expiry, and request identifier before approving it.

Before this interaction model, an assistant would need an ambiguous handoff or a bespoke UI integration to coordinate inspection, approval, and execution. Here, the read-only tools and state-changing tool are explicit, annotated, and easy for an agent to discover. Authority is still bounded by the visible human control.

Implementation is intentionally compact: static HTML/CSS/JavaScript, synthetic in-memory state, three WebMCP registrations, strict object schemas, request/action binding, expiry, revocation, single-use consumption, duplicate-registration protection, and a visible evidence stream. There is no approval WebMCP tool. The project includes a dependency-free 27-case adversarial conformance battery and documents the client-only limitations honestly.

The central principle is: agents can request authority; they cannot manufacture it.
