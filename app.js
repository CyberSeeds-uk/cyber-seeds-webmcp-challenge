(() => {
  "use strict";

  const APPROVAL_TTL_MS = 2 * 60 * 1000;
  const AUTHORITY_PHASES = new Set([
    "IDLE",
    "REQUEST_PENDING",
    "HUMAN_APPROVED",
    "EXECUTING",
    "RESOLVED",
    "REVOKED",
    "EXPIRED"
  ]);
  const source = window.CYBER_SEEDS_DEMO;

  const state = {
    issues: source.issues.map((issue) => ({ ...issue })),
    phase: "IDLE",
    pending: null,
    approval: null,
    events: []
  };

  const byId = (id) => document.getElementById(id);

  function nowIso() {
    return new Date().toISOString();
  }

  function makeId() {
    if (globalThis.crypto?.randomUUID) {
      return crypto.randomUUID();
    }

    if (globalThis.crypto?.getRandomValues) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      return `req-${Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("")}`;
    }

    return `req-${Date.now().toString(36)}-${
      Math.random().toString(36).slice(2, 12)
    }`;
  }

  function logEvent(type, detail = {}) {
    state.events.unshift({
      at: nowIso(),
      type,
      ...detail
    });

    state.events = state.events.slice(0, 12);
    renderAudit();
  }

  function findIssue(issueId) {
    return state.issues.find((issue) => issue.id === issueId) || null;
  }

  function isApprovalShapeValid(approval) {
    return Boolean(
      approval &&
      typeof approval.requestId === "string" &&
      typeof approval.issueId === "string" &&
      typeof approval.consumed === "boolean" &&
      Number.isFinite(approval.expiresAt)
    );
  }

  function publicIssue(issue) {
    return {
      id: issue.id,
      title: issue.title,
      area: issue.area,
      severity: issue.severity,
      status: issue.status,
      action: issue.action,
      sensitivity: issue.sensitivity
    };
  }

  function inspectHousehold() {
    return {
      household: { ...source.household },
      issues: state.issues.map(publicIssue),
      rule:
        "Sensitive changes require a matching, unexpired, single-use human approval."
    };
  }

  function getApprovalState() {
    const valid = Boolean(
      AUTHORITY_PHASES.has(state.phase) &&
      state.pending &&
      isApprovalShapeValid(state.approval) &&
      !state.approval.consumed &&
      state.approval.requestId === state.pending.requestId &&
      Date.now() < state.approval.expiresAt
    );

    return {
      phase: state.phase,
      pending: state.pending
        ? {
            requestId: state.pending.requestId,
            issueId: state.pending.issueId,
            requestedAt: state.pending.requestedAt
          }
        : null,

      approved: valid,

      expiresAt: valid
        ? new Date(state.approval.expiresAt).toISOString()
        : null
    };
  }

  function refuse(reason, pending) {
    logEvent("ACTION_REFUSED", {
      reason,
      issueId: pending?.issueId || null,
      requestId: pending?.requestId || null
    });

    render();

    return {
      status: "refused",
      reason,
      requestId: pending?.requestId || null,
      message:
        "Human approval is required in the visible Cyber Seeds page. Approval cannot be granted through a WebMCP tool."
    };
  }

  function performSensitiveChange(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return { status: "error", reason: "invalid_arguments" };
    }

    const allowedKeys = new Set(["issueId", "requestId"]);
    if (Object.keys(input).some((key) => !allowedKeys.has(key))) {
      return { status: "error", reason: "invalid_arguments" };
    }

    const { issueId, requestId = null } = input;
    if (
      typeof issueId !== "string" ||
      (requestId !== null && typeof requestId !== "string") ||
      (typeof requestId === "string" && requestId.length === 0)
    ) {
      return { status: "error", reason: "invalid_arguments" };
    }

    if (!AUTHORITY_PHASES.has(state.phase)) {
      return { status: "error", reason: "invalid_authority_state" };
    }

    const issue = findIssue(issueId);

    if (!issue) {
      return {
        status: "error",
        reason: "unknown_issue"
      };
    }

    if (issue.sensitivity !== "sensitive") {
      return {
        status: "error",
        reason: "not_a_sensitive_action"
      };
    }

    if (issue.status === "resolved") {
      return {
        status: "no_change",
        reason: "already_resolved",
        issueId
      };
    }

    /*
     * FAIL-CLOSED RULE:
     *
     * The first agent request can NEVER execute the action.
     * Instead it creates a unique pending request.
     */

    if (state.pending && state.pending.issueId !== issueId) {
      logEvent("REQUEST_CONFLICT", {
        reason: "another_request_pending",
        issueId,
        requestId: requestId || null
      });
      return refuse("another_request_pending", state.pending);
    }

    if (!state.pending) {
      state.pending = {
        requestId: makeId(),
        issueId,
        requestedAt: nowIso()
      };

      state.approval = null;
      state.phase = "REQUEST_PENDING";

      logEvent("REQUEST_PENDING", {
        issueId,
        requestId: state.pending.requestId
      });

      return refuse(
        "human_approval_missing",
        state.pending
      );
    }

    if (!requestId) {
      return refuse("request_id_required", state.pending);
    }

    if (state.pending.requestId !== requestId) {
      logEvent("REQUEST_MISMATCH", {
        issueId,
        requestId
      });
      return refuse("request_mismatch", state.pending);
    }

    /*
     * SECOND GATE:
     *
     * The approval must:
     * - exist
     * - match this exact request
     * - match this exact action
     * - remain unused
     * - remain unexpired
     */

    const approvalShapeValid = isApprovalShapeValid(state.approval);

    const approvalExpired = Boolean(
      approvalShapeValid && Date.now() >= state.approval.expiresAt
    );

    if (approvalExpired) {
      state.phase = "EXPIRED";
      logEvent("APPROVAL_EXPIRED", {
        issueId,
        requestId
      });
    }

    const approvalValid = Boolean(
      approvalShapeValid &&
      !state.approval.consumed &&
      state.approval.requestId === requestId &&
      state.approval.issueId === issueId &&
      Date.now() < state.approval.expiresAt
    );

    if (!approvalValid) {
      const reason =
        approvalExpired
          ? "human_approval_expired"
          : "human_approval_missing";

      return refuse(reason, state.pending);
    }

    /*
     * Approval is single-use.
     */

    state.approval.consumed = true;
    state.phase = "EXECUTING";

    logEvent("APPROVAL_CONSUMED", {
      issueId,
      requestId
    });

    issue.status = "resolved";

    logEvent("ACTION_ALLOWED", {
      issueId,
      requestId
    });

    const result = {
      status: "allowed",
      issueId,
      requestId,
      message:
        `Synthetic action completed: ${issue.action}`
    };

    state.pending = null;
    state.approval = null;
    state.phase = "RESOLVED";

    render();

    return result;
  }

  function approvePending(event) {
    /*
     * Programmatically dispatched JS events are rejected.
     * There is deliberately NO WebMCP approval tool.
     */

    if (!event?.isTrusted) {
      logEvent("APPROVAL_REJECTED", {
        reason: "untrusted_ui_event"
      });

      return;
    }

    if (!state.pending) return;

    state.approval = {
      requestId: state.pending.requestId,
      issueId: state.pending.issueId,
      approvedAt: nowIso(),
      expiresAt: Date.now() + APPROVAL_TTL_MS,
      consumed: false
    };
    state.phase = "HUMAN_APPROVED";

    logEvent("HUMAN_APPROVED", {
      issueId: state.pending.issueId,
      requestId: state.pending.requestId
    });

    render();
  }

  function revokeApproval(event) {
    if (!event?.isTrusted) return;
    if (!state.pending) return;

    logEvent("HUMAN_REVOKED", {
      issueId: state.pending.issueId,
      requestId: state.pending.requestId
    });

    state.approval = null;
    state.phase = "REVOKED";

    render();
  }

  function resetDemo(event) {
    if (event && !event.isTrusted) return;

    state.issues =
      source.issues.map((issue) => ({ ...issue }));

    state.pending = null;
    state.approval = null;
    state.phase = "IDLE";
    state.events = [];

    logEvent("DEMO_RESET");

    render();
  }

  function renderIssues() {
    const root = byId("issues");

    root.replaceChildren(
      ...state.issues.map((issue) => {
        const article = document.createElement("article");

        article.className = "issue-card";
        article.dataset.sensitivity = issue.sensitivity;

        article.innerHTML = `
          <div class="issue-topline">
            <span class="severity">${issue.severity}</span>
            <span class="status">${issue.status}</span>
          </div>

          <h3>${issue.title}</h3>

          <p>${issue.area}</p>

          <small>
            ${issue.rationale}
          </small>

          <div class="issue-foot">
            <span>${issue.sensitivity === "sensitive" ? "Human approval" : "Read only"}</span>
            <span>${issue.action}</span>
          </div>
        `;

        return article;
      })
    );
  }

  function renderGate() {
    const pending = state.pending;

    const issue =
      pending ? findIssue(pending.issueId) : null;

    const approval = getApprovalState();

    byId("gate-state").textContent =
      state.phase === "RESOLVED"
        ? "Action completed. Authority consumed. No reusable approval remains."
        : state.phase === "REVOKED"
          ? "Human approval withdrawn. The action remains refused."
          : state.phase === "EXPIRED"
            ? "Approval expired. The action remains refused."
            : !pending
              ? "No sensitive action is pending."
              : approval.approved
                ? "Human approval granted. Agent may retry the exact request."
                : "Action refused. Human approval required.";

    const phaseElement = byId("gate-phase");
    if (phaseElement) phaseElement.textContent = state.phase;

    byId("gate-detail").textContent =
      !pending
        ? "Ask the agent to perform a sensitive change."
        : `${issue?.action || "Unknown pending action"} · request ${pending.requestId}`;

    byId("approve").disabled =
      !pending || approval.approved;

    byId("revoke").disabled =
      !pending || !approval.approved;
  }

  function renderAudit() {
    const root = byId("audit");

    if (!root) return;

    root.replaceChildren(
      ...state.events.map((event) => {
        const li = document.createElement("li");

        li.textContent =
          `${new Date(event.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${event.type.replaceAll("_", " ")}` +
          `${event.issueId ? ` · ${event.issueId}` : ""}` +
          `${event.requestId ? ` · request ${event.requestId}` : ""}` +
          `${event.reason ? ` · ${event.reason}` : ""}`;

        return li;
      })
    );
  }

  function render() {
    renderIssues();
    renderGate();
    renderAudit();
  }

  byId("approve")
    .addEventListener("click", approvePending);

  byId("revoke")
    .addEventListener("click", revokeApproval);

  byId("reset")
    .addEventListener("click", resetDemo);

  window.CyberSeedsApp = Object.freeze({
    inspectHousehold,
    getApprovalState,
    performSensitiveChange
  });

  logEvent("DEMO_READY");
  render();
})();
