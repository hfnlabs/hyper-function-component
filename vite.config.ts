import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from 'tailwindcss'

const root = path.resolve(__dirname, 'client')
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    root,
    appType: 'mpa',
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client', 'src'),
        'vue': 'vue/dist/vue.esm-browser.prod.js',
      },
    },
    css: {
      postcss: {
        plugins: [tailwindcss({
          config: path.resolve(__dirname, 'tailwind.config.cjs'),
        })],
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
  }
})
