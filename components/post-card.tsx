import { Card, Chip, ChipRow, InlineLink } from "@/components/design-system"
import type { Route } from "next"
import Image from "next/image"
import Link from "next/link"
import type { BlogEntry } from "@/lib/content"
import { blogCardImageVariant } from "@/lib/devimg"
import { formatContentDate } from "@/lib/display-date"
import type { Locale } from "@/lib/i18n"

export function PostCard({
  post,
  locale,
  readMoreLabel,
  readMoreAboutPrefix,
  readingMinutesLabel
}: {
  post: BlogEntry
  locale: Locale
  readMoreLabel: string
  readMoreAboutPrefix: string
  readingMinutesLabel: string
}) {
  const contextLabel = `${readMoreAboutPrefix} ${post.title}`
  const descriptiveLabel = `${readMoreLabel} ${contextLabel}`
  const cardImage = post.coverImage ? blogCardImageVariant(post.coverImage) : null
  const detailHref = `/${locale}/blog/${post.slug}` as Route

  return (
    <Card className="post-card">
      {cardImage ? (
        <div className="card-banner-shell post-card-banner">
          <Image
            className={`card-banner-image${cardImage.fit === "contain" ? " card-banner-image-contain" : ""}`}
            src={cardImage.src}
            alt={post.coverAlt ?? `${post.title} preview`}
            width={cardImage.width}
            height={cardImage.height}
            loading="lazy"
            unoptimized
          />
        </div>
      ) : null}
      <p className="card-meta">
        {formatContentDate(post.date, locale, {
          year: "numeric",
          month: "short",
          day: "numeric"
        })}
        {` | ${post.readingTimeMinutes} ${readingMinutesLabel}`}
      </p>
      <h3>
        <Link href={detailHref}>{post.title}</Link>
      </h3>
      <p>{post.summary}</p>
      <ChipRow>
        {post.tags.map((tag) => (
          <Chip key={`${post.slug}-${tag}`}>{tag}</Chip>
        ))}
      </ChipRow>
      <InlineLink href={detailHref} aria-label={descriptiveLabel}>
        {readMoreLabel}
        <span className="sr-only"> {contextLabel}</span>
      </InlineLink>
    </Card>
  )
}
