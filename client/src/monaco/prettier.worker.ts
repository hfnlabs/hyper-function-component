import * as Comlink from 'comlink'
import type { Options } from 'prettier'

// @ts-expect-error no types
import prettier from 'prettier/esm/standalone.mjs'
// import parserBabel from 'prettier/esm/parser-babel.mjs'
// import parserHtml from 'prettier/esm/parser-html.mjs'
// import parserMarkdown from 'prettier/esm/parser-markdown.mjs'
// import parserPostcss from 'prettier/esm/parser-postcss.mjs'
// import parserTypescript from 'prettier/esm/parser-typescript.mjs'

import type { Prettier } from './prettier'

const defaults = { useTabs: false, semi: false, trailingComma: 'all', bracketSameLine: false }

const plugins = [
  {
    detect: (parser: string) =>
      /^[mc]?jsx?$/.test(parser)
        ? 'babel'
        : /^[mc]?tsx?$/.test(parser)
          ? 'babel-ts'
          : /^json5?$/.test(parser) && parser,
    // @ts-expect-error no types
    load: () => import('prettier/esm/parser-babel.mjs').then(m => m.default),
  },
  {
    detect: (parser: string) => /^html?$/.test(parser) && 'html',
    // @ts-expect-error no types
    load: () => import('prettier/esm/parser-html.mjs').then(m => m.default),
  },
  {
    detect: (parser: string) => /^(le|s?c)ss$/.test(parser) && parser,
    // @ts-expect-error no types
    load: () => import('prettier/esm/parser-postcss.mjs').then(m => m.default),
  },
]

async function getOptions(options?: Options) {
  const parser = options?.parser || /(?:\.([^.]+))?$/.exec(options?.filepath || '')?.[1]

  if (typeof parser === 'string') {
    for (const plugin of plugins) {
      const found = plugin.detect(parser)
      if (found) {
        return {
          ...defaults,
          ...options,
          parser: found,
          plugins: [await plugin.load()],
        }
      }
    }
  }

  return {
    ...defaults,
    ...options,
    plugins: Promise.all(plugins.map(plugin => plugin.load())),
  }
}

const api: Prettier = {
  async format(source, options) {
    return prettier.format(source, await getOptions(options))
  },
}

Comlink.expose(api)
