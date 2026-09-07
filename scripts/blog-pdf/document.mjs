import fs from "node:fs"
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ReactMarkdown, { defaultUrlTransform } from "react-markdown"
import remarkGfm from "remark-gfm"
import { formatContentDate } from "../../lib/display-date.ts"
import { SITE_NAME } from "../../lib/site.ts"
import { imageAsset } from "./assets.mjs"
import { projectPath } from "./paths.mjs"
import { captureInputs } from "./fingerprint.mjs"

const labels = {
  "en-US": {
    published: "Published",
    updated: "Updated",
    source: "Source article",
    page: "Page",
    of: "of"
  },
  "pt-BR": {
    published: "Publicado",
    updated: "Atualizado",
    source: "Artigo original",
    page: "Página",
    of: "de"
  },
  "es-ES": {
    published: "Publicado",
    updated: "Actualizado",
    source: "Artículo original",
    page: "Página",
    of: "de"
  }
}

function articleHeader(post) {
  const copy = labels[post.locale]
  const date = (value) => formatContentDate(value, post.locale, { dateStyle: "long" })
  return h(
    "header",
    null,
    h("p", { className: "author" }, SITE_NAME),
    h("h1", null, post.title),
    h("p", { className: "summary" }, post.summary),
    h(
      "p",
      { className: "metadata" },
      `${copy.published}: ${date(post.date)}`,
      post.updatedAt ? ` · ${copy.updated}: ${date(post.updatedAt)}` : ""
    ),
    h(
      "p",
      { className: "source" },
      `${copy.source}: `,
      h("a", { href: post.sourceUrl }, post.sourceUrl)
    )
  )
}

function markdown(post, root, assets) {
  const components = {
    img: ({ src, alt, title }) => {
      const asset = imageAsset(root, post, src)
      assets.set(asset.path, asset)
      return h("img", { src: asset.uri, alt, title })
    }
  }
  const urlTransform = (url, key) => {
    if (key === "src") return url // Validate image paths before React Markdown can erase them.
    const safe = defaultUrlTransform(url)
    if (url && !safe) throw new Error(`Unsafe article link in ${post.source}`)
    return safe.startsWith("#") ? safe : new URL(safe, post.sourceUrl).href
  }
  return h(ReactMarkdown, { remarkPlugins: [remarkGfm], components, urlTransform }, post.body)
}

export function prepareDocument(root, post) {
  const assets = new Map()
  const css = fs.readFileSync(projectPath(root, "scripts/blog-pdf/print.css"), "utf8")
  const body = h(
    "body",
    null,
    h("main", null, h("article", null, articleHeader(post), markdown(post, root, assets)))
  )
  const head = h(
    "head",
    null,
    h("meta", { charSet: "utf-8" }),
    h("meta", {
      httpEquiv: "Content-Security-Policy",
      content: "default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'"
    }),
    h("title", null, post.title),
    h("style", null, css)
  )
  const html = `<!doctype html>${renderToStaticMarkup(h("html", { lang: post.locale }, head, body))}`
  const images = [...assets.values()]
  return { post, html, assets: images, inputs: captureInputs(root, post, images, css) }
}

export function footerTemplate(locale) {
  const copy = labels[locale]
  return `<div style="font-family:Arial,sans-serif;font-size:9px;color:#666;width:100%;text-align:center">${copy.page} <span class="pageNumber"></span> ${copy.of} <span class="totalPages"></span></div>`
}
