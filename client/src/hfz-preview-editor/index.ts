import { createEditor, initMonaco, monaco } from '../monaco'

const url = new URL(location.href);
(async () => {
  await initMonaco()
  const container = document.getElementById('hfz-editor')!
  const editor = createEditor(container, {
    value: decodeURIComponent(url.searchParams.get('code') || ''),
    language: 'html',
    theme: 'vs-dark',
    automaticLayout: true,
    contextmenu: false,
    bracketPairColorization: {
      enabled: true,
    },
    scrollbar: { alwaysConsumeMouseWheel: false },
    // 'bracketPairColorization.enabled': true,
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    lineNumbers: 'off',
    glyphMargin: false,
    folding: true,
    // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
    // 'lineDecorationsWidth': 0,
    // 'lineNumbersMinChars': 0,
    minimap: {
      enabled: false,
    },
    padding: {
      top: 8,
      bottom: 8,
    },
  })
  editor.onDidChangeModelContent(() => {
    const code = editor.getValue()
    parent.postMessage({
      from: 'embedEditor',
      id: url.searchParams.get('id'),
      action: 'changeCode',
      data: code,
    }, '*')
  })

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {

  })
})()
