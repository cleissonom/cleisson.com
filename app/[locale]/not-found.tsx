import { LocalizedNotFound, type RecoveryCopy } from "@/components/localized-not-found"
import { uiByLocale } from "@/data/i18n"
import { LOCALES, type Locale } from "@/lib/i18n"

export default function LocaleNotFound() {
  const copy = Object.fromEntries(
    LOCALES.map((locale) => {
      const { labels, nav } = uiByLocale[locale]
      return [
        locale,
        {
          title: labels.notFoundTitle,
          description: labels.notFoundDescription,
          home: labels.goHome,
          experience: nav.experience,
          projects: nav.projects
        }
      ]
    })
  ) as Record<Locale, RecoveryCopy>

  return <LocalizedNotFound copy={copy} />
}
