import fs from "node:fs"
import matter from "gray-matter"
import { z } from "zod"

import { LOCALES, type Locale } from "./i18n.ts"

const allowedExternalProtocols = new Set(["http:", "https:"])

export const safeExternalUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    try {
      return allowedExternalProtocols.has(new URL(value).protocol)
    } catch {
      return false
    }
  }, "URL must use http or https protocol")

const safePublicPathSchema = z
  .string()
  .startsWith("/")
  .refine((value) => !value.startsWith("//"), "Path must be an internal public path")
  .refine((value) => !value.includes("\\"), "Path must use URL separators")
  .refine((value) => !value.split(/[?#]/, 1)[0]?.includes(".."), "Path cannot traverse directories")

export const dateStringSchema = z.union([z.string().min(1), z.date()]).transform((value) => {
  if (typeof value === "string") {
    return value
  }

  return value.toISOString()
})

const blogFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().min(1),
    summary: z.string().min(1),
    date: dateStringSchema,
    updatedAt: dateStringSchema.optional(),
    tags: z.array(z.string().min(1)).min(1),
    coverImage: safePublicPathSchema.optional(),
    coverAlt: z.string().min(1).optional(),
    pdfUrl: safePublicPathSchema
      .refine((value) => value.endsWith(".pdf"), "PDF URL must end in .pdf")
      .optional(),
    canonicalUrl: safeExternalUrlSchema.optional(),
    lang: z.enum(LOCALES)
  })
  .superRefine((post, context) => {
    if (post.coverImage && !post.coverAlt) {
      context.addIssue({
        code: "custom",
        path: ["coverAlt"],
        message: "Posts with coverImage must include coverAlt"
      })
    }
  })

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>

function parseMarkdownSource(
  rawSource: string,
  filePath: string
): {
  frontmatter: Record<string, unknown>
  body: string
} {
  const source = rawSource.replace(/^\uFEFF/, "")
  const firstLine = source.split(/\r?\n/, 1)[0]?.trim() ?? ""

  // `gray-matter` supports `---js` frontmatter and evaluates it with `eval`.
  // Reject non-YAML frontmatter markers to prevent code execution paths.
  if (firstLine.startsWith("---") && firstLine !== "---") {
    throw new Error(
      `Unsupported frontmatter language in ${filePath}. Only YAML frontmatter is allowed.`
    )
  }

  const { data, content } = matter(source)
  return { frontmatter: data, body: content.trim() }
}

export function readMarkdownFile(filePath: string): {
  frontmatter: Record<string, unknown>
  body: string
} {
  return parseMarkdownSource(fs.readFileSync(filePath, "utf8"), filePath)
}

export function parseBlogSource(
  source: string,
  filePath: string,
  locale: Locale
): BlogFrontmatter & { locale: Locale; body: string } {
  const { frontmatter, body } = parseMarkdownSource(source, filePath)
  const parsed = blogFrontmatterSchema.parse(frontmatter)
  if (parsed.lang !== locale) {
    throw new Error(
      `Locale mismatch in ${filePath}. Expected lang ${locale}, received ${parsed.lang}.`
    )
  }
  return { ...parsed, locale, body }
}

export function readBlogSource(
  filePath: string,
  locale: Locale
): BlogFrontmatter & { locale: Locale; body: string } {
  return parseBlogSource(fs.readFileSync(filePath, "utf8"), filePath, locale)
}
