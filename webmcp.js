(() => {
  "use strict";

  const status =
    document.getElementById("webmcp-status");

  const existingRegistration =
    window.CYBER_SEEDS_WEBMCP_REGISTRATION;

  if (existingRegistration) return;

  /*
   * Canonical WebMCP API:
   *   document.modelContext.registerTool(...)
   *
   * document.modelContext is the primary registration surface.
   * navigator.modelContext is retained only as a compatibility fallback
   * for previously verified WebMCP-capable runtimes.
   */
  const modelContext =
    document.modelContext ??
    navigator.modelContext ??
    null;

  if (!modelContext) {
    status.textContent =
      "WebMCP unavailable in this browser runtime.";

    status.dataset.state = "off";
    return;
  }

  const app = window.CyberSeedsApp;

  const encode = (value) =>
    JSON.stringify(value);

  /*
   * TOOL 1
   * READ ONLY
   */

  const registration = (async () => {
  await modelContext.registerTool({
    name: "inspect_demo_household",

    title: "Inspect demo household",

    description:
      "Read the synthetic Cyber Seeds household safety state. This tool never changes state and contains no real household data.",

    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    },

    annotations: {
      readOnlyHint: true,
      untrustedContentHint: false
    },

    execute: async () =>
      encode(app.inspectHousehold())
  });

  /*
   * TOOL 2
   * READ ONLY
   */

  await modelContext.registerTool({
    name: "get_approval_state",

    title: "Get approval state",

    description:
      "Read the current synthetic human-authority state. This tool never grants authority; it reports whether an exact request is pending, approved, denied, expired, revoked, resolved, or has no reusable authority.",

    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    },

    annotations: {
      readOnlyHint: true,
      untrustedContentHint: false
    },

    execute: async () =>
      encode(app.getApprovalState())
  });

  /*
   * TOOL 3
   * STATE CHANGING
   */

  await modelContext.registerTool({
    name: "perform_sensitive_change",

    title: "Perform sensitive change",

    description:
      "Attempt one exact synthetic sensitive household change. The first attempt always fails closed and creates a request bound to its target. Execution requires human approval of that exact request in the visible page; successful authority is single-use and cannot be replayed.",

    inputSchema: {
      type: "object",

      properties: {
        issueId: {
          type: "string",

          enum: [
            "account-mfa",
            "router-update"
          ],

          description:
            "Synthetic issue to change."
        },

        requestId: {
          type: "string",
          maxLength: 64,

          description:
            "Retry token returned by the refused first attempt."
        }
      },

      required: [
        "issueId"
      ],
      additionalProperties: false
    },

    annotations: {
      readOnlyHint: false,
      untrustedContentHint: false
    },

    execute: async ({
      issueId,
      requestId
    }) =>
      encode(
        app.performSensitiveChange({
          issueId,
          requestId: requestId || null
        })
      )
  });

  const apiSurface =
    document.modelContext
      ? "document.modelContext"
      : "navigator.modelContext";

  status.textContent =
    `WebMCP active · 3 tools registered · ${apiSurface}`;

  status.dataset.state = "on";
  })().catch((error) => {
    status.textContent =
      `WebMCP registration failed: ${error?.message || "unknown error"}`;
    status.dataset.state = "error";
    throw error;
  });

  window.CYBER_SEEDS_WEBMCP_REGISTRATION = registration;
})();
