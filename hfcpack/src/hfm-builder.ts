// HFC Federated Module
import path from 'path'
import EventEmitter from 'events'
import fs from 'fs/promises'
import { existsSync, writeFileSync } from 'fs'
import type { InlineConfig } from 'vite'
import { build } from 'vite'
import esbuild from 'esbuild'
import type { OutputOptions } from 'rollup'
import type { ResolvedConfig } from './config.js'
import { ensureFileSync } from './utils.js'

function generateSharedNpmBuildScript(name: string) {
  let script = `\
const shared = (window.$HFC_SHARE_DEP = window.$HFC_SHARE_DEP || {});
import * as m from "${name}";
if (!shared["${name}"]) shared["${name}"] = m;
`

  // special case for react-dom, which must bundle with react
  if (name === 'react') {
    script += `\
import * as m1 from "react-dom";
if (!shared["react-dom"]) shared["react-dom"] = m1;
`
  }

  return script
}

export class HfmBuilder extends EventEmitter {
  mode: 'production' | 'development'
  outDir: string
  viteConfig!: InlineConfig
  sharedDeps: { npm: string; name: string; ver: string; rv: string }[] = []
  externals: string[] = []
  constructor(private config: ResolvedConfig) {
    super()
    this.outDir = path.resolve(
      this.config.hfmOutputPath,
      this.config.hfcName,
      this.config.version,
    )
    this.mode = config.command === 'build' ? 'production' : 'development'
  }

  async resolveConfig() {
    const entry = path.join(this.config.hfmOutputPath, 'entry.js')
    writeFileSync(
      entry,
      [
        'import "../pkg/hfc.css";',
        'import HFC from "../pkg/hfc.js";',
        `window.$HFC_ITEMS["${this.config.hfcName}"] = HFC;`,
        '',
      ].join('\n'),
    )

    await this.buildSharedNpmPkg()

    this.viteConfig = {
      mode: this.mode,
      esbuild:
        this.mode === 'production' ? { legalComments: 'none' } : undefined,
      define: {
        'process.env.NODE_ENV': JSON.stringify(this.mode),
      },
      publicDir: false,
      clearScreen: false,
      logLevel: 'silent',
      css: { postcss: {} },
      build: {
        assetsDir: '',
        reportCompressedSize: false,
        lib: {
          name: 'hfmExport',
          entry,
          formats: ['iife'],
          fileName: () => 'hfm.js',
        },
        rollupOptions: {
          external: this.externals,
          output: {
            globals: this.externals.reduce((prev, curr) => {
              prev[curr] = `shared['${curr}']`
              return prev
            }, {} as any),
            inlineDynamicImports: true,
            assetFileNames: '[name].[ext]',
            chunkFileNames: '[name].js',
          },
        },
        outDir: this.outDir,
        emptyOutDir: false,
        minify: this.config.command === 'build',
      },
    }
  }

  async buildSharedNpmPkg() {
    await Promise.all(
      Object.keys(this.config.deps).map(async (name) => {
        const sharedPkg = this.config.sharedNpmImportMap[name]
        if (!sharedPkg)
          return

        const dep = this.config.deps[name]
        await Promise.all(
          sharedPkg.imports.map(async (importPath) => {
            this.externals.push(importPath)
            if (importPath === 'react')
              this.externals.push('react-dom')

            this.sharedDeps.push({
              npm: name,
              name: importPath,
              ver: dep.v,
              rv: dep.rv,
            })

            const outfile = path.resolve(
              this.config.hfmOutputPath,
              'share',
              `${importPath}@${dep.v}.js`,
            )

            const hasBuild = existsSync(outfile)
            if (hasBuild)
              return

            const entry = path.join(
              this.config.hfmOutputPath,
              'shared-entry',
              `${importPath}.js`,
            )

            ensureFileSync(entry)
            await fs.writeFile(entry, generateSharedNpmBuildScript(importPath))
            await esbuild.build({
              entryPoints: [entry],
              bundle: true,
              minify: this.mode === 'production',
              define: {
                'process.env.NODE_ENV': JSON.stringify(this.mode),
              },
              format: 'iife',
              outfile,
            })
          }),
        )
      }),
    )
  }

  buildWrap() {
    return {
      start: `\
(function () {
  const currentUrl = document.currentScript.src;

  $HFC_LOAD_CSS(currentUrl.replace("hfm.js", "hfm.css"));

  const deps = ${JSON.stringify(
    this.sharedDeps.map(dep => ({
        name: dep.name,
        ver: dep.ver,
        rv: dep.rv,
      })),
    )};
  const shared = (window.$HFC_SHARE_DEP = window.$HFC_SHARE_DEP || {});

  const hfmBaseUrl = currentUrl.split("hfm/")[0];
  function init() {
    return Promise.all(
      deps.map((dep) => {
        if (shared[dep.name]) return;
        return $HFC_LOAD_JS(
          hfmBaseUrl + "hfm/share/" + dep.name + "@" + dep.ver + ".js"
        );
      })
    ).then(initHfc);
  }

  window.$HFC_ITEMS = window.$HFC_ITEMS || {};
  function get(name) {
    return () => Promise.resolve(name === "./hfc" ? window.$HFC_ITEMS["${
      this.config.hfcName
    }"] : undefined);
  }

  window.$HFC_CONTAINERS = window.$HFC_CONTAINERS || {};
  window.$HFC_CONTAINERS["${
    this.config.hfcName
  }"] = { get: get, init: init, deps: deps };

  function initHfc() {
  `,
      end: `
  }
})();
`,
    }
  }

  async build() {
    const wrapCode = this.buildWrap()
    const output = this.viteConfig.build!.rollupOptions!
      .output! as OutputOptions

    output.banner = wrapCode.start
    output.footer = wrapCode.end

    await build(this.viteConfig)

    const cssVars = `\
:root {
${this.config.cssVars.map(item => `  ${item.name}: ${item.value};`).join('\n')}
}
`

    const styleContent = await fs.readFile(path.join(this.outDir, 'style.css'), 'utf-8')

    await fs.writeFile(path.join(this.outDir, 'hfm.css'), cssVars + styleContent)

    this.emit('build-complete')
  }
}
