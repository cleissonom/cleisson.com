import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import net from "node:net"
import path from "node:path"
import { after, before, test } from "node:test"

const root = process.cwd()
const locales = ["en-US", "pt-BR", "es-ES"]
const trustPaths = ["about", "contact", "privacy"]
const expectedResumeSha256 = {
  "en-US": "49c29a9874a37bc39de8588f997a24e869e44756e943b2009965de02f2084982",
  "pt-BR": "97944ab0ab2192a40a742180a7d7e0aa7be8331381732c324be34d8a777d599a",
  "es-ES": "109e70ac0c6e4848334cde9465db9020e8f8a524ff83a242844cb4d48246bdf7"
}

let server
let serverOutput = ""
let origin
const configuredOrigin = process.env.AGENT_READINESS_BASE_URL?.replace(/\/$/, "")

function reservePort() {
  return new Promise((resolve, reject) => {
    const listener = net.createServer()
    listener.once("error", reject)
    listener.listen(0, "127.0.0.1", () => {
      const address = listener.address()
      listener.close(() => resolve(address.port))
    })
  })
}

function recordServerOutput(chunk) {
  serverOutput = `${serverOutput}${chunk}`.slice(-20_000)
}

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js exited early:\n${serverOutput}`)
    }

    try {
      const response = await fetch(origin)
      if (response.ok) return
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for Next.js:\n${serverOutput}`)
}

async function stopServer() {
  if (!server || server.exitCode !== null) return
  server.kill("SIGTERM")
  await new Promise((resolve) => server.once("exit", resolve))
}

function mainHtml(html) {
  return html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? ""
}

function footerHtml(html) {
  return html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i)?.[1] ?? ""
}

function visibleText(html) {
  return html
    .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|#160);/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&(?:quot|#34);/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function agentReadableText(html) {
  return visibleText(html.replace(/<(noscript|nav|footer|header)\b[\s\S]*?<\/\1>/gi, " "))
}

function headingLevels(html) {
  return [...html.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]))
}

function varyTokens(response) {
  return (response.headers.get("vary") ?? "").split(",").map((token) => token.trim().toLowerCase())
}

function assertNegotiatedHeaders(response, contentType) {
  assert.match(response.headers.get("content-type") ?? "", contentType)
  assert.ok(varyTokens(response).includes("accept"), "Vary should include Accept")
  assert.ok(varyTokens(response).includes("accept-encoding"), "Vary should include Accept-Encoding")
}

function assertHtmlHeaders(response) {
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i)
  assert.ok(varyTokens(response).includes("rsc"), "Next.js RSC variance should be preserved")
  if (response.headers.has("x-vercel-id")) {
    assert.ok(varyTokens(response).includes("accept"), "Vercel Vary should include Accept")
  }
  assert.ok(varyTokens(response).includes("accept-encoding"))
  assert.match(response.headers.get("link") ?? "", /rel="alternate"; type="text\/markdown"/)
  assert.match(response.headers.get("link") ?? "", /rel="describedby"/)
}

async function fetchText(pathname, options) {
  const response = await fetch(`${origin}${pathname}`, options)
  return { response, body: await response.text() }
}

before(
  async () => {
    if (configuredOrigin) {
      origin = configuredOrigin
      const response = await fetch(origin)
      assert.ok(response.ok, `${origin} should be reachable`)
      return
    }

    const port = await reservePort()
    origin = `http://127.0.0.1:${port}`
    const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next")
    server = spawn(
      process.execPath,
      [nextBin, "dev", "--hostname", "127.0.0.1", "--port", `${port}`],
      {
        cwd: root,
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
        stdio: ["ignore", "pipe", "pipe"]
      }
    )
    server.stdout.on("data", recordServerOutput)
    server.stderr.on("data", recordServerOutput)
    await waitForServer()
  },
  { timeout: 60_000 }
)

after(stopServer)

