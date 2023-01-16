<script setup lang="ts">
import type { Editor } from '@milkdown/core'
import { defaultValueCtx, editorViewCtx, rootCtx, serializerCtx } from '@milkdown/core'
import { listenerCtx } from '@milkdown/plugin-listener'
import { createApp, ref, watch } from 'vue'
import { replaceAll } from '@milkdown/utils'
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
  <div class="flex justify-center mt-6">
    <${name}></${name}>
  </div>
</template>
`
  }

  container.classList.add('hfz-view')

  createApp(HfzView, {
    id,
    codeMap,
    onChangeCode(id: string) {
      saveMd()
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
