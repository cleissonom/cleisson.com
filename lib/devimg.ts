import { DEVIMG_MANIFEST as DEVIMG_BLOG_MANIFEST } from "@/lib/devimg-blog.generated"
import { DEVIMG_MANIFEST as DEVIMG_PROJECTS_MANIFEST } from "@/lib/devimg-projects.generated"
import { DEVIMG_MANIFEST as DEVIMG_SEO_MANIFEST } from "@/lib/devimg-seo.generated"

type ImageFit = "cover" | "contain"

type ImageVariant = {
  src: string
  width: number
  height: number
  fit: ImageFit
}

type DevimgVariant = {
  src: string
  width: number
  height: number
  fit: string
  preset: string
  format: string
}

type DevimgManifest = {
  sources: readonly {
    source_path: string
    variants: readonly DevimgVariant[]
  }[]
}

type ProjectPreset = "project-card" | "project-banner"
type BlogPreset = "blog-card" | "blog-article" | "blog-social"

const PROJECT_VARIANT_DEFAULTS: Record<ProjectPreset, { width: number; height: number }> = {
  "project-card": {
    width: 640,
    height: 360
  },
  "project-banner": {
    width: 1200,
    height: 630
  }
}

const BLOG_VARIANT_DEFAULTS: Record<BlogPreset, { width: number; height: number }> = {
  "blog-card": {
    width: 640,
    height: 392
  },
  "blog-article": {
    width: 1200,
    height: 735
  },
  "blog-social": {
    width: 1200,
    height: 735
  }
}

const PROJECT_VARIANT_FORMAT = "jpeg"
const BLOG_VARIANT_FORMAT = "jpeg"
const SEO_VARIANT_FORMAT = "jpeg"
const SEO_VARIANT_PRESET = "seo-open-graph"
const SEO_VARIANT_DEFAULT = {
  width: 1200,
  height: 630
}

export function projectCardImageVariant(src: string): ImageVariant {
  return projectImageVariant(src, "project-card")
}

export function projectBannerImageVariant(src: string): ImageVariant {
  return projectImageVariant(src, "project-banner")
}

export function projectCardImage(src: string): string {
  return projectCardImageVariant(src).src
}

export function projectBannerImage(src: string): string {
  return projectBannerImageVariant(src).src
}

export function blogCardImageVariant(src: string): ImageVariant {
  return blogImageVariant(src, "blog-card")
}

export function blogArticleImageVariant(src: string): ImageVariant {
  return blogImageVariant(src, "blog-article")
}

export function seoImageVariant(src: string): Pick<ImageVariant, "src" | "width" | "height"> {
  const variant =
    findImageVariant(DEVIMG_SEO_MANIFEST, src, SEO_VARIANT_PRESET, SEO_VARIANT_FORMAT) ??
    findImageVariant(DEVIMG_BLOG_MANIFEST, src, "blog-social", BLOG_VARIANT_FORMAT)

  return {
    src: variant?.src ?? src,
    width: variant?.width ?? SEO_VARIANT_DEFAULT.width,
    height: variant?.height ?? SEO_VARIANT_DEFAULT.height
  }
}

function projectImageVariant(src: string, preset: ProjectPreset): ImageVariant {
  const variant = findImageVariant(DEVIMG_PROJECTS_MANIFEST, src, preset, PROJECT_VARIANT_FORMAT)
  const fallback = PROJECT_VARIANT_DEFAULTS[preset]

  return {
    src: variant?.src ?? src,
    width: variant?.width ?? fallback.width,
    height: variant?.height ?? fallback.height,
    fit: imageFit(variant?.fit)
  }
}

function blogImageVariant(src: string, preset: BlogPreset): ImageVariant {
  const variant = findImageVariant(DEVIMG_BLOG_MANIFEST, src, preset, BLOG_VARIANT_FORMAT)
  const fallback = BLOG_VARIANT_DEFAULTS[preset]

  return {
    src: variant?.src ?? src,
    width: variant?.width ?? fallback.width,
    height: variant?.height ?? fallback.height,
    fit: imageFit(variant?.fit)
  }
}

function findImageVariant(
  manifest: DevimgManifest,
  src: string,
  preset: string,
  format: string
): DevimgVariant | undefined {
  const sourcePath = projectSourcePath(src)
  const source = manifest.sources.find((source) => source.source_path === sourcePath)

  return source?.variants.find((variant) => variant.preset === preset && variant.format === format)
}

function projectSourcePath(src: string): string {
  return src.startsWith("/") ? `public${src}` : src
}

function imageFit(fit: string | undefined): ImageFit {
  return fit === "contain" ? "contain" : "cover"
}
