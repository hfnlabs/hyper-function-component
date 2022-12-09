<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { editor } from 'monaco-editor'
import { useDebounceFn } from '@vueuse/core'
import { useCssVars } from '@/composables/useCssVars'
import { Toast } from '@/components/Toast'

type MonacoApi = typeof import('monaco-editor/esm/vs/editor/editor.api')
const monacoApi = ref<MonacoApi>()
const monacoEditor = ref<editor.IStandaloneCodeEditor>()
const { cssVars, fetchCssVars, updateCssVars } = useCssVars()
const cssEditor = ref<HTMLDivElement>()

const onChangeCode = useDebounceFn(async (code: string) => {
  const res = await updateCssVars(code)
  cssEditor.value!.classList.remove('ring-2', 'ring-red-500')
  if (res.err !== 'OK') {
    console.log(res.errmsg)
    cssEditor.value!.classList.add('ring-2', 'ring-red-500')
  }
})

function setupMonaco(monaco: MonacoApi) {}

onMounted(async () => {
  await fetchCssVars()
  import('../monaco').then(async ({ monaco, initMonaco, createEditor }) => {
    await initMonaco()
    monacoApi.value = monaco
    const editor = createEditor(cssEditor.value!, {
      'value': cssVars.value,
      'language': 'css',
      'theme': 'vs-dark',
      'contextmenu': false,
      'bracketPairColorization': {
        enabled: true,
      },
      'scrollbar': { alwaysConsumeMouseWheel: false },
      // @ts-expect-error missing in type
      'bracketPairColorization.enabled': true,
      'scrollBeyondLastLine': false,
      'fontSize': 14,
      'tabSize': 2,
      'folding': true,
      'wordWrap': 'on',
      'wrappingStrategy': 'advanced',
      'minimap': {
        enabled: false,
      },
      'padding': {
        top: 8,
        bottom: 8,
      },
      'overviewRulerLanes': 0,
    })

    monacoEditor.value = editor

    const updateHeight = () => {
      const contentHeight = Math.max(500, editor.getContentHeight())
      cssEditor.value!.style.height = `${contentHeight + 2}px`
      editor.layout()
    }
    editor.onDidContentSizeChange(updateHeight)
    updateHeight()

    editor.onDidChangeModelContent(() => {
      const code = editor.getValue()
      onChangeCode(code)
    })

    const code = editor.getValue()
    onChangeCode(code)

    setupMonaco(monaco)
  })
})
</script>

<template>
  <div>
    <div class="text-xl font-semibold py-2">
      Css Variables
    </div>
    <div>
      <div ref="cssEditor" class="border min-h-[300px]" />
    </div>
  </div>
</template>
