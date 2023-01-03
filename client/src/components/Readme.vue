<script setup lang="ts">
import type { Editor } from '@milkdown/core'
import { defaultValueCtx, editorViewCtx, rootCtx, serializerCtx } from '@milkdown/core'
import { listenerCtx } from '@milkdown/plugin-listener'
import { createApp, ref, watch } from 'vue'
import { replaceAll } from '@milkdown/utils'
import { refractor } from 'refractor'
import { toHtml } from 'hast-util-to-html'
import { createMilkdownEditor } from '../milkdown'
import type { HfzViewCode } from '../milkdown/hfz-view'
import HfzView from './HfzView.vue'
import { useDocMd } from '@/composables/useDocMd'
import { useManifest } from '@/composables/useManifest'

const { manifest } = useManifest()
const { docMd, updateDocMd } = useDocMd()

const codeMap: HfzViewCode = new Map()

const milkdownEditor = ref<Editor>()
function saveMd() {
  milkdownEditor.value!.action((ctx) => {
    const editorView = ctx.get(editorViewCtx)
    const serializer = ctx.get(serializerCtx)
    const md = serializer(editorView.state.doc)
    updateDocMd(md)
  })
}

const docContainer = ref<HTMLDivElement | null>(null)
watch(() => docMd.value, async () => {
  if (milkdownEditor.value) {
    milkdownEditor.value.action(replaceAll(docMd.value.content))
    return
  }

  const editor = await createMilkdownEditor((ctx) => {
    ctx.set(rootCtx, docContainer.value!)
    ctx.set(
      defaultValueCtx,
      docMd.value.content,
    )

    ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
      updateDocMd(markdown)
    })
  }, codeMap, renderHfzView)

  milkdownEditor.value = editor
})

function renderHfzView(id: string, container: HTMLDivElement) {
  const { name, version } = manifest.value!

  const code = codeMap.get(id)!
  if (!code.value) {
    code.value = `\
<template hfz import:${name}="dev">
  <${name}></${name}>
</template>
`
  }

  container.classList.add('hfz-view')

  const codeContainer = document.createElement('div')
  codeContainer.style.position = 'relative'
  codeContainer.style.borderRadius = '4px'
  codeContainer.style.overflow = 'hidden'

  const pre = document.createElement('pre')
  pre.style.margin = '1em 0'
  pre.style.maxHeight = '400px'
  pre.style.overflowY = 'hidden'

  const codeHighlightBlock = document.createElement('code')
  codeHighlightBlock.classList.add('language-hfz')

  const showHighlightCode = () => {
    const tree = refractor.highlight(code.value, 'html')
    codeHighlightBlock.innerHTML = toHtml(tree)
  }

  showHighlightCode()

  pre.appendChild(codeHighlightBlock)

  setTimeout(() => {
    renderCodeCollapse(pre)
  }, 0)

  codeContainer.innerHTML = ''
  codeContainer.appendChild(pre)

  createApp(HfzView, {
    id,
    codeMap,
    onChangeCode(id: string, newCode: string) {
      saveMd()
      showHighlightCode()
    },
    onDelete(id: string) {
      milkdownEditor.value!.action((ctx) => {
        const editorView = ctx.get(editorViewCtx)

        editorView.state.doc.forEach((node, offset) => {
          if (node.type.name === 'hfz_view' && node.attrs.id === id) {
            editorView.dispatch(
              editorView.state.tr.delete(offset, offset + node.nodeSize),
            )
          }
        })
      })
    },
  }).mount(container)
  container.append(codeContainer)
}

function renderCodeCollapse(elem: HTMLPreElement) {
  const height = parseInt(getComputedStyle(elem).height)
  if (height < 400)
    return

  const collapse = document.createElement('template')
  collapse.innerHTML = `
      <div
        class="absolute bottom-0 left-0 right-0 flex flex-col"
      >
        <div id="mask" style="height: 90px; background: linear-gradient(transparent, var(--tw-prose-pre-bg))" ></div>
        <div
          id="btn"
          style="background-color: var(--tw-prose-pre-bg)"
          class="flex justify-center items-center h-9 text-gray-400 hover:text-gray-200 cursor-pointer select-none"
        >
        </div>
      </div>
    `

  const mask = collapse.content.getElementById('mask')!
  mask.removeAttribute('id')

  const openSvg = '<svg width="24" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59L12 13.17L7.41 8.59L6 10l6 6l6-6z"/></svg></span>'
  const closeSvg = '<svg width="24" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="m12 8l-6 6l1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg>'
  const btn = collapse.content.getElementById('btn')!
  btn.removeAttribute('id')
  btn.innerHTML = openSvg

  let isOpen = false
  btn.addEventListener('click', () => {
    isOpen = !isOpen
    elem.style.maxHeight = isOpen ? 'none' : '400px'
    mask.style.display = isOpen ? 'none' : 'block'
    btn.innerHTML = isOpen ? closeSvg : openSvg
  })

  elem.appendChild(collapse.content)
}
</script>

<template>
  <div ref="docContainer" class="prose prose-slate lg:prose-lg" />
</template>

<style>
.milkdown {
  min-height: 500px;
}
.prose li p {
  margin: 0;
}

.prose .task-list-item {
  display: flex;
}

.prose .task-list-item>input[type="checkbox"] {
  appearance: none;
  align-self: center;
  width: 1.15em;
  height: 1.15em;
  border: 0.15em solid #334155;
  border-radius: 0.15em;
  flex-shrink: 0;
  display: grid;
  place-content: center;
  margin: 0;
  margin-right: 1em;
}

.prose .task-list-item>input[type="checkbox"]::before {
  content: "";
  width: 0.65em;
  height: 0.65em;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  transform: scale(0);
  transform-origin: bottom left;
  transition: 120ms transform ease-in-out;
  box-shadow: inset 1em 1em #334155;
  /* Windows High Contrast Mode */
  background-color: CanvasText;
}

.prose .task-list-item>input[type="checkbox"]:checked::before {
  transform: scale(1);
}

.prose .task-list-item>input[type="checkbox"]:focus {
  outline: max(2px, 0.15em) solid #334155;
  outline-offset: max(2px, 0.15em);
}

.prose .task-list-item>input[type="checkbox"]:disabled {
  color: #959495;
  cursor: not-allowed;
}

.prose .code-fence .code-fence-select {
  position: absolute !important;
  top: 1em;
  right: 18px;
  appearance: none;
  margin: 0;
  width: 150px;
  font-size: 16px;
  text-transform: uppercase;

  z-index: 1;
  outline: none;

  display: grid;
  grid-template-areas: "select";
  align-items: center;
  position: relative;

  color: #334155;
  background-color: #fff;
  background-image: linear-gradient(to top, #f9f9f9, #fff 33%);
  border: 1px solid #777;
  border-radius: 0.25em;
  padding: 0.25em 0.5em;

  cursor: pointer;
  line-height: 1.1;
}

.prose .code-fence .code-fence-select:after {
  grid-area: select;
  content: "";
  justify-self: end;
  width: 0.8em;
  height: 0.5em;
  background-color: #777;
  clip-path: polygon(100% 0%, 0 0%, 50% 100%);
}

.prose .md-image {
  margin: 1.8em 0;
}

.prose .md-image img {
  margin: 0;
}
</style>
