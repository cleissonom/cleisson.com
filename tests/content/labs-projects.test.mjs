import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import matter from "gray-matter"

const root = process.cwd()
const locales = ["en-US", "pt-BR", "es-ES"]

test("each Cleisson Labs tool has one published, filterable project per locale", () => {
  const labsProjects = {
    kitmux: "kitmux",
    "teams-mcp": "teams-mcp",
    "file-system-mcp": "file-system-mcp",
    devimg: "devimg",
    "cli-tools": "cli_tools",
    "jira-toggl-quickstart": "jira-toggl-quickstart"
  }

  for (const locale of locales) {
    const directory = path.join(root, "content", "projects", locale)
    const projects = fs
      .readdirSync(directory)
      .filter((file) => file.endsWith(".md"))
      .map((file) => matter(fs.readFileSync(path.join(directory, file), "utf8")).data)

    for (const [slug, repo] of Object.entries(labsProjects)) {
      const matches = projects.filter(
        (project) => project.links?.repo === `https://github.com/cleisson-labs/${repo}`
      )
      assert.deepEqual(
        matches.map((project) => project.slug),
        [slug],
        `${locale}/${slug}`
      )
      assert.notEqual(matches[0].stage, "in-progress")
      assert.ok(matches[0].tags.includes("Cleisson Labs"), `${locale}/${slug} is filterable`)
    }
  }
})
