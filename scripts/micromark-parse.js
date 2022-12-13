import fs from 'node:fs/promises'
import { micromark } from 'micromark'
import { gfm, gfmHtml } from 'micromark-extension-gfm'

const output = micromark(await fs.readFile('./examples/awa-btn/hfcpack/hfc.md'), {
  allowDangerousHtml: true,
  extensions: [gfm()],
  htmlExtensions: [gfmHtml()],
})

console.log(output)
