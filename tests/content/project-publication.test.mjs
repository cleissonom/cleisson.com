import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"

const root = process.cwd()
const locales = ["en-US", "pt-BR", "es-ES"]
const projectSlug = "jira-toggl-quickstart"
const repositoryUrl = "https://github.com/cleissonom/jira-toggl-quickstart"
const storeUrl =
  "https://chromewebstore.google.com/detail/jira-%E2%86%92-toggl-quick-start/ijkninhienjcgnlfcelljeoimpankboc"
const coverImage = "/projects/jira-toggl-quickstart.png"

function readProject(locale) {
  const filePath = path.join(root, "content", "projects", locale, `${projectSlug}.md`)
  const source = fs.readFileSync(filePath, "utf8")
  const match = source.match(/^---\n(?<frontmatter>[\s\S]*?)\n---\n(?<body>[\s\S]*)$/)
  assert.ok(match?.groups, `${filePath} must use YAML frontmatter`)

  return {
    filePath,
    frontmatter: match.groups.frontmatter,
    body: match.groups.body.trim()
  }
}

test("Jira to Toggl Quick Start is published in every locale", () => {
  for (const locale of locales) {
    const project = readProject(locale)

    assert.match(project.frontmatter, /^title: Jira → Toggl Quick Start$/m)
    assert.match(project.frontmatter, new RegExp(`^slug: ${projectSlug}$`, "m"))
    assert.match(project.frontmatter, /^type: developer-tool$/m)
    assert.match(project.frontmatter, /^stage: live$/m)
    assert.match(project.frontmatter, new RegExp(`^coverImage: ${coverImage}$`, "m"))
    assert.ok(project.frontmatter.includes(repositoryUrl))
    assert.ok(project.frontmatter.includes(storeUrl))
    assert.ok(project.body.length >= 700, `${project.filePath} should contain a useful case study`)
  }

  assert.ok(fs.existsSync(path.join(root, "public", coverImage)))
})

test("the projects grid uses three desktop columns", () => {
  const css = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8")
  const projectsRule = css.match(/\.projects-grid\s*\{(?<body>[^}]*)\}/)

  assert.ok(projectsRule?.groups, "the projects grid rule should exist")
  assert.match(
    projectsRule.groups.body,
    /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/
  )
})
