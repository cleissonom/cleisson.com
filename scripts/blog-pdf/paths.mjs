import fs from "node:fs"
import path from "node:path"

// Reject symlink components even when the final file does not yet exist.
export function projectPath(root, relative) {
  if (
    path.isAbsolute(relative) ||
    relative.includes("\\") ||
    relative.split("/").some((part) => !part || part === "." || part === "..")
  ) {
    throw new Error(`Unsafe project path: ${relative}`)
  }
  let target = root
  for (const part of relative.split("/")) {
    target = path.join(target, part)
    if (fs.lstatSync(target, { throwIfNoEntry: false })?.isSymbolicLink())
      throw new Error(`Unsafe symlink path: ${relative}`)
  }
  return target
}

export function pdfOutput(root, url) {
  if (
    !/^\/downloads\/blog\/(?:[A-Za-z0-9_-][A-Za-z0-9._-]*\/)*[A-Za-z0-9_-][A-Za-z0-9._-]*\.pdf$/.test(
      url
    ) ||
    url.includes("..")
  ) {
    throw new Error(`Unsafe PDF destination: ${url}`)
  }
  const relative = `public${url}`
  projectPath(root, relative)
  return relative
}
