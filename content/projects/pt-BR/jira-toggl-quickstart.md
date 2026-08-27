---
title: Jira → Toggl Quick Start
slug: jira-toggl-quickstart
summary: Extensão do Chrome que leva os timers do Toggl para o Jira, copia issues em Markdown e, opcionalmente, transforma timers concluídos em Work Logs.
dateStart: "2026-08-19T12:00:00.000Z"
role: Engenheiro de Software
status: active
type: developer-tool
stage: live
tags:
  - Extensão do Chrome
  - Jira
  - Toggl Track
  - Automação
  - Ferramentas para Desenvolvimento
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
  - Adicionei controles no Jira para iniciar e parar timers do Toggl, além de um painel lateral para retomar trabalhos e acompanhar totais diários e semanais.
  - Implementei sincronização opcional e unidirecional com Jira Work Logs, incluindo confirmação, retentativas, arredondamento de duração e prevenção de duplicidade.
  - Mantive a extensão local e leve, sem backend, analytics, scripts remotos ou dependências de runtime de terceiros.
---

Jira → Toggl Quick Start é uma extensão independente e open source para Chrome que conecta o contexto de trabalho do Jira ao Toggl Track sem exigir outro serviço de backend.

## Por que eu criei

No meu dia a dia, eu não conseguia usar o Toggl diretamente dentro do Jira, e algumas etapas pequenas, mas frequentes, interrompiam o fluxo: abrir o timer certo, manter a descrição ligada à issue, registrar o tempo concluído como Work Log e preparar uma tarefa para anotações ou uma conversa com IA.

Criei a extensão primeiro para mim, depois para meus colegas de trabalho e, por fim, publiquei para qualquer pessoa que sinta o mesmo atrito. A ideia não é substituir o Jira nem o Toggl, mas fazer a conexão entre eles parecer parte de um único fluxo.

## O que ela faz

- Inicia e para timers do Toggl a partir de uma issue do Jira, preservando a associação com a tarefa.
- Mostra totais trabalhados no dia e na semana, progresso no Jira e compromissos que podem ser retomados em um painel lateral do Chrome.
- Copia o título e a descrição de uma issue do Jira como Markdown após uma ação explícita da pessoa usuária.
- Cria Work Logs opcionais quando timers vinculados são encerrados, com modos automático ou por confirmação, arredondamento, retentativas e prevenção de duplicidade.
- Também oferece timers manuais do Toggl e templates configuráveis para descrições de issues em fluxos recorrentes.

## Limites

A extensão roda localmente no Chrome e usa as sessões já autenticadas do Jira e do Toggl com permissões de host solicitadas de forma restrita. A sincronização de Work Logs é opcional e unidirecional. Não há backend, coleta de analytics, carregamento de scripts remotos nem afiliação com Atlassian ou Toggl.
