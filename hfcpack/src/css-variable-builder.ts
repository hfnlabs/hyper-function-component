import EventEmitter from 'events'
import fs from 'fs'
import type { Rule } from 'postcss'
import postcss from 'postcss'
import type { CssVar, ResolvedConfig } from './config'

export class CssVarBuilder extends EventEmitter {
  constructor(private config: ResolvedConfig) {
    super()
  }

  async build(content?: string) {
    const cssText = content || fs.readFileSync(this.config.cssVarsPath, 'utf-8')

    const cssVars: CssVar[] = []
    if (cssText) {
      const parsed = postcss.parse(cssText)

      const root = parsed.nodes.find(
        item => (item as Rule).selector === ':root',
      ) as Rule | undefined

      if (!root)
        throw new Error('miss :root selector')

      root.nodes.forEach((node, i) => {
        if (node.type === 'decl') {
          if (node.prop.startsWith('--')) {
            const cssVar: CssVar = {
              name: node.prop,
              value: node.value,
            }

            const prevNode = root.nodes[i - 1]
            if (prevNode && prevNode.type === 'comment')
              cssVar.comment = prevNode.text

            cssVars.push(cssVar)
          }
        }
      })
    }

    this.config.cssVars = cssVars
    fs.writeFileSync(this.config.cssVarsDistPath, JSON.stringify(cssVars))

    this.emit('build-complete')
  }
}
