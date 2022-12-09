import { readFileSync } from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pkgJson = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))

const external = Object.keys(pkgJson.dependencies)

export const defaultConfig = {
  bundle: true,
  entryPoints: [path.resolve(__dirname, 'src', 'index.ts')],
  format: 'esm',
  outfile: path.resolve(__dirname, 'dist', 'hfcpack.js'),
  external: ['vite', 'esbuild', 'postcss'],
  platform: 'node',
  target: 'esnext',
  banner: {
    js: 'import { createRequire } from \'module\'; const require = createRequire(import.meta.url);',
  },
}

function run() {
  console.log('do prod build')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href)
  run()
