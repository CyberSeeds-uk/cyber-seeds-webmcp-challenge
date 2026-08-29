# Forensic baseline

Recorded before implementation changes on 2026-08-29.

- Working directory: `/home/jxnesyy/cyber-seeds-webmcp-challenge` (physical path confirmed).
- Repository: isolated directory, no symlinks, no remotes, no commits, branch `main`.
- Public files: `.gitignore`, `IP_BOUNDARY.md`, `_headers`, `app.js`, `demo-data.js`, `index.html`, `styles.css`, `webmcp.js`, and the preserved pre-Chrome-149 copy.
- JavaScript syntax: `node --check` passed for every `.js` file.
- Existing tools: `inspect_demo_household` (read-only), `get_approval_state` (read-only), `perform_sensitive_change` (state-changing).
- Existing authority: `pending` and `approval` are client-local; approval is action/request bound, two-minute, single-use, and unavailable through WebMCP.
- Existing mutation paths: sensitive execution, visible approval, visible revocation, visible reset. Read-only inspection paths do not intentionally mutate household or authority state.
- Isolation checks: no private-repository symlinks, git objects, remotes, credentials, real household records, or external runtime scripts were found.

## Pre-change hashes

```text
67cd442e8464747158b8b27a2eacac3369ca862c851859acf239c07059c6c43c  .gitignore
f78bf942f3459f302d914e9d21b68768ad2b40e19c2847bbf51678486d4ed89a  IP_BOUNDARY.md
19607ab3002cf31cc949ccbc80144ceaebf68a30e05d28b32ae21e6ea6601085  _headers
c44fd325df178064e041e883ab3f31ac9b64b8fe29aae8b6422edd7cfe9131b7  app.js
b757e67d817901f2a153d5b615601e996098181c77fe6bfa3d8b511b5b9c7e33  demo-data.js
965f676a0e3a6aaa7a69173a435f96f397a6f0fe6b6b1b897e4e310e3bdf8203  index.html
dc47be3b82715453211f8241a2913fbf39c39a4c5f0bb7a8d155405c37fa9b2b  styles.css
5468fbdf18684995cb1e844a694ba6b974bccdd86e7a9e603a12f0cf6d2b7542  webmcp.js
449f4148b1b90d1bd4589a0d32ceba26c3ab80517bf199339cbcc5a9a1dbbcf6  webmcp.js.pre-chrome149-fix
```
