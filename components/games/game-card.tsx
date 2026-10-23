import { Card, Chip, ChipRow, InlineLink } from "@/components/design-system"
import type { Route } from "next"
import Link from "next/link"
import type { GameEntry } from "@/lib/games"
import type { Locale } from "@/lib/i18n"

export function GameCard({
  game,
  locale,
  readMoreAboutPrefix,
  playLabel,
  headingLevel = 2
}: {
  game: GameEntry
  locale: Locale
  readMoreAboutPrefix: string
  playLabel: string
  headingLevel?: 2 | 3
}) {
  const contextLabel = `${readMoreAboutPrefix} ${game.title}`
  const descriptiveLabel = `${playLabel} ${game.title}`
  const playHref = `/${locale}/games/${game.slug}` as Route
  const Heading = headingLevel === 2 ? "h2" : "h3"

  return (
    <Card className="game-card">
      <Heading>
        <Link href={playHref}>{game.title}</Link>
      </Heading>
      <p>{game.summary}</p>
      <ChipRow>
        {game.stack.map((item) => (
          <Chip key={`${game.slug}-${item}`}>{item}</Chip>
        ))}
      </ChipRow>
      <InlineLink href={playHref} aria-label={descriptiveLabel}>
        {playLabel}
        <span className="sr-only"> {contextLabel}</span>
      </InlineLink>
    </Card>
  )
}
