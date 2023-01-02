<script setup lang="ts">
// @ts-expect-error no types from this pkg
import { iframeResize } from 'iframe-resizer'
import { onMounted, ref, watch } from 'vue'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'
import type { HfzViewCode } from '@/milkdown/hfz-view'
import { useResizer } from '@/utils'
import { useManifest } from '@/composables/useManifest'
import { useBuildEvent } from '@/composables/useBuildEvent'

const props = defineProps<{
  id: string
  codeMap: HfzViewCode
  onDelete: (id: string) => void
  onChangeCode: (id: string, code: string) => void
}>()

const { manifest } = useManifest()

const code = props.codeMap.get(props.id)!
const sandbox = ref<HTMLIFrameElement | null>(null)

const previewUrl = new URL('/hfz-preview.html', location.origin)
previewUrl.searchParams.set('id', props.id)
previewUrl.searchParams.set('name', manifest.value!.name)
previewUrl.searchParams.set('version', manifest.value!.version)

const previewContainer = ref<HTMLDivElement | null>(null)
const hfzEditorContainer = ref<HTMLDivElement | null>(null)

const { buildEvent } = useBuildEvent()
watch(() => buildEvent.value, () => {
  if (buildEvent.value.action === 'rebuild-complete')
    sendMessageToSandbox({ action: 'reload' })
})

onMounted(() => {
  setupSandbox()
  setupResizer()
})

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
  if (hfzEditorContainer.value!.innerHTML !== '') {
    hfzEditorContainer.value!.innerHTML = ''
    return
  }

  const editorFrame = document.createElement('iframe')
  editorFrame.style.margin = '1em 0'
  editorFrame.style.height = '400px'
  editorFrame.style.borderRadius = '4px'

  const frameId = Math.random().toString(36).substring(2)
  editorFrame.src = `/hfz-preview-editor.html?id=${frameId}&code=${encodeURIComponent(code.value)}`

  const onCodeChange = useDebounceFn((newCode: string) => {
    code.value = newCode
    sendMessageToSandbox({ action: 'reload' })

    props.onChangeCode(props.id, newCode)
  }, 250)

  window.addEventListener('message', (event) => {
    if (event.data.from !== 'embedEditor' || event.data.id !== frameId)
      return

    if (event.data.action === 'changeCode')
      onCodeChange(event.data.data)
  })

  hfzEditorContainer.value!.appendChild(editorFrame)
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
          action: 'render',
          data: {
            code: code.value,
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
</script>

<template>
  <div ref="previewContainer" class="relative flex flex-col rounded" style="box-shadow: 0 0 0 1px #ebecf0;">
    <div class="flex-1">
      <iframe
        ref="sandbox" class="rounded-t"
        sandbox="allow-same-origin allow-popups allow-modals allow-forms allow-pointer-lock allow-scripts allow-top-navigation-by-user-activation"
      />
    </div>
    <div class="flex overflow-hidden rounded-b bg-slate-50">
      <button
        class="flex items-center justify-center p-2 text-slate-500 h-9 w-9 hover:text-slate-900" title="Reload"
        @click="onReload"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M2 12a9 9 0 0 0 9 9c2.39 0 4.68-.94 6.4-2.6l-1.5-1.5A6.706 6.706 0 0 1 11 19c-6.24 0-9.36-7.54-4.95-11.95C10.46 2.64 18 5.77 18 12h-3l4 4h.1l3.9-4h-3a9 9 0 0 0-18 0Z"
          />
        </svg>
      </button>

      <button
        class="flex items-center justify-center p-2 text-slate-500 h-9 w-9 hover:text-slate-900"
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
        class="flex items-center justify-center p-2 text-slate-500 h-9 w-9 hover:text-slate-900" title="Delete"
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
        class="flex items-center justify-center p-2 text-slate-500 h-9 w-9 hover:text-slate-900"
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
  </div>

  <div ref="hfzEditorContainer" />
</template>