test("the raw homepage is complete, structured server-rendered HTML", async () => {
  const { response, body } = await fetchText("/")
  const main = mainHtml(body)
  const levels = headingLevels(main)
  const readableTextDensity = agentReadableText(body).length / body.length
  const sectionTags = [...main.matchAll(/<section\b[^>]*>/gi)].map((match) => match[0])
  const sectionHeadingIds = [
    "home-snapshot-title",
    "home-focus-title",
    "home-experience-title",
    "home-projects-title",
    "home-blog-title"
  ]

  assert.equal(response.status, 200)
  assertHtmlHeaders(response)
  if (configuredOrigin) {
    assert.ok(
      readableTextDensity > 0.052,
      `agent-readable text density should stay safely above 5% (received ${(readableTextDensity * 100).toFixed(2)}%)`
    )
  }
  assert.match(body, /<title>Cleisson de Oliveira Moura \| Senior Software Engineer<\/title>/i)
  assert.match(
    body,
    /<meta\b(?=[^>]*\bname="application-name")(?=[^>]*\bcontent="Cleisson de Oliveira Moura")[^>]*>/i
  )
  assert.match(
    body,
    /<meta\b(?=[^>]*\bproperty="og:site_name")(?=[^>]*\bcontent="Cleisson de Oliveira Moura")[^>]*>/i
  )
  assert.match(
    body,
    /<link\b(?=[^>]*\brel="canonical")(?=[^>]*\bhref="https:\/\/www\.cleisson\.com\/en-US")[^>]*>/i
  )
  for (const locale of locales) {
    assert.match(
      body,
      new RegExp(
        `<link\\b(?=[^>]*\\brel="alternate")(?=[^>]*\\bhrefLang="${locale}")(?=[^>]*\\bhref="https://www\\.cleisson\\.com/${locale}")[^>]*>`,
        "i"
      )
    )
  }
  assert.match(
    body,
    /<link\b(?=[^>]*\brel="alternate")(?=[^>]*\bhrefLang="x-default")(?=[^>]*\bhref="https:\/\/www\.cleisson\.com\/en-US")[^>]*>/i
  )
  assert.match(main, /<h1\b[^>]*>Cleisson de Oliveira Moura<\/h1>/i)
  assert.match(body, /<link rel="alternate" type="text\/markdown" href="[^"]+\.md"\s*\/?>/i)
  assert.match(body, /<link rel="describedby" href="\/llms\.txt"\s*\/?>/i)
  for (const trustPath of trustPaths) {
    assert.match(footerHtml(body), new RegExp(`href="/en-US/${trustPath}"`))
  }
  assert.doesNotMatch(footerHtml(body), /href="mailto:/i)
  assert.ok(visibleText(main).length >= 500, "homepage main content should exceed 500 characters")
  assert.deepEqual([...new Set(levels)].slice(0, 3), [1, 2, 3])
  assert.equal(levels.filter((level) => level === 1).length, 1)
  assert.ok(sectionTags.length >= sectionHeadingIds.length)
  for (const tag of sectionTags) {
    assert.match(tag, /\baria-labelledby="[^"]+"/)
  }
  for (const id of sectionHeadingIds) {
    assert.ok(
      sectionTags.some((tag) => tag.includes(`aria-labelledby="${id}"`)),
      `${id} should label one homepage section`
    )
    assert.match(main, new RegExp(`<h2\\b[^>]*id="${id}"`))
  }
  for (let index = 1; index < levels.length; index += 1) {
    assert.ok(levels[index] - levels[index - 1] <= 1, "heading levels should not skip downward")
  }
})

test("the canonical URL negotiates HTML and Markdown according to Accept", async () => {
  const markdown = await fetchText("/", { headers: { Accept: "text/markdown" } })
  assert.equal(markdown.response.status, 200)
  assertNegotiatedHeaders(markdown.response, /^text\/markdown;\s*charset=utf-8$/i)
  assert.equal(markdown.response.headers.get("cache-control"), "no-store")
  assert.match(markdown.body, /^# Cleisson de Oliveira Moura\n/m)

  const html = await fetchText("/", {
    headers: { Accept: "text/html, text/markdown;q=0.8" }
  })
  assert.equal(html.response.status, 200)
  assertHtmlHeaders(html.response)

  const wildcard = await fetchText("/", {
    headers: { Accept: "text/html;q=0, */*;q=1" }
  })
  assert.equal(wildcard.response.status, 200)
  assertNegotiatedHeaders(wildcard.response, /^text\/markdown;\s*charset=utf-8$/i)

  const unacceptable = await fetchText("/", { headers: { Accept: "application/pdf" } })
  assert.equal(unacceptable.response.status, 406)
  assert.match(unacceptable.body, /text\/html[\s\S]*text\/markdown/)
  assertNegotiatedHeaders(unacceptable.response, /^text\/plain;\s*charset=utf-8$/i)
  assert.equal(unacceptable.response.headers.get("cache-control"), "no-store")
})

test("explicit Markdown siblings work for GET and HEAD", async () => {
  const getResponse = await fetchText("/en-US.md")
  assert.equal(getResponse.response.status, 200)
  assertNegotiatedHeaders(getResponse.response, /^text\/markdown;\s*charset=utf-8$/i)
  assert.match(getResponse.body, /^# Cleisson de Oliveira Moura\n/m)

  const headResponse = await fetch(`${origin}/en-US.md`, { method: "HEAD" })
  assert.equal(headResponse.status, 200)
  assertNegotiatedHeaders(headResponse, /^text\/markdown;\s*charset=utf-8$/i)
  assert.equal(await headResponse.text(), "")
})

test("App Router component requests bypass public content negotiation", async () => {
  const result = await fetchText("/en-US/about", {
    headers: { Accept: "text/x-component", RSC: "1" }
  })

  assert.equal(result.response.status, 200)
  assert.match(result.response.headers.get("content-type") ?? "", /^text\/x-component\b/i)
  assert.ok(result.body.length > 100)

  const unsupported = await fetchText("/en-US/about", {
    headers: { Accept: "text/x-component" }
  })
  assert.equal(unsupported.response.status, 406)
})

test("locale-negotiated Markdown is uncached and isolated by request", async () => {
  const english = await fetchText("/", {
    headers: { Accept: "text/markdown", "Accept-Language": "en-US" }
  })
  const portuguese = await fetchText("/", {
    headers: { Accept: "text/markdown", "Accept-Language": "pt-BR" }
  })

  assert.match(english.body, /> Senior Software Engineer/)
  assert.match(portuguese.body, /> Desenvolvedor de Software Sênior/)
  assert.equal(english.response.headers.get("cache-control"), "no-store")
  assert.equal(portuguese.response.headers.get("cache-control"), "no-store")
})

test("Vercel telemetry endpoints bypass locale and content routing", async () => {
  const response = await fetch(`${origin}/_vercel/insights/view`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  })

  assert.equal(response.headers.get("set-cookie"), null)
  assert.equal(response.headers.get("x-middleware-rewrite"), null)
})

test("unknown paths return agent-friendly 404 responses without redirects", async () => {
  const pathname = "/ora-agent-readiness-probe-404"
  const html = await fetchText(pathname, { redirect: "manual" })
  assert.equal(html.response.status, 404)
  assertHtmlHeaders(html.response)
  assert.match(html.body, /href="\/sitemap\.xml"/)
  assert.match(html.body, /href="\/llms\.txt"/)

  const markdown = await fetchText(pathname, {
    redirect: "manual",
    headers: { Accept: "text/markdown" }
  })
  assert.equal(markdown.response.status, 404)
  assertNegotiatedHeaders(markdown.response, /^text\/markdown;\s*charset=utf-8$/i)
  assert.match(markdown.body, /\[Sitemap\]\(\/sitemap\.xml\)/)
  assert.match(markdown.body, /\[Agent instructions\]\(\/llms\.txt\)/)
})

test("explicit and nested missing routes use the recovery 404", async () => {
  for (const pathname of [
    "/en-US/404",
    "/en-US/blog/does-not-exist",
    "/en-US/projects/does-not-exist",
    "/projects/does-not-exist"
  ]) {
    const { response, body } = await fetchText(pathname, { redirect: "manual" })
    assert.equal(response.status, 404, pathname)
    assertHtmlHeaders(response)
    assert.match(mainHtml(body), /href="\/sitemap\.xml"/, pathname)
    assert.match(mainHtml(body), /href="\/llms\.txt"/, pathname)
  }

  const unacceptable = await fetchText("/en-US/projects/does-not-exist", {
    redirect: "manual",
    headers: { Accept: "application/pdf" }
  })
  assert.equal(unacceptable.response.status, 404)
  assert.match(mainHtml(unacceptable.body), /href="\/sitemap\.xml"/)
})

test("localized trust pages have substantive HTML and Markdown", async () => {
  for (const locale of locales) {
    for (const trustPath of trustPaths) {
      const pathname = `/${locale}/${trustPath}`
      const html = await fetchText(pathname)
      assert.equal(html.response.status, 200, pathname)
      assertHtmlHeaders(html.response)
      assert.match(mainHtml(html.body), /<h1\b/i)
      assert.ok(
        visibleText(mainHtml(html.body)).length >= 500,
        `${pathname} should exceed 500 characters`
      )

      const markdown = await fetchText(pathname, { headers: { Accept: "text/markdown" } })
      assert.equal(markdown.response.status, 200, `${pathname} Markdown`)
      assertNegotiatedHeaders(markdown.response, /^text\/markdown;\s*charset=utf-8$/i)
      assert.match(markdown.body, /^# /)
      assert.ok(
        visibleText(markdown.body).length >= 500,
        `${pathname} Markdown should be substantive`
      )
    }
  }
})

test("Person JSON-LD exposes a complete localized identity", async () => {
  for (const locale of locales) {
    const { body } = await fetchText(`/${locale}`)
    const source = body.match(
      /<script id="person-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/
    )?.[1]
    assert.ok(source, `${locale} should render Person JSON-LD`)

    const person = JSON.parse(source)
    assert.equal(person["@type"], "Person")
    assert.equal(person.name, "Cleisson de Oliveira Moura")
    assert.ok(person.description.length >= 50)
    assert.equal(person.url, `https://www.cleisson.com/${locale}`)
    assert.deepEqual(person.sameAs.slice(0, 2), [
      "https://www.linkedin.com/in/cleissonom",
      "https://github.com/cleissonom/"
    ])
  }
})

test("llms.txt follows the published file-list format and gives concrete usage guidance", async () => {
  const { response, body } = await fetchText("/llms.txt")
  assert.equal(response.status, 200)
  assert.match(response.headers.get("content-type") ?? "", /^text\/plain\b/i)
  assert.match(body, /^# Cleisson de Oliveira Moura\n\n> .+\n/)
  assert.match(body, /\n## When to use this site\n\n(?:- \[[^\]]+\]\(https:\/\/[^)]+\): .+\n)+/)
  assert.match(body, /`Accept: text\/markdown`/)
  assert.match(body, /https:\/\/www\.cleisson\.com\/en-US\/about/)
  assert.match(body, /https:\/\/www\.cleisson\.com\/en-US\/contact/)
  assert.match(body, /https:\/\/www\.cleisson\.com\/en-US\/privacy/)
  assert.match(body, /https:\/\/www\.cleisson\.com\/sitemap\.xml/)
})

test("sitemap, robots, feeds, and manifest remain machine-readable", async () => {
  const sitemap = await fetchText("/sitemap.xml")
  assert.equal(sitemap.response.status, 200)
  assert.match(sitemap.response.headers.get("content-type") ?? "", /xml/i)
  for (const locale of locales) {
    for (const trustPath of trustPaths) {
      assert.match(sitemap.body, new RegExp(`https://www\\.cleisson\\.com/${locale}/${trustPath}`))
    }
  }

  const locations = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  assert.ok(locations.length > 0, "sitemap should list canonical pages")
  for (const location of locations) {
    const pathname = new URL(location).pathname
    const html = await fetchText(pathname, { headers: { Accept: "text/html" } })
    assert.equal(html.response.status, 200, `${pathname} HTML`)
    assertHtmlHeaders(html.response)

    const markdown = await fetchText(pathname, { headers: { Accept: "text/markdown" } })
    assert.equal(markdown.response.status, 200, `${pathname} Markdown`)
    assertNegotiatedHeaders(markdown.response, /^text\/markdown;\s*charset=utf-8$/i)
  }

  const robots = await fetchText("/robots.txt")
  assert.equal(robots.response.status, 200)
  assert.match(robots.body, /Sitemap: https:\/\/www\.cleisson\.com\/sitemap\.xml/)

  for (const endpoint of ["/rss.xml", "/atom.xml", "/feed.json", "/manifest.webmanifest"]) {
    const result = await fetchText(endpoint)
    assert.equal(result.response.status, 200, endpoint)
    assert.ok(result.body.length > 100, `${endpoint} should have content`)
  }
})

test("localized resume endpoints serve the supplied PDFs", async () => {
  const { createHash } = await import("node:crypto")

  for (const locale of locales) {
    const downloadPath = `/downloads/resume.${locale}.pdf`
    const html = await fetchText(`/${locale}/resume`)
    assert.equal(html.response.status, 200, `${locale} resume HTML`)
    assertHtmlHeaders(html.response)
    assert.match(mainHtml(html.body), new RegExp(`href="${downloadPath.replaceAll(".", "\\.")}"`))

    const markdown = await fetchText(`/${locale}/resume`, {
      headers: { Accept: "text/markdown" }
    })
    assert.equal(markdown.response.status, 200, `${locale} resume Markdown`)
    assertNegotiatedHeaders(markdown.response, /^text\/markdown;\s*charset=utf-8$/i)
    assert.match(markdown.body, new RegExp(`\\(${downloadPath.replaceAll(".", "\\.")}\\)`))

    const response = await fetch(`${origin}${downloadPath}`)
    assert.equal(response.status, 200)
    assert.match(response.headers.get("content-type") ?? "", /^application\/pdf\b/i)
    const digest = createHash("sha256")
      .update(Buffer.from(await response.arrayBuffer()))
      .digest("hex")
    assert.equal(digest, expectedResumeSha256[locale])
  }
})
