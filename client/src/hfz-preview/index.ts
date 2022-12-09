import 'iframe-resizer/js/iframeResizer.contentWindow.min.js'
import { useDebounceFn } from '@vueuse/core'
import { listenBuildEvents } from '../build-event-listener'
import { useSpliter } from '@/utils'

import('vue').then((Vue) => {
  (<any>window).Vue = Vue

  // @ts-expect-error import hfz after vue inited
  import('@hyper-function/hfz-global')
})

const isEmbed = self !== top
// const url = new URL(location.href)
let code = ''
let name = ''
let version = ''

function parseCode(code: string) {
  const parsedCode = code.replace(
    new RegExp(`import:${name}="dev`, 'g'),
    `import:${name}="${version}`,
  )

  return parsedCode
}

function encodeInfoToUrlHash() {
  return btoa(encodeURIComponent(JSON.stringify({ code, name, version })))
}

function decodeInfoFromUrlHash() {
  const data = JSON.parse(decodeURIComponent(atob(location.hash.slice(1))))
  return data
}

const hfzContainer = document.getElementById('hfz-app')!
function renderCode() {
  document.title = name;

  (<any>window)[
    `$HFC_CDN_REWRITE_${name}_${version}`
  ] = `${location.origin}/hfm/`

  reloadCode()
}

function reloadCode() {
  const parsedCode = parseCode(code)

  hfzContainer.innerHTML = parsedCode
}

const onChangeCode = useDebounceFn(() => {
  reloadCode()

  if (!isEmbed) {
    location.hash = encodeInfoToUrlHash()
  }
  else {
    (window as any).parentIFrame.sendMessage({
      action: 'changeCode',
      data: {
        code,
      },
    })
  }
}, 200)

function openInNewTab() {
  window.open(`${location.origin}/hfz-preview.html#${encodeInfoToUrlHash()}`, '_blank')
}

// const editorOpened = false
function showEditor() {
  const container = document.getElementById('hfz-editor')!
  const spliterElem = document.createElement('div')
  const editorElem = document.createElement('div')

  container.appendChild(spliterElem)
  container.appendChild(editorElem)

  const containerHeight = 300
  container.style.height = `${containerHeight}px`
  container.style.borderTop = '1px solid #e5e7eb'
  useSpliter('top', spliterElem, (offset) => {
    const height = containerHeight - offset
    container.style.height = `${height}px`
    hfzContainer.style.marginBottom = `${height + 20}px`
  })

  hfzContainer.style.marginBottom = `${containerHeight + 20}px`
  editorElem.style.height = '100%'
  import('../monaco').then(({ monaco, initMonaco, createEditor }) => {
    initMonaco().then(() => {
      const editor = createEditor(editorElem, {
        value: code,
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
        code = editor.getValue()
        onChangeCode()
      })

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        console.log('SAVE pressed!')
      })
    })
  })
}

if (!isEmbed) {
  const data = decodeInfoFromUrlHash()
  code = data.code
  name = data.name
  version = data.version

  renderCode()
  setTimeout(() => {
    showEditor()
  }, 500)

  listenBuildEvents((data) => {
    if (data.action === 'rebuild-complete')
      location.reload()
  })
}
else {
  (window as any).iFrameResizer = {
    onMessage(msg: any) {
      if (msg.action === 'render') {
        code = msg.data.code
        name = msg.data.name
        version = msg.data.version
        renderCode()
        if (msg.data.showEditor)
          showEditor()
      }

      if (msg.action === 'reload')
        location.reload()

      if (msg.action === 'openInNewTab')
        openInNewTab()

      if (msg.action === 'showEditor')
        showEditor()
    },
  }
}
