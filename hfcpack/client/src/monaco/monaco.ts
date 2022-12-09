import 'monaco-editor/esm/vs/editor/editor.all.js'

import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js'
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js'

import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/css/css.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution.js'

import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'
import 'monaco-editor/esm/vs/language/css/monaco.contribution'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import 'monaco-editor/esm/vs/language/html/monaco.contribution'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { createOnigScanner, createOnigString, loadWASM } from 'vscode-oniguruma'

import { emmetHTML } from 'emmet-monaco-es'

// @ts-expect-error - missing in types
import onigurumaUrl from 'vscode-oniguruma/release/onig.wasm?url'
// @ts-expect-error - missing in types
import cssGrammarUrl from './grammars/css.tmLanguage.json?url'
// @ts-expect-error - missing in types
import htmlGrammarUrl from './grammars/html.tmLanguage.json?url'
// @ts-expect-error - missing in types
import javascriptGrammarUrl from './grammars/javascript.tmLanguage.json?url'
// @ts-expect-error - missing in types
import hfcGrammarUrl from './grammars/hfc.tmLanguage.json?url'

import type { ScopeName, ScopeNameInfo, TextMateGrammar } from './providers'
import { SimpleLanguageInfoProvider } from './providers'
import type { LanguageId } from './register'
import { registerLanguages } from './register'
import theme from './theme'

let provider: SimpleLanguageInfoProvider
let inited = false
export async function initMonaco() {
  if (inited)
    return
  inited = true

  monaco.languages.register({ id: 'hfc' })

  monaco.languages.setLanguageConfiguration('hfc', {
    comments: {
      lineComment: '//',
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    folding: {
      offSide: true,
    },
  })

  const languages: monaco.languages.ILanguageExtensionPoint[] = [
    {
      id: 'html',
      aliases: ['vue', 'hfz'],
      extensions: ['.html', '.vue', '.hfz'],
    },
    {
      id: 'javascript',
      extensions: ['.js'],
    },
    {
      id: 'css',
      extensions: ['.css'],
    },
    {
      id: 'hfc',
      extensions: ['.hfc'],
    },
  ]

  const grammars: { [scopeName: string]: ScopeNameInfo } = {
    'text.html.basic': {
      language: 'html',
      path: htmlGrammarUrl,
    },
    'source.js': {
      language: 'javascript',
      path: javascriptGrammarUrl,
    },
    'source.css': {
      language: 'css',
      path: cssGrammarUrl,
    },
    'source.hfc': {
      language: 'hfc',
      path: hfcGrammarUrl,
    },
  }

  const fetchGrammar = async (scopeName: ScopeName): Promise<TextMateGrammar> => {
    const { path } = grammars[scopeName]
    const response = await fetch(path)
    const grammar = await response.text()
    return { type: 'json', grammar }
  }

  const fetchConfiguration = async (
    // language: LanguageId,
  ): Promise<monaco.languages.LanguageConfiguration> => {
    return {}
  }

  const data: ArrayBuffer | Response = await loadVSCodeOnigurumWASM()
  loadWASM(data)
  const onigLib = Promise.resolve({
    createOnigScanner,
    createOnigString,
  })

  provider = new SimpleLanguageInfoProvider({
    grammars,
    fetchGrammar,
    configurations: languages.map(language => language.id),
    fetchConfiguration,
    theme,
    onigLib,
    monaco,
  })
  registerLanguages(
    languages,
    (language: LanguageId) => provider.fetchLanguageInfo(language),
    monaco,
  )

  emmetHTML(monaco)
}

async function loadVSCodeOnigurumWASM(): Promise<Response | ArrayBuffer> {
  const response = await fetch(onigurumaUrl)
  const contentType = response.headers.get('content-type')
  if (contentType === 'application/wasm')
    return response

  return await response.arrayBuffer()
}

export function createEditor(domElement: HTMLElement, options?: monaco.editor.IStandaloneEditorConstructionOptions) {
  const editor = monaco.editor.create(domElement, options)
  provider.injectCSS()
  return editor
}

export { monaco }
