---
title: Kitmux
slug: kitmux
summary: Um catálogo no terminal para escolher quais servidores MCP, skills e subagentes ficam disponíveis em cada agente de programação.
dateStart: "2026-11-11T20:29:11.000Z"
role: Engenheiro de Software
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
  - Atribua uma ferramenta ao Codex, Claude Code, OpenCode ou Antigravity sem copiar a mesma entrada para vários arquivos de configuração.
  - Confira a prévia da sincronização e veja os conflitos quando a configuração de um cliente mudar.
---

Cada agente de programação tem seu próprio arquivo de configuração, mesmo quando vários agentes usam as mesmas ferramentas. No Kitmux, cada recurso tem um único cadastro. O programa escreve a configuração nativa dos clientes que você selecionar.

## Um conjunto de ferramentas para cada cliente

Um servidor de documentação pode ficar disponível em vários clientes, enquanto outro servidor fica restrito ao Codex. Os grupos permitem definir uma escolha comum e abrir exceções para recursos específicos. A interface de terminal mostra as atribuições lado a lado. Para automação, a CLI também oferece saída em JSON e verifica se há mudanças a sincronizar.

[Veja a interface do Kitmux no terminal](https://github.com/cleisson-labs/kitmux/blob/main/docs/assets/tui-light.png). [Consulte os atalhos de teclado e os exemplos de sincronização](https://github.com/cleisson-labs/kitmux/blob/main/docs/GUIDE.md).
