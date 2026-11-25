---
title: File System MCP
slug: file-system-mcp
summary: Servidor MCP para ler e editar arquivos em um diretório delimitado, com um painel local que acompanha o uso das ferramentas.
dateStart: "2026-10-02T19:53:24.000Z"
role: Engenheiro de Software
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
  - Escolha um diretório raiz para permitir alterações. A descoberta automática abre o diretório em modo de leitura.
  - Consulte resultados, latência e volume de dados sem que o painel armazene nomes ou conteúdo de arquivos.
---

O File System MCP dá ao cliente acesso a um diretório escolhido no macOS ou Linux. O cliente pode pesquisar arquivos, inspecionar mudanças e aplicar patches de texto. As regras de exclusão do Git, os caminhos protegidos e a verificação de links simbólicos delimitam o acesso.

## Como acompanhar as edições

O cliente pode consultar o hash do conteúdo e informá-lo ao solicitar uma edição. Se o arquivo tiver mudado nesse intervalo, o servidor recusa a edição desatualizada. O painel opcional permite acompanhar a atividade ao longo do tempo. Seu banco SQLite fica fora do diretório de trabalho e registra metadados das chamadas, sem guardar seus argumentos ou resultados.

[Veja como o painel funciona e quais dados ele armazena](https://github.com/cleisson-labs/file-system-mcp/blob/main/docs/OBSERVER.md).
