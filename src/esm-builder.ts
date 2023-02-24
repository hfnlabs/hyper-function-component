import path from 'path'
import EventEmitter from 'events'
import fs from 'fs/promises'
import colors from 'picocolors'
import type { InlineConfig } from 'vite'
import { build } from 'vite'
import type {
  OutputAsset,
  OutputChunk,
  RollupError,
  RollupOutput,
  RollupWatcher,
} from 'rollup'

import type { ResolvedConfig } from './config.js'
import { ensureFileSync } from './utils.js'

const outputBuildError = (e: RollupError) => {
  let msg = colors.red((e.plugin ? `[${e.plugin}] ` : '') + e.message)
  if (e.id) {
    msg += `\nfile: ${colors.cyan(
      e.id + (e.loc ? `:${e.loc.line}:${e.loc.column}` : ''),
    )}`
  }
  if (e.frame)
    msg += `\n${colors.yellow(e.frame)}`

  console.error(msg, { error: e })
}

export class EsmBuilder extends EventEmitter {
  distHfcJsPath: string
  distHfcCssPath: string
  viteConfig: InlineConfig
  watcher?: RollupWatcher
  constructor(private config: ResolvedConfig) {
    super()

    this.distHfcJsPath = path.join(config.pkgOutputPath, 'hfc.js')
    this.distHfcCssPath = path.join(config.pkgOutputPath, 'hfc.css')

    ensureFileSync(this.distHfcCssPath)

    this.viteConfig = {
      mode: 'production',
      plugins: config.plugins,
      resolve: config.resolve,
      css: config.css,
      json: config.json,
      esbuild: config.esbuild,
      assetsInclude: config.assetsInclude,
      publicDir: false,
      clearScreen: false,
      envPrefix: 'HFC_',
      logLevel: 'silent',
      build: {
        target: 'esnext',
        emptyOutDir: false,
        assetsDir: '',
        lib: {
          entry: config.entry,
          formats: ['es'],
          fileName: 'hfc',
        },
        reportCompressedSize: false,
        rollupOptions: config.rollupOptions!,
        minify: false,
      },
    }
  }

  async build() {
    if (this.watcher)
      await this.watcher.close()

    const hfcEnv: Record<string, any> = {}

    const env = { ...this.config.env, ...process.env }
    for (const key in env) {
      if (key.startsWith('HFC_'))
        hfcEnv[key] = env[key]
    }

    hfcEnv['import.meta.env.HFC_NAME'] = JSON.stringify(this.config.name)
    hfcEnv['import.meta.env.HFC_VERSION'] = JSON.stringify(this.config.version)
    hfcEnv['import.meta.env.HFC_PROP_NAMES'] = process.env.HFC_PROP_NAMES

    this.viteConfig.define = hfcEnv
    this.viteConfig.build!.watch = { skipWrite: true }

    this.watcher = (await build(this.viteConfig)) as RollupWatcher

    // remove vite listener
    this.watcher.removeAllListeners()

    this.watcher.on('event', async (event) => {
      if (event.code === 'BUNDLE_START') {
        console.log(colors.cyan('\nStart building'))
      }
      else if (event.code === 'BUNDLE_END') {
        const output = await event.result.generate({
          format: 'es',
          exports: 'auto',
          sourcemap: false,
          generatedCode: 'es2015',
          entryFileNames: 'hfc.js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
          inlineDynamicImports: true,
        })

        await this.writeOutput(output)

        this.emit('build-complete')

        if (this.config.command === 'build')
          this.watcher!.close()
      }
      else if (event.code === 'ERROR') {
        outputBuildError(event.error)
      }
    })
  }

  private async writeOutput(output: RollupOutput) {
    let jsChunk: OutputChunk | undefined
    let cssAsset: OutputAsset | undefined
    for (const item of output.output) {
      if (item.type === 'chunk') {
        if (item.fileName === 'hfc.js')
          jsChunk = item
        continue
      }

      if (item.fileName === 'style.css') {
        cssAsset = item
        continue
      }
    }

    if (!jsChunk) {
      console.log('fail to build hfc, hfc.js not found')
      return
    }

    const js = jsChunk.code
    const css = cssAsset ? cssAsset.source || '/* no style */' : '/* no style */'

    await Promise.all([
      fs.writeFile(this.distHfcJsPath, js),
      fs.writeFile(this.distHfcCssPath, css),
    ])
  }
}
