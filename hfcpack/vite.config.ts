import fs from 'fs'
import path from 'path'
import { buildSync } from 'esbuild'
import type { HtmlTagDescriptor, Plugin } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwind from 'tailwindcss'

const root = path.resolve(__dirname, 'client')
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    root,
    appType: 'mpa',
    plugins: [
      vue(),
      monaco(),
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

function monaco(): Plugin {
  const languageWorkers = {
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

  for (const worker of Object.values(languageWorkers)) {
    const workerPath = path.join(root, 'public', worker.urlPath)

    if (!fs.existsSync(workerPath)) {
      const entryPoint = path.resolve(__dirname, 'node_modules', worker.entry)

      buildSync({
        entryPoints: [entryPoint],
        bundle: true,
        minify: true,
        outfile: workerPath,
        legalComments: 'none',
      })
    }
  }

  // let resolvedConfig: ResolvedConfig
  return {
    name: 'vite-plugin-monaco',
    // configResolved(getResolvedConfig) {
    //   resolvedConfig = getResolvedConfig
    // },
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
          editorWorkerService: languageWorkers.editorWorkerService.urlPath,
          typescript: languageWorkers.typescript.urlPath,
          javascript: languageWorkers.typescript.urlPath,
          css: languageWorkers.css.urlPath,
          less: languageWorkers.css.urlPath,
          scss: languageWorkers.css.urlPath,
          html: languageWorkers.html.urlPath,
          json: languageWorkers.html.urlPath,
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
