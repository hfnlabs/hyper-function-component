const path = require('path')
const twDefaultTheme = require('tailwindcss/defaultTheme')
const twTypography = require('@tailwindcss/typography')

module.exports = {
  content: { files: [path.join(__dirname, 'client', '**/*.{vue,js,ts,jsx,tsx}').replace(/\\/g, '/')], relative: false },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...twDefaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [twTypography],
}
