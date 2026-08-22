import type { BlogEntry, ProjectEntry } from "@/lib/content"
import { seoImageVariant } from "@/lib/devimg"
import type { Locale } from "@/lib/i18n"
import { SEO_IMAGE_PATHS, absoluteUrl } from "@/lib/metadata"
import {
  SITE_IDENTITY_LINKS,
  SITE_LINKS,
  SITE_NAME,
  SITE_SHORT_TITLE,
  siteEmailAddress
} from "@/lib/site"

export function personJsonLd(locale: Locale, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/#person"),
    name: SITE_NAME,
    description,
    jobTitle: SITE_SHORT_TITLE,
    url: absoluteUrl(`/${locale}`),
    image: absoluteUrl("/about/profile.webp"),
    sameAs: [...SITE_IDENTITY_LINKS, SITE_LINKS.website],
    email: siteEmailAddress(locale)
  }
}

export function projectJsonLd(locale: Locale, project: ProjectEntry) {
  const image = project.coverImage
    ? absoluteUrl(project.coverImage)
    : absoluteUrl(seoImageVariant(SEO_IMAGE_PATHS.projects).src)

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.summary,
    applicationCategory: "DeveloperApplication",
    inLanguage: locale,
    keywords: project.tags.join(", "),
    creator: {
      "@type": "Person",
      name: SITE_NAME
    },
    image,
    mainEntityOfPage: absoluteUrl(`/${locale}/projects/${project.slug}`),
    url: absoluteUrl(`/${locale}/projects/${project.slug}`)
  }
}

export function blogPostJsonLd(locale: Locale, post: BlogEntry) {
  const image = absoluteUrl(seoImageVariant(post.coverImage ?? SEO_IMAGE_PATHS.blog).src)

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    inLanguage: locale,
    author: {
      "@type": "Person",
      name: SITE_NAME
    },
    image,
    mainEntityOfPage: absoluteUrl(`/${locale}/blog/${post.slug}`),
    url: absoluteUrl(`/${locale}/blog/${post.slug}`)
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}
