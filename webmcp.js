(() => {
  "use strict";

  const status =
    document.getElementById("webmcp-status");

  const existingRegistration =
    window.CYBER_SEEDS_WEBMCP_REGISTRATION;

  if (existingRegistration) return;

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
      "Read whether a sensitive synthetic action is pending and whether the human approved that exact request.",

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
      "Attempt a synthetic sensitive household change. The first attempt fails closed and creates an action-scoped approval request. The human must approve it in the visible page before the agent retries.",

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
