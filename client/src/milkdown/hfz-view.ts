import { createCmd, createCmdKey } from '@milkdown/core'
import { setBlockType } from '@milkdown/prose/commands'
import { createNode, createShortcut } from '@milkdown/utils'

export const TurnIntoHfzView = createCmdKey('TurnIntoHfzView')

const genId = () => Math.random().toString(36).slice(2)

export type HfzViewCode = Map<string, {
  id: string
  value: string
  minHeight: number
  darkMode: boolean
}>

interface HfzViewOpts {
  codeMap: HfzViewCode
  onMount: (id: string, container: HTMLDivElement) => void
  [key: string]: any
}

const DEFAULT_MIN_HEIGHT = 60

export const hfzView = createNode<'HfzView', HfzViewOpts>((_, opts) => {
  const codeMap = opts!.codeMap!
  const onMount = opts!.onMount!

  return {
    id: 'hfz_view',
    schema: () => ({
      selectable: false,
      content: 'text*',
      group: 'block',
      marks: '',
      defining: true,
      isolating: true,
      code: true,
      attrs: {
        id: {
          default: '',
        },
      },
      parseDOM: [
        {
          tag: 'div.hfz-view',
        },
      ],
      toDOM(node) {
        const dom = document.createElement('div')
        const viewDom = document.createElement('div')
        const viewId = node.attrs.id
        viewDom.id = `hfz-view-${viewId}`
        viewDom.classList.add('hfz-view', 'my-5')
        onMount(viewId, viewDom)
        dom.appendChild(viewDom)

        // const contentDOM = document.createElement('div')
        // dom.appendChild(contentDOM)

        return { dom }
      },
      parseMarkdown: {
        match: (node) => {
          return node.type === 'code' && node.lang === 'hfz-view'
        },
        runner: (state, node, type) => {
          const value = node.value as string

          const code = { id: '', value, minHeight: DEFAULT_MIN_HEIGHT, darkMode: false }

          const params = new URLSearchParams(node.meta as string || '')
          if (params.has('id'))
            code.id = params.get('id')!
          if (params.has('h'))
            code.minHeight = parseInt(params.get('h')!)
          if (params.has('dark'))
            code.darkMode = true

          if (!code.id)
            code.id = genId()

          codeMap.set(code.id, code)

          state.openNode(type, { id: code.id })
          state.closeNode()
        },
      },
      toMarkdown: {
        match: node => node.type.name === 'hfz_view',
        runner: (state, node) => {
          const code = codeMap.get(node.attrs.id)!

          const params = new URLSearchParams()
          params.set('id', code.id)

          if (code.minHeight && code.minHeight !== DEFAULT_MIN_HEIGHT)
            params.set('h', code.minHeight.toString())

          if (code.darkMode)
            params.set('dark', '1')

          state.addNode('code', undefined, code.value, {
            lang: 'hfz-view',
            meta: params.toString(),
          })
        },
      },
    }),
    commands: nodeType => [
      createCmd(TurnIntoHfzView, () => {
        const id = genId()
        codeMap.set(id, {
          id,
          value: '',
          minHeight: DEFAULT_MIN_HEIGHT,
          darkMode: false,
        })

        return setBlockType(nodeType, { id })
      }),
    ],
    shortcuts: {
      HfzView: createShortcut(TurnIntoHfzView, 'Mod-Alt-z'),
    },
  }
})
