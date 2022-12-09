import fs from 'fs'
import path from 'path'
import esbuild from 'esbuild'
import type { HtmlTagDescriptor, Plugin, ResolvedConfig } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwind from 'tailwindcss'
import { ensureFileSync } from './src/utils'

const root = path.resolve(__dirname, 'client')
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    root,
    appType: 'mpa',
    plugins: [
      vue(),
      monacoEditorPlugin(path.resolve(__dirname, 'node_modules')),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client', 'src'),
        'vue': 'vue/dist/vue.esm-browser.prod.js',
      },
    },
    css: {
      postcss: {
        plugins: [
          tailwind({
            config: path.resolve(__dirname, 'tailwind.config.cjs'),
          }),
        ],
      },
    },
    clearScreen: false,
    optimizeDeps: {
      include: ['monaco-editor', 'iframe-resizer/js/iframeResizer.contentWindow.min.js', '@hyper-function/hfz-global'],
    },
    build: {
      // watch: isDev ? {} : undefined,
      outDir: path.resolve(__dirname, 'dist', 'client'),
      minify: !isDev,
      manifest: !isDev,
      emptyOutDir: !isDev,
      reportCompressedSize: !isDev,
      rollupOptions: {
        input: {
          index: `${root}/index.html`,
          preview: `${root}/hfz-preview.html`,
          previewEditor: `${root}/hfz-preview-editor.html`,
        },
      },
    },
    server: {
      hmr: false,
    },
  }
})

function monacoEditorPlugin(nodeModulesPath: string): Plugin {
  const languageWorks = {
    editorWorkerService: {
      entry: 'monaco-editor/esm/vs/editor/editor.worker',
      urlPath: '/monacoworkers/editor.worker.js',
    },
    css: {
      entry: 'monaco-editor/esm/vs/language/css/css.worker',
      urlPath: '/monacoworkers/css.worker.js',
    },
    html: {
      entry: 'monaco-editor/esm/vs/language/html/html.worker',
      urlPath: '/monacoworkers/html.worker.js',
    },
    json: {
      entry: 'monaco-editor/esm/vs/language/json/json.worker',
      urlPath: '/monacoworkers/json.worker.js',
    },
    typescript: {
      entry: 'monaco-editor/esm/vs/language/typescript/ts.worker',
      urlPath: '/monacoworkers/ts.worker.js',
    },
  }

  const cacheDir = path.join(nodeModulesPath, '.monaco-workers')

  function writeWorkerFilesToCache() {
    for (const worker of Object.values(languageWorks)) {
      const workerCachePath = path.join(cacheDir, worker.urlPath)

      if (!fs.existsSync(workerCachePath)) {
        const entryPoint = path.resolve(nodeModulesPath, worker.entry)

        esbuild.buildSync({
          entryPoints: [entryPoint],
          bundle: true,
          minify: true,
          outfile: workerCachePath,
          legalComments: 'none',
        })
      }
    }
  }

  let resolvedConfig: ResolvedConfig
  return {
    name: 'vite-plugin-monaco',
    configResolved(getResolvedConfig) {
      resolvedConfig = getResolvedConfig
    },
    configureServer(server) {
      writeWorkerFilesToCache()

      for (const worker of Object.values(languageWorks)) {
        server.middlewares.use(worker.urlPath, (req, res) => {
          const contentBuffer = fs.readFileSync(
            path.join(cacheDir, worker.urlPath),
          )
          res.setHeader('Content-Type', 'text/javascript')
          res.end(contentBuffer)
        })
      }
    },
    writeBundle() {
      writeWorkerFilesToCache()
      for (const worker of Object.values(languageWorks)) {
        const dist = path.join(resolvedConfig.build.outDir, worker.urlPath)
        ensureFileSync(dist)
        fs.copyFileSync(path.join(cacheDir, worker.urlPath), dist)
      }
    },
    transformIndexHtml() {
      const globals = {
        MonacoEnvironment: `(function (paths) {
          return {
            globalAPI: false,
            getWorkerUrl: function (moduleId, label) {
              var result = paths[label];
              return result;
            }
          };
        })(${JSON.stringify({
          editorWorkerService: languageWorks.editorWorkerService.urlPath,
          typescript: languageWorks.typescript.urlPath,
          javascript: languageWorks.typescript.urlPath,
          css: languageWorks.css.urlPath,
          less: languageWorks.css.urlPath,
          scss: languageWorks.css.urlPath,
          html: languageWorks.html.urlPath,
          json: languageWorks.html.urlPath,
        })})`,
      }

      const descriptor: HtmlTagDescriptor[] = [
        {
          tag: 'script',
          children: Object.keys(globals)
            .map(key => `self[${JSON.stringify(key)}] = ${globals[key]};`)
            .join('\n'),
          injectTo: 'head-prepend',
        },
      ]

      return descriptor
    },
  }
}
