---
title: File System MCP
slug: file-system-mcp
summary: Servidor MCP para leer y editar archivos dentro de un directorio delimitado, con un panel local que muestra el uso de las herramientas.
dateStart: "2026-10-02T19:53:24.000Z"
role: Ingeniero de Software
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
  - Elige un directorio raíz para permitir cambios. La detección automática abre el directorio en modo de solo lectura.
  - Consulta resultados, latencia y volumen de datos sin que el panel almacene nombres ni contenido de archivos.
---

File System MCP da al cliente acceso a un directorio concreto en macOS o Linux. El cliente puede buscar archivos, revisar cambios y aplicar parches de texto. Las reglas de exclusión de Git, las rutas protegidas y las comprobaciones de enlaces simbólicos delimitan el acceso.

## Cómo seguir las ediciones

El cliente puede leer el hash del contenido y enviarlo al solicitar una edición. Si el archivo ha cambiado mientras tanto, el servidor rechaza la edición desactualizada. El panel opcional permite consultar la actividad a lo largo del tiempo. Su base de datos SQLite queda fuera del directorio de trabajo y registra metadatos de las llamadas, sin guardar sus argumentos ni sus resultados.

[Consulta cómo funciona el panel y qué datos conserva](https://github.com/cleisson-labs/file-system-mcp/blob/main/docs/OBSERVER.md).
