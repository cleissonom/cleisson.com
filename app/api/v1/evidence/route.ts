import { findProfessionalEvidence } from "@/lib/professional-evidence"
import {
  apiNoStoreJson,
  apiOptions,
  methodNotAllowed,
  parseLimit,
  parseLocale,
  parseTopics,
  safeApiResponse
} from "@/lib/public-api"

export function GET(request: Request): Promise<Response> {
  return safeApiResponse(request, () => {
    const topics = parseTopics(request)
    if (!topics.ok) return topics.response
    const locale = parseLocale(request)
    if (!locale.ok) return locale.response
    const limit = parseLimit(request)
    if (!limit.ok) return limit.response
    return apiNoStoreJson(findProfessionalEvidence(topics.value, locale.value, limit.value))
  })
}

export { methodNotAllowed as DELETE, methodNotAllowed as PATCH, methodNotAllowed as POST }
export { methodNotAllowed as PUT }
export { apiOptions as OPTIONS }
