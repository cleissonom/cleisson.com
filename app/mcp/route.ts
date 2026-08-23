import {
  DELETE,
  OPTIONS as canonicalOptions,
  POST,
  PUT as canonicalMethodNotAllowed
} from "@/app/api/mcp/route"

const ROOT_ALLOW = "OPTIONS, POST"

function methodNotAllowed(request: Request): Response {
  const response = canonicalMethodNotAllowed(request)
  if (response.status === 405) response.headers.set("Allow", ROOT_ALLOW)
  return response
}

export function OPTIONS(request: Request): Response {
  const response = canonicalOptions(request)
  if (response.status === 204) response.headers.set("Allow", ROOT_ALLOW)
  return response
}

export { DELETE, methodNotAllowed as GET, methodNotAllowed as PATCH, POST }
export { methodNotAllowed as PUT }
