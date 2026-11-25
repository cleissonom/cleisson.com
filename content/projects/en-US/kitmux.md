---
title: Kitmux
slug: kitmux
summary: A terminal catalog for choosing which MCP servers, skills and subagents are available to each coding agent.
dateStart: "2026-11-11T20:29:11.000Z"
role: Software Engineer
status: active
type: developer-tool
stage: maintained
tags:
  - Cleisson Labs
  - CLI
  - MCP
  - C
stack:
  - C
  - POSIX
  - ncurses
links:
  repo: https://github.com/cleisson-labs/kitmux
highlights:
  - Assign a tool to Codex, Claude Code, OpenCode or Antigravity without copying the same entry into each configuration file.
  - Preview a sync and inspect conflicts when a client configuration has changed.
---

Each coding agent keeps a different configuration file, even when the agents use the same tools. Kitmux gives each resource a single entry, then writes the native configuration for the clients you select.

## A different toolkit for each client

For example, you can share a documentation server across clients while keeping another server available only in Codex. Groups let you make a common choice once and override it for an individual resource. The keyboard interface shows those assignments side by side. For scripts, the CLI can return JSON or check whether a sync is needed.

[View the Kitmux terminal interface](https://github.com/cleisson-labs/kitmux/blob/main/docs/assets/tui-light.png). [See the keyboard controls and sync examples](https://github.com/cleisson-labs/kitmux/blob/main/docs/GUIDE.md).
