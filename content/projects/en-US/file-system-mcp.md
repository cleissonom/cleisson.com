---
title: File System MCP
slug: file-system-mcp
summary: A workspace-scoped MCP server for reading and editing files, with a local dashboard that tracks tool activity.
dateStart: "2026-10-02T19:53:24.000Z"
role: Software Engineer
status: active
type: developer-tool
stage: maintained
tags:
  - Cleisson Labs
  - MCP
  - Rust
  - SQLite
stack:
  - Rust
  - MCP
  - SQLite
  - JavaScript
links:
  repo: https://github.com/cleisson-labs/file-system-mcp
highlights:
  - Choose an explicit workspace root to enable edits; automatic discovery opens a read-only workspace.
  - Inspect tool outcomes, latency and bytes processed without storing filenames or file contents in the dashboard.
---

File System MCP gives a client access to a chosen directory on macOS or Linux. A client can search files, inspect changes and apply text patches. Git ignore rules, protected paths and symlink checks keep operations inside the configured boundary.

## Keeping track of edits

A client can read the current content hash and supply it with an edit. If the file has changed in the meantime, the server rejects the stale edit. The optional observer lets you inspect activity over time. Its SQLite database stays outside the workspace, and records metadata about calls without recording their arguments or results.

[Read about the observer and what it stores](https://github.com/cleisson-labs/file-system-mcp/blob/main/docs/OBSERVER.md).
