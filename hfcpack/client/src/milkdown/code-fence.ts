/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, editorViewCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { setBlockType } from '@milkdown/prose/commands'
import { textblockTypeInputRule } from '@milkdown/prose/inputrules'
import { Fragment } from '@milkdown/prose/model'
import { createNode, createShortcut } from '@milkdown/utils'
import type { Node } from '@milkdown/prose/model'

import { SupportedKeys } from '@milkdown/preset-commonmark'

type Keys = SupportedKeys['CodeFence']

const languageOptions = [
  '',
  'hfz',
  'typescript',
  'javascript',
  'html',
  'css',
  'python',
  'java',
  'php',
  'go',
  'rust',
  // '',
  // 'javascript',
  // 'typescript',
  // 'bash',
  // 'sql',
  // 'json',
  // 'html',
  // 'css',
  // 'c',
  // 'cpp',
  // 'java',
  // 'ruby',
  // 'python',
  // 'go',
  // 'rust',
  // 'markdown',
]

export const backtickInputRegex = /^```(?<language>[a-z]*)?[\s\n]$/
export const tildeInputRegex = /^~~~(?<language>[a-z]*)?[\s\n]$/

export const TurnIntoCodeFence = createCmdKey('TurnIntoCodeFence')

const id = 'fence'
export const codeFence = createNode<Keys, { languageList?: string[] }>((utils, options) => {
  const languageList = options?.languageList || languageOptions

  return {
    id,
    schema: ctx => ({
      content: 'text*',
      group: 'block',
      marks: '',
      defining: true,
      code: true,
      attrs: {
        language: {
          default: '',
        },
        fold: {
          default: true,
        },
      },
      parseDOM: [
        {
          tag: 'div.code-fence-container',
          preserveWhitespace: 'full',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement))
              throw expectDomTypeError(dom)

            return { language: dom.querySelector('pre')?.dataset.language }
          },
          getContent: (dom, schema) => {
            if (!(dom instanceof HTMLElement))
              throw expectDomTypeError(dom)

            const text = dom.querySelector('pre')?.textContent ?? ''
            if (!text)
              return Fragment.empty

            const textNode = schema.text(text)
            return Fragment.from(textNode)
          },
        },
        {
          tag: 'pre',
          preserveWhitespace: 'full',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement))
              throw expectDomTypeError(dom)

            return { language: dom.dataset.language }
          },
        },
      ],
      toDOM: (node) => {
        const select = document.createElement('select')
        languageList.forEach((lang) => {
          const option = document.createElement('option')
          option.value = lang
          option.innerText = !lang ? '--' : lang
          if (lang === node.attrs.language)
            option.selected = true

          select.appendChild(option)
        })
        select.onchange = (e) => {
          const target = e.target
          if (!(target instanceof HTMLSelectElement))
            return

          const view = ctx.get(editorViewCtx)
          if (!view.editable) {
            target.value = node.attrs.language
            return
          }

          const { top, left } = target.getBoundingClientRect()
          const result = view.posAtCoords({ top, left })
          if (!result)
            return

          const { tr } = view.state

          view.dispatch(
            tr.setNodeMarkup(result.inside, undefined, {
              ...node.attrs,
              language: target.value,
            }),
          )
        }
        return [
          'div',
          {
            class: 'code-fence-container',
          },
          select,
          [
            'pre',
            {
              'data-language': node.attrs.language,
              'class': utils.getClassName(node.attrs, 'code-fence'),
            },
            ['code', { spellCheck: 'false' }, 0],
          ],
        ]
      },
      parseMarkdown: {
        match: ({ type }) => type === 'code',
        runner: (state, node, type) => {
          const language = node.lang as string
          const value = node.value as string
          state.openNode(type, { language })
          if (value)
            state.addText(value)

          state.closeNode()
        },
      },
      toMarkdown: {
        match: node => node.type.name === id,
        runner: (state, node) => {
          state.addNode('code', undefined, node.content.firstChild?.text || '', {
            lang: node.attrs.language,
          })
        },
      },
    }),
    inputRules: nodeType => [
      textblockTypeInputRule(backtickInputRegex, nodeType, (match) => {
        const [ok, language] = match
        if (!ok)
          return
        return { language }
      }),
      textblockTypeInputRule(tildeInputRegex, nodeType, (match) => {
        const [ok, language] = match
        if (!ok)
          return
        return { language }
      }),
    ],
    commands: nodeType => [createCmd(TurnIntoCodeFence, () => setBlockType(nodeType))],
    shortcuts: {
      [SupportedKeys.CodeFence]: createShortcut(TurnIntoCodeFence, 'Mod-Alt-c'),
    },
    view: () => (node, view, getPos) => {
      let currNode = node

      const onSelectLanguage = (language: string) => {
        const { tr } = view.state
        view.dispatch(
          tr.setNodeMarkup(getPos(), undefined, {
            fold: true,
            language,
          }),
        )
      }
      const onBlur = () => {
        const { tr } = view.state

        view.dispatch(
          tr.setNodeMarkup(getPos(), undefined, {
            ...currNode.attrs,
            fold: true,
          }),
        )
      }

      const container = document.createElement('pre')
      container.style.position = 'relative'

      const select = document.createElement('select')
      select.className = 'code-fence-select'
      languageList.forEach((lang) => {
        const option = document.createElement('option')
        option.value = lang
        option.innerText = !lang ? '--' : lang
        if (lang === node.attrs.language)
          option.selected = true

        select.appendChild(option)
      })

      container.append(select)

      const code = document.createElement('code')
      code.spellcheck = false
      container.append(code)

      container.classList.add('code-fence')

      select.onchange = (e) => {
        const target = e.target
        if (!(target instanceof HTMLSelectElement))
          return

        if (!view.editable) {
          target.value = node.attrs.language
          return
        }

        const { top, left } = target.getBoundingClientRect()
        const result = view.posAtCoords({ top, left })
        if (!result)
          return

        onSelectLanguage(target.value)
      }

      const onClickOutside = () => {
        if (!view.editable || select.dataset.fold === 'true')
          return

        onBlur()
      }
      document.addEventListener('mousedown', onClickOutside)

      languageList.forEach((lang) => {
        const option = document.createElement('li')
        option.className = 'code-fence_selector-list-item'
        option.innerText = lang || '--'
        select.appendChild(option)
        option.setAttribute('data-value', lang)
      })

      const onUpdate = (node: Node) => {
        container.dataset.language = node.attrs.language
        select.value = node.attrs.language || '--'
        select.setAttribute('data-fold', node.attrs.fold ? 'true' : 'false')
      }

      const onDestroy = () => {
        container.remove()
        document.removeEventListener('mousedown', onClickOutside)
      }

      onUpdate(currNode)

      return {
        dom: container,
        contentDOM: code,
        update: (updatedNode) => {
          if (updatedNode.type.name !== id)
            return false
          currNode = updatedNode
          onUpdate(currNode)

          return true
        },
        destroy: onDestroy,
      }
    },
  }
})
