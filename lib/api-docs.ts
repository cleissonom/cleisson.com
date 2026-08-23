import { MCP_ENDPOINT_URL, SITE_URL } from "@/lib/site"

export const PUBLIC_API_ENDPOINTS = [
  "GET /api/v1/profile?locale=en-US",
  "GET /api/v1/evidence?topics=Kubernetes&topics=AWS&locale=en-US&limitPerTopic=5",
  "GET /api/v1/projects/{slug}?locale=en-US"
] as const

export const REST_EXAMPLES = [
  `curl '${SITE_URL}/api/v1/profile?locale=en-US'`,
  `curl --get '${SITE_URL}/api/v1/evidence' --data-urlencode 'topics=Kubernetes' --data-urlencode 'topics=AWS' --data-urlencode 'locale=en-US'`
] as const

export const PROBLEM_EXAMPLE = JSON.stringify(
  {
    type: "about:blank",
    title: "Bad Request",
    status: 400,
    detail: "The locale query parameter is not supported.",
    instance: "/api/v1/profile",
    code: "invalid_locale",
    message: "The locale query parameter is not supported.",
    resolution: "Use one of: en-US, pt-BR, es-ES."
  },
  null,
  2
)

const discoveryRequest = {
  jsonrpc: "2.0",
  id: "discover-1",
  method: "server/discover",
  params: {
    _meta: {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": { name: "audit", version: "1.0.0" },
      "io.modelcontextprotocol/clientCapabilities": {}
    }
  }
}

export const MCP_DISCOVERY_EXAMPLE = [
  `curl '${MCP_ENDPOINT_URL}'`,
  "  -H 'Content-Type: application/json'",
  "  -H 'Accept: application/json, text/event-stream'",
  "  -H 'MCP-Protocol-Version: 2026-07-28'",
  "  -H 'Mcp-Method: server/discover'",
  `  --data '${JSON.stringify(discoveryRequest)}'`
].join(" \\\n")
