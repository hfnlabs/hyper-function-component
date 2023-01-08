/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const twDefaultTheme = require('tailwindcss/defaultTheme')
const twTypography = require('@tailwindcss/typography')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: { files: [path.join(__dirname, 'client', '**/*.{vue,ts,html}')], relative: false },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...twDefaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [twTypography],
}
