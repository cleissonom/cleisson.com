export function formatContentDate(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    ...options
  }).format(new Date(value))
}

export function contentDateYear(value: string): number {
  return new Date(value).getUTCFullYear()
}
