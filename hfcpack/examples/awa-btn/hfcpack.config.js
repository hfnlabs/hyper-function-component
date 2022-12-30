import { defineHfcPackConfig } from 'hfcpack'

export default defineHfcPackConfig({
  entry: './src/index.js',
  plugins: [],
  sharedNpmImports: ['vue/dist/vue.esm-browser.prod.js'],
})
