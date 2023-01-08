<script setup lang="ts">
// @ts-expect-error no types from this pkg
import { iframeResize } from 'iframe-resizer'
import { onMounted, ref, watch } from 'vue'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'
import { refractor } from 'refractor'
import { toHtml } from 'hast-util-to-html'
import type { HfzViewCode } from '@/milkdown/hfz-view'
import { useResizer } from '@/utils'
import { useManifest } from '@/composables/useManifest'
import { useBuildEvent } from '@/composables/useBuildEvent'

const props = defineProps<{
  id: string
  codeMap: HfzViewCode
  onDelete: (id: string) => void
  onChangeCode: (id: string) => void
}>()

const { manifest } = useManifest()

const code = props.codeMap.get(props.id)!
const codeText = ref(code.value)
const darkMode = ref(code.darkMode)
const showEditor = ref(false)

const sandbox = ref<HTMLIFrameElement | null>(null)

const previewUrl = new URL('/hfz-preview.html', location.origin)
previewUrl.searchParams.set('id', props.id)
previewUrl.searchParams.set('name', manifest.value!.name)
previewUrl.searchParams.set('version', manifest.value!.version)

const previewContainer = ref<HTMLDivElement | null>(null)
const hfzEditorContainer = ref<HTMLDivElement | null>(null)
const codeHighlightContainer = ref<HTMLDivElement | null>(null)

const { buildEvent } = useBuildEvent()
watch(() => buildEvent.value, () => {
  if (buildEvent.value.action === 'rebuild-complete')
    sendMessageToSandbox({ action: 'reload' })
})

onMounted(() => {
  setupSandbox()
  setupResizer()

  highlightCode()
})

function highlightCode() {
  if (!codeHighlightContainer.value)
    return

  const tree = refractor.highlight(codeText.value, 'html')
  codeHighlightContainer.value.innerHTML = toHtml(tree)
  setTimeout(() => {
    renderCodeCollapse(codeHighlightContainer.value!.parentElement!)
  }, 0)
}

function sendMessageToSandbox(msg: { action: string; data?: any }) {
  (sandbox.value as any).iFrameResizer.sendMessage(msg)
}

function onOpen() {
  window.open(previewUrl.toString(), '_blank')
}

function onReload() {
  sendMessageToSandbox({ action: 'reload' })
}

function onDelete() {
  props.onDelete(props.id)
}

function toggleEdit() {
  if (showEditor.value) {
    showEditor.value = false
    setTimeout(() => {
      highlightCode()
    }, 0)
    return
  }

  showEditor.value = true
  setTimeout(() => {
    const editorFrame = document.createElement('iframe')
    editorFrame.style.height = '400px'
    editorFrame.style.borderBottomLeftRadius = '4px'
    editorFrame.style.borderBottomRightRadius = '4px'

    const frameId = Math.random().toString(36).substring(2)
    editorFrame.src = `/hfz-preview-editor.html?id=${frameId}&code=${encodeURIComponent(codeText.value)}`

    const onCodeChange = useDebounceFn((newCode: string) => {
      code.value = newCode
      codeText.value = newCode
      sendMessageToSandbox({ action: 'reload' })

      props.onChangeCode(props.id)
    }, 250)

    window.addEventListener('message', (event) => {
      if (event.data.from !== 'embedEditor' || event.data.id !== frameId)
        return

      if (event.data.action === 'changeCode')
        onCodeChange(event.data.data)
    })

    hfzEditorContainer.value!.appendChild(editorFrame)
  }, 0)
}

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  code.darkMode = darkMode.value
  props.onChangeCode(props.id)

  sendMessageToSandbox({
    action: 'setDarkMode',
    data: {
      darkMode: code.darkMode,
    },
  })
}

function setupSandbox() {
  let sandboxHeight = code.minHeight || 60
  sandbox.value!.src = previewUrl.toString()

  iframeResize(
    {
      log: false,
      sizeHeight: false,
      checkOrigin: false,
      minHeight: sandboxHeight,
      heightCalculationMethod: 'grow',
      onInit() {
        sendMessageToSandbox({
          action: 'setDarkMode',
          data: {
            darkMode: code.darkMode,
          },
        })

        sendMessageToSandbox({
          action: 'render',
          data: {
            code: codeText.value,
          },
        })
      },
      onResized(res: any) {
        if (res.height < 60)
          return
        sandboxHeight = parseInt(res.height)
        sandbox.value!.style.height = `${sandboxHeight}px`
      },
      onMessage: ({ message }: { message: { action: string; data: any } }) => {

      },
    },
    sandbox.value,
  )
}

