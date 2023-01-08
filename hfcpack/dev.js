import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { fork } from 'child_process'
import { build } from 'esbuild'
import { createServer as createViteServer } from 'vite'

import { defaultConfig } from './build.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const VITE_DEV_PORT = 8181

const viteDevServer = await createViteServer({
  configFile: path.resolve(__dirname, 'vite.config.js'),
  server: {
    proxy: {
      '^/(api|imgs|hfm)': `http://localhost:${VITE_DEV_PORT + 1}`,
    },
  },
})

await viteDevServer.listen(VITE_DEV_PORT)
viteDevServer.printUrls()

let serviceProcess = null
async function runService() {
  if (serviceProcess && !serviceProcess.killed)
    serviceProcess.kill('SIGKILL')

  serviceProcess = fork(path.resolve(__dirname, 'cli.js'), {
    env: { ...process.env, PORT: VITE_DEV_PORT + 1 },
  })
}

build({
  ...defaultConfig,
  sourcemap: 'external',
  watch: {
    onRebuild(error) {
      if (error) {
        console.error('watch build failed:', error)
        return
      }

      runService()
      console.log('hfcpack rebuilt')
    },
  },
}).then(() => {
  runService()
})
