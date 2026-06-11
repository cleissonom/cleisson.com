import { notFound } from "next/navigation"
import type { ComponentPropsWithoutRef } from "react"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import {
  ButtonLink,
  Chip,
  ChipRow,
  Eyebrow,
  InlineLink,
  Lead,
  MutedText,
  PageHeader,
  SectionStack,
  Surface
} from "@/components/design-system"
import { JsonLd } from "@/components/json-ld"
import { getDictionary } from "@/data/i18n"
import { siteIdentity } from "@/data/profile"
import { getAllPostSlugs, getPostBySlug } from "@/lib/content"
import { blogArticleImageVariant } from "@/lib/devimg"
import { formatContentDate } from "@/lib/display-date"
import { LOCALES, isLocale } from "@/lib/i18n"
import { SEO_IMAGE_PATHS, absoluteUrl, buildPageTitle, createMetadata } from "@/lib/metadata"
import { blogPostJsonLd, breadcrumbJsonLd } from "@/lib/schema"

function MarkdownImage({ src = "", alt = "" }: ComponentPropsWithoutRef<"img">) {
  const imageSrc = typeof src === "string" ? src : ""

  if (!imageSrc) {
    return null
  }

  const image = blogArticleImageVariant(imageSrc)

  return (
    <Image
      className={`markdown-image${image.fit === "contain" ? " markdown-image-contain" : ""}`}
      src={image.src}
      alt={alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      unoptimized
    />
  )
}

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    getAllPostSlugs(locale).map((slug) => ({
      locale,
      slug
    }))
  )
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const dictionary = getDictionary(locale)
  const post = getPostBySlug(locale, slug)
  if (!post) {
    return createMetadata(locale, {
      title: buildPageTitle(dictionary.pages.blog.notFoundTitle),
      description: dictionary.pages.blog.notFoundDescription,
      path: "/blog",
      imagePath: SEO_IMAGE_PATHS.blog,
      imageAlt: `${dictionary.pages.blog.metadataTitle} social preview`
    })
  }

  return createMetadata(locale, {
    title: buildPageTitle(post.title),
    description: post.summary,
    path: `/blog/${post.slug}`,
    imagePath: post.coverImage ?? SEO_IMAGE_PATHS.blog,
    imageAlt: post.coverAlt ?? `${post.title} social preview`,
    openGraphType: "article",
    keywords: post.tags,
    authors: [siteIdentity.name],
    publishedTime: post.date,
    modifiedTime: post.updatedAt ?? post.date,
    canonicalUrl: post.canonicalUrl
  })
}

export default async function BlogDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const ui = dictionary.ui
  const post = getPostBySlug(locale, slug)

  if (!post) {
    notFound()
  }

  const breadcrumbs = breadcrumbJsonLd([
    { name: ui.nav.home, url: absoluteUrl(`/${locale}`) },
    { name: ui.nav.blog, url: absoluteUrl(`/${locale}/blog`) },
    { name: post.title, url: absoluteUrl(`/${locale}/blog/${post.slug}`) }
  ])

  return (
    <SectionStack as="article">
      <JsonLd id="blog-post-jsonld" data={blogPostJsonLd(locale, post)} />
      <JsonLd id="blog-post-breadcrumb-jsonld" data={breadcrumbs} />

      <Surface as="section" className="article-hero" aria-labelledby="blog-post-title">
        <PageHeader className="article-hero-copy">
          <Eyebrow>{ui.nav.blog}</Eyebrow>
          <h1 id="blog-post-title">{post.title}</h1>
          <Lead>{post.summary}</Lead>
        </PageHeader>

        <div className="article-hero-aside">
          <div className="article-meta-row">
            <MutedText>
              {ui.labels.published}: {formatContentDate(post.date, locale)}
            </MutedText>
            {post.updatedAt ? (
              <MutedText>
                {ui.labels.updated}: {formatContentDate(post.updatedAt, locale)}
              </MutedText>
            ) : null}
            <MutedText>
              {post.readingTimeMinutes} {dictionary.snippets.readingMinutesShort}
            </MutedText>
          </div>

          <ChipRow>
            {post.tags.map((tag) => (
              <Chip key={`${post.slug}-${tag}`}>{tag}</Chip>
            ))}
          </ChipRow>

          {post.pdfUrl ? (
            <div className="article-actions">
              <ButtonLink href={post.pdfUrl} variant="secondary" download>
                {dictionary.pages.blog.downloadPdfLabel}
              </ButtonLink>
            </div>
          ) : null}
        </div>
      </Surface>

      <Surface className="markdown content-prose article-prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ img: MarkdownImage }}>
          {post.body}
        </ReactMarkdown>
      </Surface>

      <nav className="detail-footer-nav" aria-label={ui.labels.backToBlog}>
        <InlineLink href={`/${locale}/blog`}>{ui.labels.backToBlog}</InlineLink>
      </nav>
    </SectionStack>
  )
}
