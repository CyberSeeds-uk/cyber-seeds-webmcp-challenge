const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sourceFiles = ["demo-data.js", "app.js"];

function harness({ webmcp = false, surface = "navigator" } = {}) {
  const elements = new Map();
  const makeElement = (id) => ({
    id,
    dataset: {},
    disabled: false,
    textContent: "",
    innerHTML: "",
    children: [],
    listeners: {},
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
    replaceChildren(...children) {
      this.children = children;
    }
  });

  for (const id of ["issues", "gate-state", "gate-detail", "approve", "revoke", "reset", "audit", "webmcp-status"]) {
    elements.set(id, makeElement(id));
  }

  const tools = [];
  const modelContext = {
    registerTool: async (tool) => {
      tools.push(tool);
    }
  };
  const document = {
    getElementById: (id) => elements.get(id),
    createElement: (tagName) => makeElement(tagName),
    modelContext: surface === "document" ? modelContext : null
  };
  const sandbox = {
    console,
    document,
    navigator: surface === "navigator" ? { modelContext } : {},
    crypto: { randomUUID: () => "11111111-1111-4111-8111-111111111111" },
    Uint8Array,
    Math,
    Date,
    JSON,
    setTimeout,
    clearTimeout
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);

  for (const file of sourceFiles) {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, { filename: file });
  }
  if (webmcp) {
    vm.runInContext(fs.readFileSync(path.join(root, "webmcp.js"), "utf8"), sandbox, { filename: "webmcp.js" });
  }

  const app = sandbox.CyberSeedsApp;
  const click = (id, isTrusted) => elements.get(id).listeners.click({ isTrusted });
  return { app, click, elements, tools, sandbox, registration: sandbox.CYBER_SEEDS_WEBMCP_REGISTRATION };
}

function pendingFor(app, issueId = "account-mfa") {
  const first = app.performSensitiveChange({ issueId });
  assert.equal(first.status, "refused");
  return first.requestId;
}

test("AUTH-001 sensitive request without approval -> REFUSED", () => {
  const { app } = harness();
  assert.deepEqual(app.performSensitiveChange({ issueId: "account-mfa" }).status, "refused");
});

test("AUTH-002 initial request produces bounded request ID", () => {
  const { app } = harness();
  const result = app.performSensitiveChange({ issueId: "account-mfa" });
  assert.match(result.requestId, /^[a-z0-9-]{1,64}$/);
});

test("AUTH-003 same request retried without approval -> REFUSED", () => {
  const { app } = harness();
  pendingFor(app);
  assert.equal(app.performSensitiveChange({ issueId: "account-mfa" }).reason, "request_id_required");
});

test("AUTH-004 random request ID -> REFUSED", () => {
  const { app } = harness();
  pendingFor(app);
  assert.equal(app.performSensitiveChange({ issueId: "account-mfa", requestId: "random" }).reason, "request_mismatch");
});

test("AUTH-005 wrong issue with valid pending request ID -> REFUSED", () => {
  const { app } = harness();
  const id = pendingFor(app);
  assert.equal(app.performSensitiveChange({ issueId: "router-update", requestId: id }).reason, "another_request_pending");
});

test("AUTH-006 different action cannot overwrite active pending request", () => {
  const { app } = harness();
  const id = pendingFor(app);
  app.performSensitiveChange({ issueId: "router-update" });
  assert.deepEqual(app.getApprovalState().pending.requestId, id);
  assert.equal(app.getApprovalState().pending.issueId, "account-mfa");
});

test("AUTH-007 agent cannot create approval via WebMCP", async () => {
  const { tools, registration } = harness({ webmcp: true });
  await registration;
  assert.deepEqual(tools.map((tool) => tool.name), ["inspect_demo_household", "get_approval_state", "perform_sensitive_change"]);
  assert.equal(tools.some((tool) => /approve|grant_authority|bypass|force_execute/.test(tool.name)), false);
});

test("AUTH-008 human approval binds exact request", () => {
  const { app, click } = harness();
  const id = pendingFor(app);
  click("approve", true);
  assert.equal(app.getApprovalState().pending.requestId, id);
  assert.equal(app.getApprovalState().approved, true);
});

test("AUTH-009 human approval binds exact issue", () => {
  const { app, click } = harness();
  const id = pendingFor(app, "account-mfa");
  click("approve", true);
  assert.equal(app.performSensitiveChange({ issueId: "router-update", requestId: id }).status, "refused");
});

test("AUTH-010 correct approved action -> ALLOWED", () => {
  const { app, click } = harness();
  const id = pendingFor(app);
  click("approve", true);
  assert.equal(app.performSensitiveChange({ issueId: "account-mfa", requestId: id }).status, "allowed");
});

test("AUTH-011 successful execution consumes approval", () => {
  const { app, click } = harness();
  const id = pendingFor(app);
  click("approve", true);
  app.performSensitiveChange({ issueId: "account-mfa", requestId: id });
  assert.equal(app.getApprovalState().phase, "RESOLVED");
  assert.equal(app.inspectHousehold().issues.find((issue) => issue.id === "account-mfa").status, "resolved");
});

test("AUTH-012 consumed approval replay -> REFUSED / NO EXECUTION", () => {
  const { app, click } = harness();
  const id = pendingFor(app);
  click("approve", true);
  app.performSensitiveChange({ issueId: "account-mfa", requestId: id });
  assert.equal(app.performSensitiveChange({ issueId: "account-mfa", requestId: id }).reason, "already_resolved");
});

