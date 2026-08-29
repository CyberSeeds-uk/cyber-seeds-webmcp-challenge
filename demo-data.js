window.CYBER_SEEDS_DEMO = Object.freeze({
  household: {
    id: "SYNTH-HH-001",
    name: "Synthetic Household",
    notice: "Challenge-only synthetic data. No real household data is used."
  },

  issues: [
    {
      id: "account-mfa",
      title: "Primary account has no MFA",
      area: "Accounts",
      severity: "high",
      status: "open",
      action: "Enable multi-factor authentication",
      sensitivity: "sensitive",
      rationale:
        "This changes an account security setting and therefore requires explicit human approval."
    },

    {
      id: "router-update",
      title: "Router update is available",
      area: "Home network",
      severity: "medium",
      status: "open",
      action: "Apply router security update",
      sensitivity: "sensitive",
      rationale:
        "This changes device state and therefore requires explicit human approval."
    },

    {
      id: "scam-review",
      title: "Scam-awareness review is due",
      area: "Family awareness",
      severity: "low",
      status: "open",
      action: "Open scam-awareness guidance",
      sensitivity: "read-only",
      rationale:
        "This displays guidance and does not change household state."
    }
  ]
});
