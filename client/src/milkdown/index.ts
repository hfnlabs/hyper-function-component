import type { CtxHandler } from '@milkdown/core'
import {
  Editor,
} from '@milkdown/core'
import { history } from '@milkdown/plugin-history'
import { trailing } from '@milkdown/plugin-trailing'
import { listener } from '@milkdown/plugin-listener'
import { tooltip } from '@milkdown/plugin-tooltip'
import { heading } from '@milkdown/preset-gfm'
import { emoji } from '@milkdown/plugin-emoji'
import { indent } from '@milkdown/plugin-indent'
import { cursor } from '@milkdown/plugin-cursor'
import { prismPlugin } from '@milkdown/plugin-prism'
import { clipboard } from '@milkdown/plugin-clipboard'
import { refractor } from 'refractor/lib/common'

import { gfm } from './gfm'
import theme from './theme'
import { slash } from './slash'
import type { HfzViewCode } from './hfz-view'
import { hfzView } from './hfz-view'

export async function createMilkdownEditor(configFn: CtxHandler, codeMap: HfzViewCode, onHfzViewMount: (id: string, container: HTMLDivElement) => void) {
  gfm
    .configure(heading, {
      displayHashtag: true,
    })
    .configure(hfzView, {
      codeMap,
      onMount: onHfzViewMount,
    })

  return await Editor.make()
    .config(configFn)
    .use(gfm)
    .use(theme)
    .use(slash)
    .use(emoji)
    .use(indent)
    .use(cursor)
    .use(history)
    .use(tooltip)
    .use(trailing)
    .use(clipboard)
    .use(
      prismPlugin({
        configureRefractor: () => {
          refractor.alias('html', 'hfz')
          return refractor
        },
      }),
    )
    .use(listener)
    .create()
}
