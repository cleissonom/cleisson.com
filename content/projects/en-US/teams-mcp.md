---
title: Teams MCP
slug: teams-mcp
summary: An unofficial, read-only MCP server that lets coding assistants find a Teams message and read its conversation using an approved session.
dateStart: "2026-11-04T17:14:29.000Z"
role: Software Engineer
status: active
type: developer-tool
stage: maintained
tags:
  - Cleisson Labs
  - Microsoft Teams
  - MCP
  - Rust
stack:
  - Rust
  - MCP
  - HTTPS
links:
  repo: https://github.com/cleisson-labs/teams-mcp
highlights:
  - Search by sender or date, or open a message directly from its Teams link.
  - Read replies in context and follow the original message link back to Teams.
---

A decision made in a Teams thread can be hard to find later. This server gives an assistant a way to search chats and channels the signed-in account can already read. A search result includes the Teams link, so you can check the original exchange yourself.

## How access works

The default setup asks you to approve access to an existing Teams browser session. Cookies and refresh tokens stay in the browser. The read-only tools retrieve messages, threads and replies while preserving the conversation’s read state. A failed session check requires attention on the selected account.

[Read about supported authentication sources](https://github.com/cleisson-labs/teams-mcp#authentication-sources).
