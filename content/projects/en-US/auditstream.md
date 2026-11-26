---
title: Auditstream
slug: auditstream
summary: Open-source audit trail engine for PostgreSQL, written in Rust. Generated triggers record each change with the user or AI agent behind it.
dateStart: "2026-11-23T22:49:41.000Z"
role: Software Engineer
status: active
type: developer-tool
stage: maintained
tags:
  - Audit Logs
  - Rust
  - PostgreSQL
  - CLI
  - TypeScript
stack:
  - Rust
  - PostgreSQL
  - TypeScript
  - Prisma
  - Drizzle
links:
  repo: https://github.com/auditstream/auditstream
  live: https://auditstream.dev
highlights:
  - Generated triggers write every insert, update and delete to one history table, so application code never writes audit rows.
  - The actor travels with each query, so changes keep the right user or AI agent behind PgBouncer.
---

Auditstream records who changed what in a PostgreSQL database. The `auditstream` CLI generates the triggers as a migration, then shows each record's history and exports it as JSON Lines or CSV.

## The actor travels with each query

Auditstream sends the user or AI agent behind a change with the query itself, as a trailing SQL comment or a transaction-local setting. In its benchmarks, 2.4 million pooled transactions went through PgBouncer without an actor leaking from one transaction to another. TypeScript SDKs for Prisma, Drizzle and Node.js add the actor automatically, and any other language can send the SQL comment itself. `auditstream verify` reports triggers that were disabled or dropped.

[Read the documentation](https://auditstream.dev/docs/). [See the benchmark results](https://auditstream.dev/docs/evidence/).
