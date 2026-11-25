---
title: Teams MCP
slug: teams-mcp
summary: Servidor MCP não oficial, de somente leitura, para que assistentes de programação encontrem mensagens do Teams e leiam a conversa usando uma sessão autorizada.
dateStart: "2026-11-04T17:14:29.000Z"
role: Engenheiro de Software
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
  - Pesquise por remetente ou data, ou abra uma mensagem diretamente pelo link do Teams.
  - Leia as respostas no contexto da conversa e volte à mensagem original pelo link.
---

Uma decisão tomada em uma conversa do Teams pode ser difícil de encontrar depois. Com este servidor, o assistente pesquisa os chats e canais que a conta conectada já pode ler. O resultado traz um link para você conferir a conversa original no Teams.

## Como funciona o acesso

Na configuração padrão, você autoriza o acesso a uma sessão do Teams já aberta no navegador. Os cookies e os tokens de renovação permanecem no navegador. O conector lê mensagens e respostas, sem enviar mensagens nem marcar conversas como lidas. Se a verificação da sessão falhar, é preciso verificar a conta selecionada.

[Veja as formas de autenticação disponíveis](https://github.com/cleisson-labs/teams-mcp#authentication-sources).
