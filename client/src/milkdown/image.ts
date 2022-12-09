import { commandsCtx, createCmd, createCmdKey } from '@milkdown/core'
import { InputRule } from '@milkdown/prose/inputrules'
import { createNode } from '@milkdown/utils'
import { findSelectedNodeOfType } from '@milkdown/prose'
import { createApp } from 'vue'
import { useImagePicker } from '@/composables/useImagePicker'
import MilkdownImageActionBar from '@/components/MilkdownImageActionBar.vue'

export const ModifyImage = createCmdKey<string>('ModifyHfcpackImage')
export const InsertImage = createCmdKey<string>('InsertHfcpackImage')
const NODE_ID = 'image'
const { showImagePicker, onSelectImg } = useImagePicker()

export const image = createNode(() => {
  return {
    id: NODE_ID,
    schema: () => ({
      inline: true,
      group: 'inline',
      selectable: true,
      marks: '',
      defining: true,
      isolating: true,
      attrs: {
        src: { default: '' },
        alt: { default: '' },
        title: { default: '' },
        isNew: { default: false },
      },
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement))
              throw new Error(`img is not an HTMLElement ${dom}`)

            return {
              src: dom.getAttribute('src') || '',
              alt: dom.getAttribute('alt') || '',
              title: dom.getAttribute('title') || dom.getAttribute('alt') || '',
            }
          },
        },
      ],
      toDOM: (node) => {
        return [
          'img',
          {
            ...node.attrs,
            // class: 'image',
          },
        ]
      },
      parseMarkdown: {
        match: ({ type }) => type === NODE_ID,
        runner: (state, node, type) => {
          let url = node.url as string
          let alt = node.alt as string
          const title = node.title as string

          // do not allow external image link
          if (!url.startsWith('/imgs/')) {
            url = ''
            alt = 'External image link is not support.'
          }

          state.addNode(type, {
            src: url,
            alt,
            title,
          })
        },
      },
      toMarkdown: {
        match: node => node.type.name === NODE_ID,
        runner: (state, node) => {
          state.addNode('image', undefined, undefined, {
            title: node.attrs.title,
            url: node.attrs.src,
            alt: node.attrs.alt,
          })
        },
      },
    }),
    commands: type => [
      createCmd(InsertImage, (src = '') => (state, dispatch) => {
        if (!dispatch)
          return true
        const { tr } = state
        const node = type.create({ src, isNew: true })
        if (!node)
          return true

        const _tr = tr.replaceSelectionWith(node)
        dispatch(_tr.scrollIntoView())
        return true
      }),
      createCmd(ModifyImage, (src = '') => (state, dispatch) => {
        const node = findSelectedNodeOfType(state.selection, type)
        if (!node)
          return false

        const { tr } = state
        dispatch?.(
          tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, isNew: false, src }).scrollIntoView(),
        )

        return true
      }),
    ],
    inputRules: type => [
      new InputRule(
        /!\[(?<alt>.*?)]\((?<filename>.*?)\s*(?="|\))"?(?<title>[^"]+)?"?\)/,
        (state, match, start, end) => {
          const [okay, alt, src = '', title] = match
          const { tr } = state
          if (okay)
            tr.replaceWith(start, end, type.create({ src, alt, title }))

          return tr
        },
      ),
    ],
    view: ctx => (node) => {
      const dom = document.createElement('div')
      dom.classList.add('md-image')
      dom.style.display = 'flex'
      dom.style.position = 'relative'

      function render({ src, alt, title }: { src?: string; alt?: string; title?: string; isNew: boolean }) {
        dom.innerHTML = ''

        if (!src) {
          const span = document.createElement('span')
          span.classList.add('bg-gray-100', 'p-2', 'rounded-sm', 'cursor-pointer')
          span.innerText = 'Click to pick image'

          span.onclick = function () {
            onSelectImg((imgPath) => {
              ctx.get(commandsCtx).call(ModifyImage, imgPath)
            })
            showImagePicker.value = true
          }

          dom.appendChild(span)
          return
        }

        const img = document.createElement('img')
        img.src = src
        img.alt = alt || ''
        img.title = title || alt || ''
        img.style.maxWidth = '100%'

        const url = new URL(src, window.location.origin)
        const width = url.searchParams.get('w') || ''
        const height = url.searchParams.get('h') || ''
        const align = url.searchParams.get('a') || 'left'

        if (width)
          img.style.width = `${width}px`

        if (height)
          img.style.height = `${height}px`

        if (align === 'left')
          dom.style.justifyContent = 'flex-start'
        else if (align === 'right')
          dom.style.justifyContent = 'flex-end'
        else if (align === 'center')
          dom.style.justifyContent = 'center'

        dom.appendChild(img)

        const actionBar = document.createElement('div')
        actionBar.classList.add('action-bar', 'absolute', 'left-0', 'table', 'h-10', '-bottom-11')
        dom.appendChild(actionBar)

        createApp(MilkdownImageActionBar, {
          align,
          width,
          height,
          onChangWidth(value: number) {
            value ? url.searchParams.set('w', `${value}`) : url.searchParams.delete('w')
            ctx.get(commandsCtx).call(ModifyImage, `${url.pathname}?${url.searchParams.toString()}`)
          },
          onChangHeight(value: number) {
            value ? url.searchParams.set('h', `${value}`) : url.searchParams.delete('h')
            ctx.get(commandsCtx).call(ModifyImage, `${url.pathname}?${url.searchParams.toString()}`)
          },
          onChangAlign(value: 'left' | 'center' | 'right' | undefined) {
            value ? url.searchParams.set('a', `${value}`) : url.searchParams.delete('a')
            ctx.get(commandsCtx).call(ModifyImage, `${url.pathname}?${url.searchParams.toString()}`)
          },
        }).mount(actionBar)
      }

      render(node.attrs as any)
      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== NODE_ID)
            return false

          render(updatedNode.attrs as any)
          return true
        },
      }
    },
  }
})
