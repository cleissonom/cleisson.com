---
title: Teams MCP
slug: teams-mcp
summary: Servidor MCP no oficial de solo lectura que permite a un asistente encontrar mensajes de Teams y leer la conversación con una sesión autorizada.
dateStart: "2026-11-04T17:14:29.000Z"
role: Ingeniero de Software
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
  - Busca por remitente o fecha, o abre un mensaje directamente desde su enlace de Teams.
  - Lee las respuestas en su contexto y vuelve al mensaje original desde el enlace.
---

Una decisión tomada en un hilo de Teams puede ser difícil de localizar después. Este servidor permite al asistente buscar en los chats y canales que la cuenta conectada ya puede leer. El resultado incluye un enlace a Teams para que puedas consultar el intercambio original.

## Cómo funciona el acceso

La configuración predeterminada te pide que autorices el acceso a una sesión de Teams abierta en el navegador. Las cookies y los tokens de renovación permanecen en el navegador. El conector lee mensajes y respuestas, sin enviar mensajes ni marcar conversaciones como leídas. Si falla la comprobación de la sesión, hay que revisar la cuenta seleccionada.

[Consulta las opciones de autenticación](https://github.com/cleisson-labs/teams-mcp#authentication-sources).
