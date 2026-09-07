import { notFound } from "next/navigation"

import { Grid, Lead, PageHeader, SectionStack, Surface } from "@/components/design-system"
import { JsonLd } from "@/components/json-ld"
import { PostCard } from "@/components/post-card"
import { getDictionary } from "@/data/i18n"
import { getAllPosts } from "@/lib/content"
import { isLocale } from "@/lib/i18n"
import { SEO_IMAGE_PATHS, absoluteUrl, buildPageTitle, createMetadata } from "@/lib/metadata"
import { breadcrumbJsonLd } from "@/lib/schema"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const dictionary = getDictionary(locale)

  return createMetadata(locale, {
    title: buildPageTitle(dictionary.pages.blog.metadataTitle),
    description: dictionary.pages.blog.metadataDescription,
    path: "/blog",
    imagePath: SEO_IMAGE_PATHS.blog,
    imageAlt: dictionary.pages.blog.metadataTitle
  })
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const ui = dictionary.ui
  const posts = getAllPosts(locale)

  const breadcrumbs = breadcrumbJsonLd([
    { name: ui.nav.home, url: absoluteUrl(`/${locale}`) },
    { name: ui.nav.blog, url: absoluteUrl(`/${locale}/blog`) }
  ])

  return (
    <SectionStack>
      <JsonLd id="blog-breadcrumb-jsonld" data={breadcrumbs} />

      <Surface as="section" className="page-overview" aria-labelledby="blog-title">
        <PageHeader className="page-overview-copy">
          <h1 id="blog-title">{ui.sections.blog}</h1>
          <Lead>{dictionary.pages.blog.lead}</Lead>
        </PageHeader>
      </Surface>

      <Grid className="writing-grid">
        {posts.map((post) => (
          <PostCard
            key={post.slug}
            post={post}
            locale={locale}
            readMoreLabel={ui.labels.readMore}
            readMoreAboutPrefix={dictionary.snippets.readMoreAboutPrefix}
            readingMinutesLabel={dictionary.snippets.readingMinutesShort}
            headingLevel={2}
          />
        ))}
      </Grid>
    </SectionStack>
  )
}
