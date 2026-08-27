---
title: Jira → Toggl Quick Start
slug: jira-toggl-quickstart
summary: Extensión de Chrome que lleva los temporizadores de Toggl a Jira, copia incidencias como Markdown y, opcionalmente, convierte temporizadores finalizados en Work Logs.
dateStart: "2026-08-19T12:00:00.000Z"
role: Ingeniero de Software
status: active
type: developer-tool
stage: live
tags:
  - Extensión de Chrome
  - Jira
  - Toggl Track
  - Automatización
  - Herramientas para Desarrollo
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
  - Añadí controles en Jira para iniciar y detener temporizadores de Toggl, además de un panel lateral para reanudar trabajos y consultar totales diarios y semanales.
  - Implementé sincronización unidireccional y opcional con Jira Work Logs, con confirmación, reintentos, redondeo de duración y prevención de duplicados.
  - Mantuve la extensión local y ligera, sin backend, analítica, scripts remotos ni dependencias de ejecución de terceros.
---

Jira → Toggl Quick Start es una extensión independiente y de código abierto para Chrome que conecta el contexto de trabajo de Jira con Toggl Track sin necesitar otro servicio backend.

## Por qué la construí

En mi trabajo diario no podía usar Toggl directamente dentro de Jira, y varios pasos pequeños pero frecuentes interrumpían el flujo: abrir el temporizador correcto, mantener su descripción vinculada a la incidencia, registrar el tiempo terminado como Work Log y preparar una tarea para notas o una conversación con IA.

Construí la extensión primero para mí, después para mis compañeros de trabajo y finalmente la publiqué para cualquier persona que sienta la misma fricción. La intención no es reemplazar Jira ni Toggl, sino hacer que la conexión entre ambos se sienta como parte de un único flujo.

## Qué hace

- Inicia y detiene temporizadores de Toggl desde una incidencia de Jira y conserva la asociación con la tarea.
- Muestra los totales trabajados hoy y esta semana, el progreso de Jira y citas que se pueden reanudar en un panel lateral de Chrome.
- Copia el título y la descripción de una incidencia de Jira como Markdown después de una acción explícita de la persona usuaria.
- Crea Work Logs opcionales al detener temporizadores vinculados, con modos automático o de confirmación, redondeo, reintentos y prevención de duplicados.
- También permite usar temporizadores manuales de Toggl y plantillas configurables para descripciones de incidencias en flujos recurrentes.

## Límites

La extensión se ejecuta localmente en Chrome y usa las sesiones ya autenticadas de Jira y Toggl con permisos de host solicitados de forma restringida. La sincronización de Work Logs es opcional y unidireccional. No existe un backend, recopilación de analítica, carga de scripts remotos ni afiliación con Atlassian o Toggl.
