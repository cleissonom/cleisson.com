---
title: Kitmux
slug: kitmux
summary: Un catálogo en la terminal para elegir qué servidores MCP, skills y subagentes están disponibles para cada agente de programación.
dateStart: "2026-11-11T20:29:11.000Z"
role: Ingeniero de Software
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
  - Asigna una herramienta a Codex, Claude Code, OpenCode o Antigravity sin copiar la misma entrada en varios archivos de configuración.
  - Revisa la sincronización prevista y los conflictos cuando cambia la configuración de un cliente.
---

Cada agente de programación tiene su propio archivo de configuración, aunque varios agentes utilicen las mismas herramientas. Con Kitmux, cada recurso se registra una sola vez. El programa escribe la configuración nativa de los clientes que elijas.

## Un conjunto de herramientas para cada cliente

Puedes compartir un servidor de documentación entre varios clientes y reservar otro servidor para Codex. Los grupos permiten definir una opción común y hacer excepciones para recursos concretos. La interfaz de terminal muestra las asignaciones una junto a otra. Para automatizar tareas, la CLI ofrece salida en JSON y comprueba si hay cambios que sincronizar.

[Ver la interfaz de Kitmux en la terminal](https://github.com/cleisson-labs/kitmux/blob/main/docs/assets/tui-light.png). [Consulta los atajos de teclado y los ejemplos de sincronización](https://github.com/cleisson-labs/kitmux/blob/main/docs/GUIDE.md).
