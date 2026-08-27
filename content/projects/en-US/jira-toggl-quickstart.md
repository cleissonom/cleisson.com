---
title: Jira → Toggl Quick Start
slug: jira-toggl-quickstart
summary: Chrome extension that brings Toggl timers into Jira, copies issues as Markdown, and optionally turns completed timers into Jira Work Logs.
dateStart: "2026-08-19T12:00:00.000Z"
role: Software Engineer
status: active
type: developer-tool
stage: live
tags:
  - Chrome Extension
  - Jira
  - Toggl Track
  - Automation
  - Developer Tools
stack:
  - JavaScript
  - HTML
  - CSS
  - Chrome Extensions Manifest V3
  - Jira REST API
  - Toggl Track API
  - Node.js
coverImage: /projects/jira-toggl-quickstart.png
links:
  repo: https://github.com/cleissonom/jira-toggl-quickstart
  live: https://chromewebstore.google.com/detail/jira-%E2%86%92-toggl-quick-start/ijkninhienjcgnlfcelljeoimpankboc
highlights:
  - Added Jira controls for starting and stopping Toggl timers, plus a side panel for replaying work and tracking daily and weekly totals.
  - Built optional one-way Jira Work Log synchronization with confirmation, retries, duration rounding, and duplicate prevention.
  - Kept the extension local and lightweight, with no backend, analytics, remote scripts, or third-party runtime dependencies.
---

Jira → Toggl Quick Start is an independent, open-source Chrome extension that connects the Jira work context with Toggl Track without requiring another backend service.

## Why I built it

In my daily work, I could not use Toggl directly inside Jira, and a few small but frequent steps kept interrupting the flow: opening the right timer, keeping its description tied to the Jira issue, recording the completed time as a Work Log, and preparing an issue for notes or an AI conversation.

I built the extension first for myself, then for my coworkers, and finally published it for anyone who feels the same friction. The goal is not to replace Jira or Toggl, but to make the connection between them feel like part of one workflow.

## What it does

- Starts and stops Toggl timers from a Jira issue and preserves the issue association.
- Shows worked-today and worked-this-week totals, Jira progress, and replayable appointments in a Chrome side panel.
- Copies a Jira issue title and description as Markdown through an explicit user action.
- Optionally creates Jira Work Logs when linked timers stop, with automatic or confirmation-based modes, rounding, retries, and duplicate prevention.
- Supports manual Toggl timers and configurable issue-description templates for recurring workflows.

## Boundaries

The extension runs locally in Chrome and uses the signed-in Jira and Toggl sessions with narrowly requested host permissions. Work Log synchronization is optional and one-way. There is no backend, analytics collection, remote script loading, or affiliation with Atlassian or Toggl.
