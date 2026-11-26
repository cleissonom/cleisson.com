---
title: Auditstream
slug: auditstream
summary: Motor de código abierto para pistas de auditoría en PostgreSQL, escrito en Rust. Los triggers generados registran cada cambio con el usuario o agente de IA responsable.
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
  - Los triggers generados guardan cada inserción, actualización y borrado en una única tabla de historial, así que el código de la aplicación nunca escribe filas de auditoría.
  - El actor viaja con cada consulta, así que los cambios conservan el usuario o agente de IA correcto incluso detrás de PgBouncer.
---

Auditstream registra quién cambió qué en una base de datos PostgreSQL. La CLI `auditstream` genera los triggers como una migración y después muestra el historial de cada registro y lo exporta en JSON Lines o CSV.

## El actor viaja con cada consulta

Auditstream envía el usuario o agente de IA responsable del cambio con la propia consulta, como un comentario SQL al final o un ajuste local de la transacción. En sus pruebas de rendimiento, 2,4 millones de transacciones pasaron por PgBouncer sin que un actor se filtrara de una transacción a otra. Los SDK de TypeScript para Prisma, Drizzle y Node.js añaden el actor automáticamente, y cualquier otro lenguaje puede enviar el comentario SQL por su cuenta. El comando `auditstream verify` señala los triggers desactivados o eliminados.

[Lee la documentación](https://auditstream.dev/docs/). [Consulta los resultados de rendimiento](https://auditstream.dev/docs/evidence/).
