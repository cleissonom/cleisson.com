---
title: Auditstream
slug: auditstream
summary: Motor de código aberto para trilhas de auditoria no PostgreSQL, escrito em Rust. Triggers gerados registram cada alteração com o usuário ou agente de IA responsável.
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
  - Triggers gerados gravam cada inserção, atualização e exclusão em uma única tabela de histórico, então o código da aplicação nunca grava linhas de auditoria.
  - O ator acompanha cada consulta, então as alterações mantêm o usuário ou agente de IA correto mesmo atrás do PgBouncer.
---

O Auditstream registra quem alterou o quê em um banco PostgreSQL. A CLI `auditstream` gera os triggers como uma migration e depois mostra o histórico de cada registro e o exporta em JSON Lines ou CSV.

## O ator acompanha cada consulta

O Auditstream envia o usuário ou agente de IA responsável pela alteração junto com a própria consulta, como um comentário SQL no final ou uma configuração local da transação. Nos benchmarks, 2,4 milhões de transações passaram pelo PgBouncer sem que um ator vazasse de uma transação para outra. SDKs em TypeScript para Prisma, Drizzle e Node.js adicionam o ator automaticamente, e qualquer outra linguagem pode enviar o próprio comentário SQL. O comando `auditstream verify` aponta triggers desativados ou removidos.

[Leia a documentação](https://auditstream.dev/docs/). [Veja os resultados dos benchmarks](https://auditstream.dev/docs/evidence/).
