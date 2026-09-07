import fs from "node:fs"
import path from "node:path"
import { projectPath } from "./paths.mjs"

const imageTypes = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif"
}

function validateSvg(bytes, source) {
  const svg = bytes.toString("utf8")
  if (
    /<(?:script|foreignObject)\b|\son\w+\s*=|@import|<!ENTITY/i.test(svg) ||
    [...svg.matchAll(/(?:href\s*=\s*["']|url\(\s*["']?)([^"')\s]+)/gi)].some(
      (match) => !match[1].startsWith("#")
    )
  ) {
    throw new Error(
      `SVG asset must be self-contained without scripts or external dependencies: ${source}`
    )
  }
}

export function imageAsset(root, post, src) {
  if (!src || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(src) || /[%?#\\\u0000-\u001f]/.test(src))
    throw new Error(`Image asset must use a local path: ${src}`)
  const relative = src.startsWith("/")
    ? `public${src}`
    : path.posix.join(path.posix.dirname(post.source), src)
  if (!relative.startsWith("public/") && !relative.startsWith("content/blog/"))
    throw new Error(`Unsafe image asset path: ${src}`)
  const target = projectPath(root, relative)
  if (!fs.existsSync(target)) throw new Error(`Missing image asset: ${relative}`)
  const mime = imageTypes[path.extname(relative).toLowerCase()]
  if (!mime) throw new Error(`Unsupported image asset: ${relative}`)
  const bytes = fs.readFileSync(target)
  if (mime === "image/svg+xml") validateSvg(bytes, relative)
  return { path: relative, bytes, uri: `data:${mime};base64,${bytes.toString("base64")}` }
}
