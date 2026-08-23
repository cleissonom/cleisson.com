import { getProfessionalProfile } from "@/lib/professional-evidence"
import {
  apiJson,
  apiOptions,
  methodNotAllowed,
  parseLocale,
  safeApiResponse
} from "@/lib/public-api"

export function GET(request: Request): Promise<Response> {
  return safeApiResponse(request, () => {
    const locale = parseLocale(request)
    if (!locale.ok) return locale.response
    return apiJson(getProfessionalProfile(locale.value))
  })
}

export { methodNotAllowed as DELETE, methodNotAllowed as PATCH, methodNotAllowed as POST }
export { methodNotAllowed as PUT }
export { apiOptions as OPTIONS }