test("AUTH-013 expired approval -> REFUSED", () => {
  const { app, click, sandbox } = harness();
  const id = pendingFor(app);
  click("approve", true);
  sandbox.Date.now = () => 9999999999999;
  assert.equal(app.performSensitiveChange({ issueId: "account-mfa", requestId: id }).reason, "human_approval_expired");
});

test("AUTH-014 revoked approval -> REFUSED", () => {
  const { app, click } = harness();
  const id = pendingFor(app);
  click("approve", true);
  click("revoke", true);
  assert.equal(app.performSensitiveChange({ issueId: "account-mfa", requestId: id }).reason, "human_approval_missing");
});

test("AUTH-015 programmatic untrusted approval click -> REJECTED", () => {
  const { app, click } = harness();
  pendingFor(app);
  click("approve", false);
  assert.equal(app.getApprovalState().approved, false);
});

test("AUTH-016 unknown issue ID -> ERROR / NO MUTATION", () => {
  const { app } = harness();
  const before = JSON.stringify(app.inspectHousehold());
  assert.equal(app.performSensitiveChange({ issueId: "unknown" }).reason, "unknown_issue");
  assert.equal(JSON.stringify(app.inspectHousehold()), before);
});

test("AUTH-017 malformed arguments -> NO MUTATION", () => {
  const { app } = harness();
  const before = JSON.stringify(app.getApprovalState());
  assert.equal(app.performSensitiveChange(null).reason, "invalid_arguments");
  assert.equal(JSON.stringify(app.getApprovalState()), before);
});

test("AUTH-018 unexpected properties -> rejected", () => {
  const { app } = harness();
  assert.equal(app.performSensitiveChange({ issueId: "account-mfa", approve: true }).reason, "invalid_arguments");
  assert.equal(app.getApprovalState().pending, null);
});

test("AUTH-019 read-only inspection produces no mutation", () => {
  const { app } = harness();
  const before = JSON.stringify(app.getApprovalState());
  app.inspectHousehold();
  assert.equal(JSON.stringify(app.getApprovalState()), before);
});

test("AUTH-020 read-only approval inspection produces no mutation", () => {
  const { app } = harness();
  pendingFor(app);
  const before = JSON.stringify(app.inspectHousehold());
  app.getApprovalState();
  assert.equal(JSON.stringify(app.inspectHousehold()), before);
});

test("AUTH-021 rapid duplicate calls cannot cause duplicate execution", () => {
  const { app, click } = harness();
  const id = pendingFor(app);
  for (let i = 0; i < 4; i += 1) app.performSensitiveChange({ issueId: "account-mfa" });
  click("approve", true);
  assert.equal(app.performSensitiveChange({ issueId: "account-mfa", requestId: id }).status, "allowed");
});

test("AUTH-022 attempted request rotations cannot bypass authority", () => {
  const { app } = harness();
  const id = pendingFor(app);
  app.performSensitiveChange({ issueId: "account-mfa", requestId: "rotate-1" });
  app.performSensitiveChange({ issueId: "router-update", requestId: "rotate-2" });
  assert.equal(app.getApprovalState().pending.requestId, id);
});

test("AUTH-023 reset restores known synthetic baseline", () => {
  const { app, click } = harness();
  pendingFor(app);
  click("reset", true);
  assert.equal(app.getApprovalState().phase, "IDLE");
  assert.equal(app.getApprovalState().pending, null);
  assert.equal(app.inspectHousehold().issues.every((issue) => issue.status === "open"), true);
});

test("AUTH-024 resolved action cannot execute twice", () => {
  const { app, click } = harness();
  const id = pendingFor(app);
  click("approve", true);
  app.performSensitiveChange({ issueId: "account-mfa", requestId: id });
  assert.equal(app.performSensitiveChange({ issueId: "account-mfa", requestId: id }).status, "no_change");
});

test("AUTH-025 no test uses real household data", () => {
  const { app } = harness();
  const inspection = app.inspectHousehold();
  assert.match(inspection.household.id, /^SYNTH-/);
  assert.equal(inspection.household.name, "Synthetic Household");
  assert.equal(inspection.issues.every((issue) => /^[a-z-]+$/.test(issue.id)), true);
});

test("WEBMCP-026 document.modelContext registers the same three tools and annotations", async () => {
  const { tools, registration } = harness({ webmcp: true, surface: "document" });
  await registration;
  assert.deepEqual(tools.map((tool) => tool.name), ["inspect_demo_household", "get_approval_state", "perform_sensitive_change"]);
  assert.deepEqual(tools.map((tool) => tool.annotations.readOnlyHint), [true, true, false]);
  assert.equal(tools.every((tool) => tool.inputSchema.additionalProperties === false), true);
});

test("WEBMCP-027 duplicate registration attempt does not duplicate the tool surface", async () => {
  const { tools, registration, sandbox } = harness({ webmcp: true });
  await registration;
  vm.runInContext(fs.readFileSync(path.join(root, "webmcp.js"), "utf8"), sandbox, { filename: "webmcp.js" });
  await sandbox.CYBER_SEEDS_WEBMCP_REGISTRATION;
  assert.equal(tools.length, 3);
});
