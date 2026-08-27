import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import net from "node:net"
import path from "node:path"
import { after, before, test } from "node:test"

const root = process.cwd()
const expectedPaths = {
  "/api/v1/profile": "get_profile",
  "/api/v1/evidence": "find_evidence",
  "/api/v1/projects/{slug}": "get_project"
}

let origin
let server
let serverOutput = ""

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

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Next.js exited early:\n${serverOutput}`)
    try {
      if ((await fetch(origin)).ok) return
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

async function fetchJson(pathname, options) {
  const response = await fetch(`${origin}${pathname}`, options)
  return { response, body: await response.json() }
}

function assertServiceDescription(response) {
  assert.match(response.headers.get("link") ?? "", /<\/openapi\.json>; rel="service-desc"/)
  assert.match(response.headers.get("link") ?? "", /<\/en-US\/mcp>; rel="service-doc"/)
}

function assertProblem(result, status, code) {
  assert.equal(result.response.status, status)
  assert.match(result.response.headers.get("content-type") ?? "", /^application\/problem\+json\b/i)
  assert.equal(result.response.headers.get("cache-control"), "no-store")
  assertServiceDescription(result.response)
  assert.equal(result.body.status, status)
  assert.equal(result.body.code, code)
  assert.equal(result.body.instance, new URL(result.response.url).pathname)
  for (const field of ["type", "title", "detail", "message", "instance", "resolution"]) {
    assert.equal(typeof result.body[field], "string", `${field} should be a string`)
    assert.ok(result.body[field].length > 0, `${field} should not be empty`)
  }
  assert.equal(result.body.type, "about:blank")
  assert.equal(
    result.body.title,
    { 400: "Bad Request", 404: "Not Found", 405: "Method Not Allowed" }[status]
  )
}

function resolveLocalReference(document, value) {
  if (!value?.$ref) return value
  assert.match(value.$ref, /^#\//)
  return value.$ref
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((current, part) => current?.[part], document)
}

function assertLocalReferences(document, value = document) {
  if (Array.isArray(value)) {
    for (const item of value) assertLocalReferences(document, item)
    return
  }
  if (!value || typeof value !== "object") return
  if (value.$ref) assert.ok(resolveLocalReference(document, value), `${value.$ref} should resolve`)
  for (const child of Object.values(value)) assertLocalReferences(document, child)
}

function assertSchemaObject(document, schema, value, label) {
  assert.ok(
    value && typeof value === "object" && !Array.isArray(value),
    `${label} must be an object`
  )
  for (const property of schema.required ?? []) {
    assert.ok(Object.hasOwn(value, property), `${label}.${property} is required`)
  }
  if (schema.additionalProperties === false) {
    for (const property of Object.keys(value)) {
      assert.ok(schema.properties?.[property], `${label}.${property} is not published`)
    }
  }
  for (const [property, propertyValue] of Object.entries(value)) {
    assertSchemaValue(
      document,
      schema.properties?.[property],
      propertyValue,
      `${label}.${property}`
    )
  }
}

function assertSchemaValue(document, schemaValue, value, label) {
  const schema = resolveLocalReference(document, schemaValue)
  assert.ok(schema, `${label} needs a published schema`)
  if (schema.anyOf) {
    const matches = schema.anyOf.some((option) => {
      try {
        assertSchemaValue(document, option, value, label)
        return true
      } catch {
        return false
      }
    })
    assert.ok(matches, `${label} must match one published alternative`)
    return
  }
  if (schema.const !== undefined) assert.deepEqual(value, schema.const, `${label} must match const`)
  if (schema.enum) assert.ok(schema.enum.includes(value), `${label} must match enum`)
  if (schema.type === "object") return assertSchemaObject(document, schema, value, label)
  if (schema.type === "array") {
    assert.ok(Array.isArray(value), `${label} must be an array`)
    for (const [index, item] of value.entries()) {
      assertSchemaValue(document, schema.items, item, `${label}[${index}]`)
    }
    return
  }
  if (schema.type === "integer")
    return assert.ok(Number.isInteger(value), `${label} must be an integer`)
  if (schema.type === "null") return assert.equal(value, null, `${label} must be null`)
  assert.equal(typeof value, schema.type, `${label} must be a ${schema.type}`)
}

function assertPublishedSchema(document, name, value) {
  assertSchemaValue(document, document.components.schemas[name], value, name)
}

before(
  async () => {
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
    const record = (chunk) => {
      serverOutput = `${serverOutput}${chunk}`.slice(-20_000)
    }
    server.stdout.on("data", record)
    server.stderr.on("data", record)
    await waitForServer()
  },
  { timeout: 60_000 }
)

after(stopServer)

test("OpenAPI publishes a complete function-calling-friendly contract", async () => {
  const { response, body: specification } = await fetchJson("/openapi.json")

  assert.equal(response.status, 200)
  assert.match(response.headers.get("content-type") ?? "", /^application\/json\b/i)
  assert.equal(specification.openapi, "3.1.2")
  assert.deepEqual(specification.security, [])
  assert.equal(specification.servers[0]?.url, "https://www.cleisson.com")
  assert.equal(specification.externalDocs?.url, "https://www.cleisson.com/en-US/mcp")
  assert.ok(specification.info?.title)
  assert.ok(specification.info?.version)
  assert.deepEqual(Object.keys(specification.paths), Object.keys(expectedPaths))
  assertLocalReferences(specification)

  const operationIds = []
  for (const [pathname, expectedOperationId] of Object.entries(expectedPaths)) {
    const operation = specification.paths[pathname]?.get
    assert.equal(operation?.operationId, expectedOperationId)
    assert.ok(operation?.summary)
    assert.ok(operation?.description)
    operationIds.push(operation.operationId)

    for (const parameterValue of operation.parameters ?? []) {
      const parameter = resolveLocalReference(specification, parameterValue)
      assert.ok(parameter.name)
      assert.ok(parameter.in)
      assert.ok(parameter.description)
      assert.ok(parameter.schema)
      if (parameter.in === "path") assert.equal(parameter.required, true)
      if (parameter.name === "topics") assert.ok(parameter.schema.items.pattern)
    }

    const successResponse = resolveLocalReference(specification, operation.responses["200"])
    assert.ok(successResponse?.description)
    assert.ok(successResponse?.content?.["application/json"]?.schema)
    for (const [status, responseValue] of Object.entries(operation.responses)) {
      const responseObject = resolveLocalReference(specification, responseValue)
      assert.ok(responseObject.description, `${pathname} ${status} needs a description`)
      if (status === "200") continue
      assert.equal(
        responseObject.content?.["application/problem+json"]?.schema?.$ref,
        "#/components/schemas/ProblemDetails"
      )
    }
  }

  assert.equal(new Set(operationIds).size, operationIds.length)
  const problem = specification.components.schemas.ProblemDetails
  assert.equal(problem.additionalProperties, false)
  assert.equal(problem.properties.type.const, "about:blank")
  for (const field of [
    "type",
    "title",
    "status",
    "detail",
    "message",
    "instance",
    "code",
    "resolution"
  ]) {
    assert.ok(problem.required.includes(field), `ProblemDetails should require ${field}`)
    assert.ok(problem.properties[field]?.description)
  }
})

test("all documented REST operations are reachable and source-linked", async () => {
  const specification = await fetch(`${origin}/openapi.json`).then((response) => response.json())
  const profile = await fetchJson("/api/v1/profile?locale=pt-BR")
  assert.equal(profile.response.status, 200)
  assert.match(profile.response.headers.get("content-type") ?? "", /^application\/json\b/i)
  assert.match(profile.response.headers.get("cache-control") ?? "", /^public, /)
  assertServiceDescription(profile.response)
  assert.equal(profile.body.locale, "pt-BR")
  assert.equal(profile.body.name, "Cleisson de Oliveira Moura")
  assert.match(profile.body.sourceUrl, /\/pt-BR\/about$/)
  assertPublishedSchema(specification, "ProfessionalProfile", profile.body)

  const search = new URLSearchParams({ locale: "en-US", limitPerTopic: "2" })
  search.append("topics", "Kubernetes")
  search.append("topics", "GraphQL")
  const evidence = await fetchJson(`/api/v1/evidence?${search}`)
  assert.equal(evidence.response.status, 200)
  assert.equal(evidence.response.headers.get("cache-control"), "no-store")
  assert.equal(evidence.body.topics.length, 2)
  assert.equal(evidence.body.topics[0].status, "direct")
  assert.equal(evidence.body.topics[1].status, "no_public_evidence")
  assert.ok(evidence.body.topics[0].evidence.every((item) => item.sourceUrl.startsWith("https://")))
  assertPublishedSchema(specification, "EvidenceSearchResult", evidence.body)

  const project = await fetchJson("/api/v1/projects/devimg?locale=en-US")
  assert.equal(project.response.status, 200)
  assert.equal(project.body.found, true)
  assert.equal(project.body.project.slug, "devimg")
  assert.match(project.body.sourceUrl, /\/en-US\/projects\/devimg$/)
  assertPublishedSchema(specification, "ProjectResult", project.body)

  const jiraTogglProject = await fetchJson("/api/v1/projects/jira-toggl-quickstart?locale=pt-BR")
  assert.equal(jiraTogglProject.response.status, 200)
  assert.equal(jiraTogglProject.body.found, true)
  assert.equal(jiraTogglProject.body.project.slug, "jira-toggl-quickstart")
  assert.equal(jiraTogglProject.body.project.stage, "live")
  assert.match(jiraTogglProject.body.sourceUrl, /\/pt-BR\/projects\/jira-toggl-quickstart$/)
  assert.ok(
    jiraTogglProject.body.project.artifactUrls.some((url) =>
      url.startsWith("https://chromewebstore.google.com/")
    )
  )
  assertPublishedSchema(specification, "ProjectResult", jiraTogglProject.body)

  const boundaryTopics = new URLSearchParams({ topics: "K".repeat(80) })
  for (let index = 0; index < 9; index += 1) boundaryTopics.append("topics", `topic-${index}`)
  const boundaryEvidence = await fetchJson(`/api/v1/evidence?${boundaryTopics}`)
  assert.equal(boundaryEvidence.response.status, 200)
  assert.equal(boundaryEvidence.body.topics.length, 10)
})

test("every REST failure is actionable RFC 9457 JSON", async () => {
  const tooManyTopics = new URLSearchParams()
  for (let index = 0; index < 11; index += 1) tooManyTopics.append("topics", `topic-${index}`)
  const cases = [
    ["/api/v1/profile?locale=fr-FR", 400, "invalid_locale"],
    ["/api/v1/evidence", 400, "invalid_topics"],
    ["/api/v1/evidence?topics=---", 400, "invalid_topics"],
    [`/api/v1/evidence?topics=${"K".repeat(81)}`, 400, "invalid_topics"],
    [`/api/v1/evidence?topics=${encodeURIComponent(` ${"K".repeat(79)} `)}`, 400, "invalid_topics"],
    [`/api/v1/evidence?${tooManyTopics}`, 400, "invalid_topics"],
    ["/api/v1/evidence?topics=Kubernetes&limitPerTopic=6", 400, "invalid_limit"],
    ["/api/v1/projects/Not_Valid", 400, "invalid_project_slug"],
    ["/api/v1/projects/%20devimg%20", 400, "invalid_project_slug"],
    ["/api/v1/projects/not-a-project", 404, "project_not_found"],
    ["/api/not-a-real-route", 404, "route_not_found"]
  ]

  for (const [pathname, status, code] of cases) {
    assertProblem(await fetchJson(pathname, { headers: { Accept: "text/html" } }), status, code)
  }

  const unpublished = await fetchJson("/api/v1/projects/accesstrace")
  assertProblem(unpublished, 404, "project_not_found")
  assert.doesNotMatch(JSON.stringify(unpublished.body), /unavailable|draft|private/i)

  const untrustedQuery = await fetchJson("/api/not-a-real-route?token=do-not-reflect")
  assertProblem(untrustedQuery, 404, "route_not_found")
  assert.doesNotMatch(JSON.stringify(untrustedQuery.body), /do-not-reflect/)

  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    const unsupported = await fetchJson("/api/v1/profile", { method })
    assertProblem(unsupported, 405, "method_not_allowed")
    assert.equal(unsupported.response.headers.get("allow"), "GET, HEAD, OPTIONS")
  }

  const options = await fetch(`${origin}/api/v1/profile`, { method: "OPTIONS" })
  assert.equal(options.status, 204)
  assert.equal(options.headers.get("allow"), "GET, HEAD, OPTIONS")
  assert.equal(options.headers.get("cache-control"), "no-store")
  assertServiceDescription(options)
  assert.equal(await options.text(), "")

  const unknownOptions = await fetchJson("/api/not-a-real-route", { method: "OPTIONS" })
  assertProblem(unknownOptions, 404, "route_not_found")
})
