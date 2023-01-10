<script setup lang="ts">
import type { editor } from 'monaco-editor'
import { useDebounceFn } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { usePropTypes } from '@/composables/usePropTypes'
const propEditor = ref<HTMLDivElement>()

type MonacoApi = typeof import('monaco-editor/esm/vs/editor/editor.api')
const { propTypes, fetchPropTypes, updatePropTypes, checkPropTypes } = usePropTypes()
const monacoApi = ref<MonacoApi>()
const monacoEditor = ref<editor.IStandaloneCodeEditor>()
const typePos = ref<Record<string, { start: { offset: number; line: number; column: number }; end: { offset: number; line: number; column: number } }>>({})

const onChangeCode = useDebounceFn(async (code: string) => {
  const checkRes = await checkPropTypes(code)
  const { editor } = monacoApi!.value!
  editor.removeAllMarkers('hfcpack')
  propEditor.value!.classList.remove('ring-2', 'ring-red-500', 'ring-yellow-500')

  if (checkRes.err === 'OK') {
    typePos.value = checkRes.typePos

    const { unkonwType } = checkRes
    const unkonwTypeMarkers: editor.IMarkerData[] = []

    Object.keys(unkonwType).forEach((key) => {
      const pos = unkonwType[key]
      unkonwTypeMarkers.push({
        startColumn: pos.start.column,
        startLineNumber: pos.start.line,
        endColumn: pos.end.column,
        endLineNumber: pos.end.line,
        message: `Unkonw type: ${key}`,
        severity: monacoApi.value!.MarkerSeverity.Error,
      })
    })

    if (unkonwTypeMarkers.length) {
      editor.setModelMarkers(
        monacoEditor.value!.getModel()!,
        'hfcpack',
        unkonwTypeMarkers,
      )

      propEditor.value!.classList.add('ring-2', 'ring-yellow-500')
    }
    else {
      updatePropTypes(code)
    }
  }
  else if (checkRes.err === 'SYNTAX_ERROR') {
    const { location, errmsg } = checkRes
    editor.setModelMarkers(
      monacoEditor.value!.getModel()!,
      'hfcpack',
      [{
        startColumn: location.start.column,
        startLineNumber: location.start.line,
        endColumn: location.end.column,
        endLineNumber: location.end.line,
        message: errmsg,
        severity: monacoApi.value!.MarkerSeverity.Error,
      }],
    )
    propEditor.value!.classList.add('ring-2', 'ring-red-600')
  }
  else {
    console.log('Unknown Error')
  }
}, 200)

const suggestions = computed(() => {
  const items = [
    {
      label: 'String',
      kind: monacoApi.value!.languages.CompletionItemKind.Snippet,
      insertText: 'String',
      detail: 'Type String',
    },
    {
      label: 'Int',
      kind: monacoApi.value!.languages.CompletionItemKind.Snippet,
      insertText: 'Int',
      detail: 'Type Int',
    },
    {
      label: 'Float',
      kind: monacoApi.value!.languages.CompletionItemKind.Snippet,
      insertText: 'Float',
      detail: 'Type Float',
    },
    {
      label: 'Boolean',
      kind: monacoApi.value!.languages.CompletionItemKind.Snippet,
      insertText: 'Boolean',
      detail: 'Type Boolean',
    },
    {
      label: 'Any',
      kind: monacoApi.value!.languages.CompletionItemKind.Snippet,
      insertText: 'Any',
      detail: 'Type Any',
    },
    {
      label: 'Ts',
      kind: monacoApi.value!.languages.CompletionItemKind.Snippet,
      insertText: 'Ts',
      detail: 'Type Ts',
    },
  ]

  Object.keys(typePos.value).forEach((key) => {
    items.push({
      label: key,
      kind: monacoApi.value!.languages.CompletionItemKind.Snippet,
      insertText: key,
      detail: `Type ${key}`,
    })
  })

  return items
})

function setupMonaco(monaco: MonacoApi) {
  monaco.languages.registerCompletionItemProvider('hfc', {
    // @ts-expect-error ts(2322)
    provideCompletionItems(model, position, context, token) {
      const line = model.getLineContent(position.lineNumber)
      if (line.includes(':')) {
        return {
          suggestions: suggestions.value,
        }
      }

      return {
        suggestions: [
          {
            label: 'model',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: ['model $1 {', '\t$0', '}'].join('\n'),
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: 'Model Snippet',
          },
        ],
      }
    },
  })

  monaco.languages.registerDefinitionProvider('hfc', {
    provideDefinition(model, position, token) {
      const line = model.getLineContent(position.lineNumber)
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1)
        return

      const match = line.match(/:(\s*)(\S+)/)
      if (!match)
        return

      const space = match[1]
      const typeName = match[2]

      const typePosInfo = typePos.value[typeName]
      if (!typePosInfo)
        return

      return {
        uri: model.uri,
        originSelectionRange: new monaco.Range(
          position.lineNumber,
          colonIndex + space.length + 2,
          position.lineNumber,
          colonIndex + space.length + 2 + typeName.length,
        ),
        range: new monaco.Range(
          typePosInfo.start.line,
          typePosInfo.start.column,
          typePosInfo.end.line,
          typePosInfo.end.column,
        ),
      }
    },
  })

  monaco.languages.registerHoverProvider('hfc', {
    provideHover(model, position, token) {
      const line = model.getLineContent(position.lineNumber)
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1)
        return

      const match = line.match(/:(\s*)(\S+)/)
      if (!match)
        return

      const space = match[1]
      const typeName = match[2]

      const typePosInfo = typePos.value[typeName]
      if (!typePosInfo)
        return

      const content = model.getValue()
      return {
        range: new monaco.Range(
          position.lineNumber,
          colonIndex + space.length + 2,
          position.lineNumber,
          colonIndex + space.length + 2 + typeName.length,
        ),
        contents: [
          {
            value: `\`\`\`hfc\n${content.slice(typePosInfo.start.offset, typePosInfo.end.offset)}\n\`\`\``,
          },
        ],
      }
    },
  })
}

const INIT_VALUE = `\
model Attr {

}

model Event {

}

model Slot {

}

model Method {

}
`

onMounted(async () => {
  await fetchPropTypes()
  import('../monaco').then(async ({ monaco, initMonaco, createEditor }) => {
    await initMonaco()
    monacoApi.value = monaco
    const editor = createEditor(propEditor.value!, {
      'value': propTypes.value || INIT_VALUE,
      'language': 'hfc',
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
      propEditor.value!.style.height = `${contentHeight + 2}px`
      editor.layout()
    }
    editor.onDidContentSizeChange(updateHeight)
    updateHeight()

    editor.onDidChangeModelContent(() => {
      const code = editor.getValue()
      onChangeCode(code)
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {

    })

    const code = editor.getValue()
    onChangeCode(code)

    setupMonaco(monaco)
  })
})
</script>

<template>
  <div>
    <div ref="propEditor" class="border min-h-[300px]" />
  </div>
</template>

<style scoped>

</style>
