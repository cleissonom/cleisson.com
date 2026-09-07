import { createHash } from "node:crypto"
import fs from "node:fs"
import { projectPath } from "./paths.mjs"

export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex")

export function captureInputs(root, post, assets, css) {
  const shared = [
    "lib/content-source.ts",
    "lib/i18n.ts",
    "lib/site.ts",
    "lib/display-date.ts",
    "package-lock.json"
  ]
  const scripts = fs
    .readdirSync(projectPath(root, "scripts/blog-pdf"))
    .filter((file) => /\.(mjs|css)$/.test(file))
    .map((file) => `scripts/blog-pdf/${file}`)
  const inputs = Object.fromEntries(
    [...shared, ...scripts].map((file) => [file, sha256(fs.readFileSync(projectPath(root, file)))])
  )
  inputs[post.source] = sha256(post.sourceBytes)
  inputs["scripts/blog-pdf/print.css"] = sha256(css)
  for (const asset of assets) inputs[asset.path] = sha256(asset.bytes)
  return inputs
}

export function inputHash(_root, document) {
  return sha256(
    JSON.stringify(Object.entries(document.inputs).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
  )
}

export function assertInputsUnchanged(root, document) {
  for (const [file, expected] of Object.entries(document.inputs)) {
    if (sha256(fs.readFileSync(projectPath(root, file))) !== expected)
      throw new Error(`Input changed during generation: ${file}; rerun from current sources`)
  }
}
