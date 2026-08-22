import { getAgentContent } from "@/lib/agent-content"
import { appendNegotiationVary } from "@/lib/content-negotiation"

type RouteContext = {
  params: Promise<{ path?: string[] }>
}

function responseHeaders(): Headers {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": "text/markdown; charset=utf-8",
    Link: '</llms.txt>; rel="describedby"'
  })
  appendNegotiationVary(headers)
  return headers
}

async function markdownResponse(context: RouteContext, includeBody: boolean): Promise<Response> {
  const { path = [] } = await context.params
  const content = getAgentContent(path)

  return new Response(includeBody ? content.body : null, {
    status: content.status,
    headers: responseHeaders()
  })
}

export function GET(_request: Request, context: RouteContext) {
  return markdownResponse(context, true)
}

export function HEAD(_request: Request, context: RouteContext) {
  return markdownResponse(context, false)
}
