import 'iframe-resizer/js/iframeResizer.contentWindow.min.js'
import { useDebounceFn } from '@vueuse/core'
import * as Vue from 'vue'
import { listenBuildEvents } from '../build-event-listener'
import { useResizer } from '@/utils'

(<any>window).Vue = Vue

// @ts-expect-error import hfz after vue inited
import('@hyper-function/hfz-global')

const isEmbed = self !== top
const url = new URL(location.href)
let code = ''
const id = url.searchParams.get('id')
const name = url.searchParams.get('name')
const version = url.searchParams.get('version')

function parseCode(code: string) {
  const parsedCode = code.replace(
    new RegExp(`import:${name}="dev"`, 'g'),
    `import:${name}="${version}"`,
  )

  return parsedCode
}

const hfzContainer = document.getElementById('hfz-app')!
const hfzEditorContainer = document.getElementById('hfz-editor')!

function renderCode() {
  document.title = name!;

  (<any>window)[
    `$HFC_CDN_REWRITE_${name}_${version}`
  ] = `${location.origin}/hfm/`

  reloadCode()
}

function reloadCode() {
  const parsedCode = parseCode(code)

  hfzContainer.innerHTML = parsedCode
}

const onChangeCode = useDebounceFn((newCode: string) => {
  if (!isEmbed) {
    saveCode(newCode)
  }
  else {
    (window as any).parentIFrame.sendMessage({
      action: 'changeCode',
      data: {
        code: newCode,
      },
    })
  }

  code = newCode
  reloadCode()
}, 200)

async function saveCode(newCode: string) {
  const res = await fetch('/api/hfzView/code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      code: newCode,
      prevCode: code,
    }),
  }).then(res => res.json())

  if (res.err === 'OK')
    return

  if (res.err === 'PREV_CODE_NOT_MATCH') {
    location.reload()
    return
  }

  document.write('something wrong, please close this page and try again')
}

const editorPos: 'left' | 'bottom' = 'left'
function showEditorContainer() {
  const spliterElem = document.createElement('div')

  hfzEditorContainer.appendChild(spliterElem)
  hfzEditorContainer.style.display = 'block'

  let size = editorPos === 'left' ? window.innerWidth / 3 : window.innerHeight / 4

  function resizeEditor(offset: number) {
    if (editorPos === 'left') {
      hfzEditorContainer.style.right = 'auto'
      hfzEditorContainer.style.width = `${size + offset}px`
      hfzContainer.style.marginLeft = `${size + offset}px`
    }

    else {
      hfzEditorContainer.style.top = 'auto'
      hfzEditorContainer.style.height = `${size - offset}px`
      hfzContainer.style.marginBottom = `${size - offset}px`
    }
  }
  resizeEditor(0)

  useResizer(editorPos === 'left' ? 'right' : 'top', spliterElem, {
    onStart() {
      size = editorPos === 'left' ? parseInt(getComputedStyle(hfzEditorContainer).width) : parseInt(getComputedStyle(hfzEditorContainer).height)
    },
    onMove(offset) {
      resizeEditor(offset)
    },
  })
}

function showEditor() {
  const editorFrame = document.createElement('iframe')
  editorFrame.style.width = '100%'
  editorFrame.style.height = '100%'
  editorFrame.style.border = 'none'

  const frameId = Math.random().toString(36).substring(2)
  editorFrame.src = `/hfz-preview-editor.html?id=${frameId}&code=${encodeURIComponent(code)}`

  window.addEventListener('message', (event) => {
    if (event.data.from !== 'embedEditor' && event.data.id !== frameId)
      return

    if (event.data.action === 'changeCode')
      onChangeCode(event.data.data)
  })

  hfzEditorContainer.appendChild(editorFrame)
}

async function renderCodeWithId() {
  const codeRes = await fetch(`/api/hfzView/code?id=${id}`).then(res => res.json())

  if (codeRes.err !== 'OK') {
    document.write('unknow code')
    return
  }

  code = codeRes.code

  renderCode()

  setTimeout(() => {
    showEditor()
  }, 300)
}

if (!isEmbed) {
  showEditorContainer()
  renderCodeWithId()

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
        renderCode()
      }

      if (msg.action === 'reload')
        location.reload()
    },
  }
}