function setupResizer() {
  const bottomResizerElem = document.createElement('div')
  previewContainer.value!.appendChild(bottomResizerElem)

  let _height = 0
  useResizer('bottom', bottomResizerElem, {
    onMove: useThrottleFn((offset: number) => {
      sandbox.value!.style.height = `${_height + offset}px`
    }, 10),
    onStart() {
      _height = parseInt(getComputedStyle(sandbox.value!).height)
    },
  })

  const rightResizerElem = document.createElement('div')
  previewContainer.value!.appendChild(rightResizerElem)

  let _width = 0
  useResizer('right', rightResizerElem, {
    onMove: useThrottleFn((offset: number) => {
      previewContainer.value!.style.width = `${_width + offset}px`
    }, 10),
    onStart() {
      _width = parseInt(getComputedStyle(previewContainer.value!).width)
    },
  })
}

function renderCodeCollapse(pre: HTMLElement) {
  const height = parseInt(getComputedStyle(pre).height)
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
    pre.style.maxHeight = isOpen ? 'none' : '400px'
    mask.style.display = isOpen ? 'none' : 'block'
    btn.innerHTML = isOpen ? closeSvg : openSvg
  })

  pre.appendChild(collapse.content)
  pre.style.paddingBottom = '2.25rem'
}
</script>

