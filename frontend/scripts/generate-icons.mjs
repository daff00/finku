import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const sourcePath = path.join(scriptDir, 'icon-source.svg')
const outputDir = path.resolve(scriptDir, '../public/icons')
const source = await readFile(sourcePath)

await mkdir(outputDir, { recursive: true })

for (const size of [192, 512, 180]) {
  const filename = size === 180
    ? 'apple-touch-icon.png'
    : `icon-${size}.png`

  await sharp(source)
    .resize(size, size)
    .png()
    .toFile(path.join(outputDir, filename))
}

await sharp(source)
  .resize(512, 512)
  .png()
  .toFile(path.join(outputDir, 'icon-maskable-512.png'))

console.log(`Generated PWA icons in ${outputDir}`)
