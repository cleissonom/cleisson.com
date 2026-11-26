import assert from "node:assert/strict"
import { test } from "node:test"

import {
  formatPullRequestCount,
  getContributionGroups,
  getContributions,
  getContributionsCopy
} from "../../data/contributions.ts"

const locales = ["en-US", "pt-BR", "es-ES"]
const mergedPullRequests = [
  ["django/django", 22332, "2026-11-26T14:11:53Z"],
  ["django/django", 22333, "2026-11-26T10:41:24Z"],
  ["aws-powertools/powertools-lambda-python", 8876, "2026-11-25T13:07:17Z"],
  ["Netflix-Skunkworks/service-capacity-modeling", 373, "2026-11-24T05:20:39Z"],
  ["django/django", 22322, "2026-11-23T14:43:19Z"]
]

test("each locale links its contributions to the upstream merged pull requests", () => {
  for (const locale of locales) {
    const records = getContributions(locale)
    assert.deepEqual(
      records.map(({ repository, number, mergedAt }) => [repository, number, mergedAt]),
      mergedPullRequests
    )
    for (const record of records) {
      assert.equal(record.url, `https://github.com/${record.repository}/pull/${record.number}`)
      assert.equal(record.status, "merged")
      assert.ok(record.project && record.organization && record.title)
    }
  }
})

test("page and contribution copy are translated without changing the evidence IDs", () => {
  const translations = locales.map((locale) => getContributions(locale))
  assert.equal(new Set(locales.map((locale) => getContributionsCopy(locale).title)).size, 3)
  assert.equal(new Set(translations[0].map(({ id }) => id)).size, translations[0].length)
  for (const [position, original] of translations[0].entries()) {
    const rows = translations.map((items) => items[position])
    assert.ok(rows.every(({ id }) => id === original.id))
    assert.equal(new Set(rows.map(({ title }) => title)).size, 3)
  }
})

test("contributions to one repository share a group, newest first, with its star count", () => {
  const newestFirst = (items) =>
    items.every((item, index) => index === 0 || items[index - 1].mergedAt >= item.mergedAt)
  for (const locale of locales) {
    const groups = getContributionGroups(locale)
    assert.equal(new Set(groups.map(({ repository }) => repository)).size, groups.length)
    assert.ok(newestFirst(groups.map(({ contributions }) => contributions[0])))
    assert.deepEqual(
      groups.flatMap(({ contributions }) => contributions.map(({ id }) => id)).sort(),
      getContributions(locale)
        .map(({ id }) => id)
        .sort()
    )
    for (const group of groups) {
      assert.equal(group.url, `https://github.com/${group.repository}`)
      assert.ok(Number.isInteger(group.stars) && group.stars >= 0)
      assert.ok(newestFirst(group.contributions))
      assert.ok(group.contributions.every(({ repository }) => repository === group.repository))
    }
  }
})

test("pull request counts use each locale's singular and plural", () => {
  assert.equal(formatPullRequestCount(1, "en-US"), "1 merged pull request")
  assert.equal(formatPullRequestCount(3, "en-US"), "3 merged pull requests")
  assert.equal(formatPullRequestCount(1, "pt-BR"), "1 pull request integrado")
  assert.equal(formatPullRequestCount(3, "es-ES"), "3 pull requests integrados")
})