<template>
  <div ref="previewContainer" class="preview relative rounded">
    <iframe
      ref="sandbox" class="rounded"
      sandbox="allow-same-origin allow-popups allow-modals allow-forms allow-pointer-lock allow-scripts allow-top-navigation-by-user-activation"
    />
  </div>
  <div class="mt-5 mb-10 rounded-md">
    <div class="action-bar flex rounded-t-md overflow-hidden bg-slate-700">
      <button
        class="flex items-center justify-center p-2 h-9 w-9 text-slate-300 hover:text-slate-100"
        title="Reload" @click="onReload"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M2 12a9 9 0 0 0 9 9c2.39 0 4.68-.94 6.4-2.6l-1.5-1.5A6.706 6.706 0 0 1 11 19c-6.24 0-9.36-7.54-4.95-11.95C10.46 2.64 18 5.77 18 12h-3l4 4h.1l3.9-4h-3a9 9 0 0 0-18 0Z"
          />
        </svg>
      </button>

      <button
        class="flex items-center justify-center p-2 h-9 w-9 text-slate-300 hover:text-slate-100"
        title="Show Editor" @click="toggleEdit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M5 19h1.4l8.625-8.625l-1.4-1.4L5 17.6ZM19.3 8.925l-4.25-4.2l1.4-1.4q.575-.575 1.413-.575q.837 0 1.412.575l1.4 1.4q.575.575.6 1.388q.025.812-.55 1.387ZM4 21q-.425 0-.712-.288Q3 20.425 3 20v-2.825q0-.2.075-.387q.075-.188.225-.338l10.3-10.3l4.25 4.25l-10.3 10.3q-.15.15-.337.225q-.188.075-.388.075ZM14.325 9.675l-.7-.7l1.4 1.4Z"
          />
        </svg>
      </button>

      <button
        class="flex items-center justify-center p-2 h-9 w-9 text-slate-300 hover:text-slate-100" title="Dark Mode"
        @click="toggleDarkMode"
      >
        <svg
          v-if="darkMode" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 21q-3.775 0-6.388-2.613Q3 15.775 3 12q0-3.45 2.25-5.988Q7.5 3.475 11 3.05q.625-.075.975.45t-.025 1.1q-.425.65-.638 1.375Q11.1 6.7 11.1 7.5q0 2.25 1.575 3.825Q14.25 12.9 16.5 12.9q.775 0 1.538-.225q.762-.225 1.362-.625q.525-.35 1.075-.038q.55.313.475.988q-.35 3.45-2.937 5.725Q15.425 21 12 21Zm0-2q2.2 0 3.95-1.212q1.75-1.213 2.55-3.163q-.5.125-1 .2q-.5.075-1 .075q-3.075 0-5.238-2.162Q9.1 10.575 9.1 7.5q0-.5.075-1t.2-1q-1.95.8-3.162 2.55Q5 9.8 5 12q0 2.9 2.05 4.95Q9.1 19 12 19Zm-.25-6.75Z"
          />
        </svg>
        <svg
          v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 15q1.25 0 2.125-.875T15 12q0-1.25-.875-2.125T12 9q-1.25 0-2.125.875T9 12q0 1.25.875 2.125T12 15Zm0 2q-2.075 0-3.537-1.463Q7 14.075 7 12t1.463-3.538Q9.925 7 12 7t3.538 1.462Q17 9.925 17 12q0 2.075-1.462 3.537Q14.075 17 12 17ZM2 13q-.425 0-.712-.288Q1 12.425 1 12t.288-.713Q1.575 11 2 11h2q.425 0 .713.287Q5 11.575 5 12t-.287.712Q4.425 13 4 13Zm18 0q-.425 0-.712-.288Q19 12.425 19 12t.288-.713Q19.575 11 20 11h2q.425 0 .712.287q.288.288.288.713t-.288.712Q22.425 13 22 13Zm-8-8q-.425 0-.712-.288Q11 4.425 11 4V2q0-.425.288-.713Q11.575 1 12 1t.713.287Q13 1.575 13 2v2q0 .425-.287.712Q12.425 5 12 5Zm0 18q-.425 0-.712-.288Q11 22.425 11 22v-2q0-.425.288-.712Q11.575 19 12 19t.713.288Q13 19.575 13 20v2q0 .425-.287.712Q12.425 23 12 23ZM5.65 7.05L4.575 6q-.3-.275-.288-.7q.013-.425.288-.725q.3-.3.725-.3t.7.3L7.05 5.65q.275.3.275.7q0 .4-.275.7q-.275.3-.687.287q-.413-.012-.713-.287ZM18 19.425l-1.05-1.075q-.275-.3-.275-.712q0-.413.275-.688q.275-.3.688-.287q.412.012.712.287L19.425 18q.3.275.288.7q-.013.425-.288.725q-.3.3-.725.3t-.7-.3ZM16.95 7.05q-.3-.275-.287-.688q.012-.412.287-.712L18 4.575q.275-.3.7-.288q.425.013.725.288q.3.3.3.725t-.3.7L18.35 7.05q-.3.275-.7.275q-.4 0-.7-.275ZM4.575 19.425q-.3-.3-.3-.725t.3-.7l1.075-1.05q.3-.275.713-.275q.412 0 .687.275q.3.275.288.688q-.013.412-.288.712L6 19.425q-.275.3-.7.287q-.425-.012-.725-.287ZM12 12Z"
          />
        </svg>
      </button>

      <button
        class="flex items-center justify-center p-2 h-9 w-9 text-slate-300 hover:text-slate-100" title="Delete"
        @click="onDelete"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"
          />
        </svg>
      </button>

      <div class="flex-1" />

      <button
        class="flex items-center justify-center p-2 h-9 w-9 text-slate-300 hover:text-slate-100"
        title="Open In New Tab" @click="onOpen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h6q.425 0 .713.287Q12 3.575 12 4t-.287.712Q11.425 5 11 5H5v14h14v-6q0-.425.288-.713Q19.575 12 20 12t.712.287Q21 12.575 21 13v6q0 .825-.587 1.413Q19.825 21 19 21Zm4-6q-.275-.275-.275-.7q0-.425.275-.7L17.6 5H15q-.425 0-.712-.288Q14 4.425 14 4t.288-.713Q14.575 3 15 3h5q.425 0 .712.287Q21 3.575 21 4v5q0 .425-.288.712Q20.425 10 20 10t-.712-.288Q19 9.425 19 9V6.4l-8.625 8.625q-.275.275-.675.275T9 15Z"
          />
        </svg>
      </button>
    </div>

    <div v-if="showEditor" ref="hfzEditorContainer" />
    <pre v-else class="flex relative overflow-y-hidden max-h-[400px] !rounded-t-none !m-0">
      <code ref="codeHighlightContainer" class="language-hfz" />
    </pre>
  </div>
</template>

<style>
.hfz-view .preview {
  box-shadow: 0 0 0 1px #ebecf0;
}

.hfz-view iframe {
  width: 100%;
  border: none;
  height: 60px;
  background: white;
}
</style>
