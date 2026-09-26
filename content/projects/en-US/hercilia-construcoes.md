---
title: Hercília Construções
slug: hercilia-construcoes
summary: Website and product catalog for my family's building materials store in Picos, my hometown, with search, real store photos, and quote requests through WhatsApp.
dateStart: "2026-09-16T12:00:00.000Z"
role: Software Engineer
status: active
type: website
stage: live
tags:
  - Family Business
  - Local Commerce
  - Product Catalog
  - Progressive Enhancement
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
  - Built a public catalog with 553 records across 12 categories, with individual pages for 550 sufficiently identified products.
  - Added a materials list that customers can review, adjust, and turn into a WhatsApp quote request.
  - Kept navigation, product information, and contacts available without JavaScript, with Markdown and JSON for agents.
---

Hercília Construções is my family's building materials store in Picos, Piauí, the city where I was born. The store has served the Junco neighborhood for more than 30 years. I built its website to help people find materials, see the shop, and get in touch about their construction or renovation plans.

## From browsing to a quote request

The [catalog](https://www.herciliaconstrucoes.com/produtos/) organizes materials into 12 categories, including plumbing, electrical supplies, paints, and tools. Customers can browse category pages or search by name, brand, or size. Of the 553 public records, 550 have individual product pages; three remain available in their categories because their identification is incomplete.

Customers can add products to a materials list, adjust quantities, and review the message before opening WhatsApp. The list stays in the browser when storage is available. If storage is blocked, a link carries the temporary selection to the review page. Long messages remain available to copy in full.

![Hercília Construções catalog with search, category filters, product cards, and buttons to add materials to a quote list](/images/generated/projects/hercilia-catalog.project-banner.1200.779432a27360.jpeg)

The screenshots show the Portuguese website. The homepage uses a real photo of the storefront, and the [store gallery](https://www.herciliaconstrucoes.com/loja/#galeria) contains ten photos of the premises and materials. Those photos show the store; they do not establish current stock for individual products.

## Engineering choices

I used a Node.js build to generate HTML from structured data and templates, with no production dependencies. CSS handles the responsive layout, while small JavaScript modules add search and the quotation list. Product pages, category navigation, telephone links, and store information work without client-side JavaScript.

Images are served locally in responsive WebP and JPEG sizes. Content hashes give static assets versioned URLs. The site also publishes structured data, a sitemap, [agent instructions](https://www.herciliaconstrucoes.com/llms.txt), Markdown pages, and a [JSON catalog](https://www.herciliaconstrucoes.com/catalogo.json), so its public information is available beyond the visual interface.

## Scope

The site supports inquiries: it does not take payments, confirm stock, calculate order totals, or send messages automatically. The store confirms prices and availability directly with the customer. There are no customer accounts or trackers in the implementation. This case study describes the delivered features; it does not claim measured sales growth or an accessibility certification.
