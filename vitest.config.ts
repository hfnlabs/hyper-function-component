import { defineConfig } from 'vitest/config'

export default defineConfig({
  clearScreen: false,
  test: {
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
