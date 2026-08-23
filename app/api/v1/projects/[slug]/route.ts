import { getPublicProject } from "@/lib/professional-evidence"
import {
  apiJson,
  apiOptions,
  methodNotAllowed,
  parseLocale,
  parseProjectSlug,
  projectNotFound,
  safeApiResponse
} from "@/lib/public-api"

type ProjectRouteContext = { params: Promise<{ slug: string }> }

export function GET(request: Request, context: ProjectRouteContext): Promise<Response> {
  return safeApiResponse(request, async () => {
    const slug = parseProjectSlug(request, (await context.params).slug)
    if (!slug.ok) return slug.response
    const locale = parseLocale(request)
    if (!locale.ok) return locale.response
    const project = getPublicProject(locale.value, slug.value)
    return project.found ? apiJson(project) : projectNotFound(request)
  })
}

export { methodNotAllowed as DELETE, methodNotAllowed as PATCH, methodNotAllowed as POST }
export { methodNotAllowed as PUT }
export { apiOptions as OPTIONS }
