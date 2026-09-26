---
title: Hercília Construções
slug: hercilia-construcoes
summary: Site e catálogo de produtos da loja de materiais de construção da minha família em Picos, minha cidade natal, com busca, fotos reais da loja e pedidos de orçamento pelo WhatsApp.
dateStart: "2026-09-16T12:00:00.000Z"
role: Engenheiro de Software
status: active
type: website
stage: live
tags:
  - Empresa Familiar
  - Comércio Local
  - Catálogo de Produtos
  - Melhoria Progressiva
  - SEO
stack:
  - HTML
  - CSS
  - JavaScript
  - Node.js
  - JSON-LD
  - Vercel
coverImage: /projects/hercilia-construcoes.png
links:
  live: https://www.herciliaconstrucoes.com
highlights:
  - Construí um catálogo público com 553 registros em 12 categorias e páginas individuais para 550 produtos com identificação suficiente.
  - Adicionei uma lista de materiais que o cliente pode revisar, ajustar e transformar em um pedido de orçamento pelo WhatsApp.
  - Mantive navegação, informações dos produtos e contatos disponíveis sem JavaScript, com Markdown e JSON para agentes.
---

A Hercília Construções é a loja de materiais de construção da minha família em Picos, no Piauí, cidade onde nasci. A loja atende o bairro Junco há mais de 30 anos. Construí o site para ajudar as pessoas a encontrar materiais, conhecer a loja e entrar em contato sobre suas obras e reformas.

## Da consulta ao pedido de orçamento

O [catálogo](https://www.herciliaconstrucoes.com/produtos/) organiza os materiais em 12 categorias, como hidráulica, elétrica, tintas e ferramentas. O cliente pode navegar pelas categorias ou buscar por nome, marca ou medida. Dos 553 registros públicos, 550 têm páginas individuais; três continuam disponíveis nas categorias porque sua identificação está incompleta.

O cliente pode adicionar produtos a uma lista de materiais, ajustar quantidades e revisar a mensagem antes de abrir o WhatsApp. A lista fica no navegador quando o armazenamento está disponível. Se ele estiver bloqueado, um link leva a seleção temporária à página de revisão. Mensagens longas continuam disponíveis para copiar na íntegra.

![Catálogo da Hercília Construções com busca, filtros por categoria, cartões de produtos e botões para adicionar materiais à lista de orçamento](/images/generated/projects/hercilia-catalog.project-banner.1200.779432a27360.jpeg)

As capturas mostram o site em português. A página inicial usa uma foto real da fachada, e a [galeria da loja](https://www.herciliaconstrucoes.com/loja/#galeria) reúne dez fotos dos espaços e materiais. Essas fotos mostram a loja; não confirmam o estoque atual de cada produto.

## Escolhas de engenharia

Usei um build em Node.js para gerar HTML a partir de dados estruturados e templates, sem dependências de produção. O CSS cuida do layout responsivo, enquanto pequenos módulos JavaScript acrescentam a busca e a lista de orçamento. Páginas de produtos, navegação por categorias, links de telefone e informações da loja funcionam sem JavaScript no navegador.

As imagens são servidas localmente em tamanhos responsivos nos formatos WebP e JPEG. Hashes de conteúdo geram URLs versionadas para os arquivos estáticos. O site também publica dados estruturados, sitemap, [instruções para agentes](https://www.herciliaconstrucoes.com/llms.txt), páginas em Markdown e um [catálogo em JSON](https://www.herciliaconstrucoes.com/catalogo.json), tornando as informações públicas acessíveis além da interface visual.

## Escopo

O site facilita consultas: não recebe pagamentos, confirma estoque, calcula o total de pedidos nem envia mensagens automaticamente. A loja confirma preços e disponibilidade diretamente com o cliente. A implementação não tem contas de clientes nem rastreadores. Este relato descreve as funcionalidades entregues, sem atribuir a elas crescimento de vendas medido ou certificação de acessibilidade.
