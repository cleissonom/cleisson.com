import { notFound } from "next/navigation"

import { Lead, PageHeader, SectionStack, Surface } from "@/components/design-system"
import { GameCard } from "@/components/games/game-card"
import { JsonLd } from "@/components/json-ld"
import { getDictionary } from "@/data/i18n"
import { getAllGames } from "@/lib/games"
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
    title: buildPageTitle(dictionary.pages.games.metadataTitle),
    description: dictionary.pages.games.metadataDescription,
    path: "/games",
    imagePath: SEO_IMAGE_PATHS.projects,
    imageAlt: dictionary.pages.games.metadataTitle
  })
}

export default async function GamesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const ui = dictionary.ui
  const games = getAllGames(locale)

  const breadcrumbs = breadcrumbJsonLd([
    { name: ui.nav.home, url: absoluteUrl(`/${locale}`) },
    { name: ui.nav.games, url: absoluteUrl(`/${locale}/games`) }
  ])

  return (
    <SectionStack>
      <JsonLd id="games-breadcrumb-jsonld" data={breadcrumbs} />

      <Surface as="section" className="page-overview" aria-labelledby="games-title">
        <PageHeader className="page-overview-copy">
          <p className="eyebrow">{ui.nav.games}</p>
          <h1 id="games-title">{dictionary.pages.games.metadataTitle}</h1>
          <Lead>{dictionary.pages.games.lead}</Lead>
        </PageHeader>
      </Surface>

      <div className="grid games-grid">
        {games.map((game) => (
          <GameCard
            key={game.slug}
            game={game}
            locale={locale}
            readMoreAboutPrefix={dictionary.snippets.readMoreAboutPrefix}
            playLabel={dictionary.pages.games.playLabel}
          />
        ))}
      </div>
    </SectionStack>
  )
}
