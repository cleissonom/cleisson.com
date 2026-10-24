import { notFound } from "next/navigation"

import {
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
import { FallingBlocksGame } from "@/components/games/falling-blocks-game"
import { SudokuGame } from "@/components/games/sudoku-game"
import { JsonLd } from "@/components/json-ld"
import { getDictionary } from "@/data/i18n"
import { getSudokuDictionary } from "@/data/sudoku"
import { getAllGames, getGameBySlug } from "@/lib/games"
import { LOCALES, isLocale } from "@/lib/i18n"
import { SEO_IMAGE_PATHS, absoluteUrl, buildPageTitle, createMetadata } from "@/lib/metadata"
import { breadcrumbJsonLd } from "@/lib/schema"

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    getAllGames(locale).map((game) => ({
      locale,
      slug: game.slug
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
  const game = getGameBySlug(locale, slug)
  if (!game) {
    return createMetadata(locale, {
      title: buildPageTitle(dictionary.pages.games.notFoundTitle),
      description: dictionary.pages.games.notFoundDescription,
      path: "/games",
      imagePath: SEO_IMAGE_PATHS.projects,
      imageAlt: dictionary.pages.games.metadataTitle
    })
  }

  return createMetadata(locale, {
    title: buildPageTitle(game.title),
    description: game.summary,
    path: `/games/${game.slug}`,
    imagePath: SEO_IMAGE_PATHS.projects,
    imageAlt: game.title,
    keywords: game.stack
  })
}

export default async function GameDetailPage({
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
  const games = dictionary.pages.games
  const game = getGameBySlug(locale, slug)
  if (!game) {
    notFound()
  }
  const sudoku = game.slug === "sudoku" ? getSudokuDictionary(locale) : null

  const breadcrumbs = breadcrumbJsonLd([
    { name: ui.nav.home, url: absoluteUrl(`/${locale}`) },
    { name: ui.nav.games, url: absoluteUrl(`/${locale}/games`) },
    { name: game.title, url: absoluteUrl(`/${locale}/games/${game.slug}`) }
  ])

  return (
    <SectionStack as="article">
      <JsonLd id="game-breadcrumb-jsonld" data={breadcrumbs} />

      <Surface as="section" className="page-overview" aria-labelledby="game-title">
        <PageHeader className="page-overview-copy">
          <Eyebrow>{ui.nav.games}</Eyebrow>
          <h1 id="game-title">{game.title}</h1>
          <Lead>{game.summary}</Lead>
          <MutedText>{sudoku?.loadingNote ?? games.wasmNote}</MutedText>
        </PageHeader>
      </Surface>

      {sudoku ? (
        <SudokuGame wasmPath={game.wasmPath} locale={locale} copy={sudoku} />
      ) : (
        <FallingBlocksGame wasmPath={game.wasmPath} locale={locale} copy={games} />
      )}

      <Surface
        as="section"
        className="markdown content-prose"
        aria-labelledby="game-description-title"
      >
        <h2 id="game-description-title">{games.aboutTitle}</h2>
        <p>{game.description}</p>
        <ChipRow>
          {game.stack.map((item) => (
            <Chip key={item}>{item}</Chip>
          ))}
        </ChipRow>
      </Surface>

      <InlineLink href={`/${locale}/games`}>{ui.labels.backToGames}</InlineLink>
    </SectionStack>
  )
}
