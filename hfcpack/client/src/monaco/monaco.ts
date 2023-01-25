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

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { createOnigScanner, createOnigString, loadWASM } from 'vscode-oniguruma'

import { emmetHTML } from 'emmet-monaco-es'

import { fromRatio, names as namedColors } from '@ctrl/tinycolor'
import onigurumaUrl from 'vscode-oniguruma/release/onig.wasm?url'
import diff from 'fast-diff'
import { injectGlobal, tw } from '@twind/core'
import cssGrammarUrl from './grammars/css.tmLanguage.json?url'
import htmlGrammarUrl from './grammars/html.tmLanguage.json?url'
import javascriptGrammarUrl from './grammars/javascript.tmLanguage.json?url'
import hfcGrammarUrl from './grammars/hfc.tmLanguage.json?url'

import type { ScopeName, ScopeNameInfo, TextMateGrammar } from './providers'
import { SimpleLanguageInfoProvider } from './providers'
import type { LanguageId } from './register'
import { registerLanguages } from './register'
import theme from './theme'
import twIntellisense from './tw-intellisense'
import prettier from './prettier'

// disable twind warn
window.addEventListener('warning', (e) => {
  e.preventDefault()
})

self.MonacoEnvironment = {
  getWorker(_, label) {
    switch (label) {
      case 'json':
        return new JsonWorker()
      case 'css':
      case 'scss':
      case 'less':
        return new CssWorker()
      case 'html':
      case 'hfz':
      case 'hfz-view':
      case 'handlebars':
      case 'razor':
        return new HtmlWorker()
      case 'typescript':
      case 'javascript':
        return new TsWorker()
      default:
        return new EditorWorker()
    }
  },
}

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
  module: monaco.languages.typescript.ModuleKind.ESNext,
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  isolatedModules: true,
  allowJs: true,
  strict: true,
  skipLibCheck: true,
})

monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSuggestionDiagnostics: true,
})

if (import.meta.hot) {
  const disposables = (import.meta.hot.data.disposables ??= new Set())

  for (const disposable of disposables)
    disposable.dispose()

  disposables.clear()
}

function track(disposable: monaco.IDisposable) {
  if (import.meta.hot)
    import.meta.hot.data.disposables.add(disposable)
}

// Provide collapsable range for @layer comments of output.css -> /* @layer base */
track(
  monaco.languages.registerFoldingRangeProvider('css', {
    provideFoldingRanges(model) {
      const ranges: monaco.languages.FoldingRange[] = []

      let start = -1
      for (const { range } of model.findMatches('/* @layer ', false, false, false, null, false)) {
        if (start !== -1) {
          ranges.push({
            start,
            end: range.startLineNumber - 1,
            kind: monaco.languages.FoldingRangeKind.Region,
          })
        }

        start = range.startLineNumber
      }

      if (start !== -1) {
        ranges.push({
          start,
          end: model.getLineCount(),
          kind: monaco.languages.FoldingRangeKind.Region,
        })
      }

      return ranges
    },
  }),
)

// Provide autocompletion
track(
  monaco.languages.registerCompletionItemProvider('html', {
    triggerCharacters: [' ', '"', ':', '!', '/', '-', '(', '@'],
    async provideCompletionItems(model, position) {
      const suggestionAt = await twIntellisense.suggestAt(
        model.getValue(),
        model.getOffsetAt(position),
        model.getLanguageId(),
      )

      if (!suggestionAt) {
        return {
          suggestions: [],
          incomplete: false,
        }
      }

      const { lineNumber: startLineNumber, column: startColumn } = model.getPositionAt(
        suggestionAt.start,
      )
      const { lineNumber: endLineNumber, column: endColumn } = model.getPositionAt(suggestionAt.end)
      const range = { startLineNumber, startColumn, endLineNumber, endColumn }

      return {
        suggestions: suggestionAt.suggestions.map((suggestion, index) => {
          if (suggestion.type === 'variant') {
            return {
              label: {
                label: suggestion.value.endsWith('[:')
                  ? suggestion.value.slice(0, -1)
                  : suggestion.value,
                detail:
                  suggestion.detail
                  || (suggestion.value.endsWith('[:')
                    ? '…]:'
                    : suggestion.value.endsWith('/:')
                      ? '…'
                      : undefined),
                description: suggestion.description,
              },
              detail: suggestion.color || suggestion.detail,
              kind: suggestion.color
                ? monaco.languages.CompletionItemKind.Color
                : monaco.languages.CompletionItemKind.Module,
              sortText: index.toString().padStart(8, '0'),
              filterText: suggestion.name,
              insertText: suggestion.value.endsWith('[:')
                ? suggestion.value.slice(0, -1)
                : suggestion.value,
              range,
              command: {
                id: 'editor.action.triggerSuggest',
                title: '',
              },
            }
          }

          return {
            label: {
              label: suggestion.value,
              detail:
                suggestion.detail
                || (suggestion.value.endsWith('[')
                  ? '…]'
                  : suggestion.value.endsWith('/')
                    ? '…'
                    : undefined),
              description: suggestion.description,
            },
            detail: suggestion.color || suggestion.detail,
            kind: suggestion.color
              ? monaco.languages.CompletionItemKind.Color
              : suggestion.value.endsWith('[')
                ? monaco.languages.CompletionItemKind.Variable
                : suggestion.value.endsWith('/')
                  ? monaco.languages.CompletionItemKind.Class // TypeParameter
                  : monaco.languages.CompletionItemKind.Constant,
            sortText: index.toString().padStart(8, '0'),
            filterText: suggestion.name,
            insertText: suggestion.value,
            range,
            command: suggestion.value.endsWith('/')
              ? {
                  id: 'editor.action.triggerSuggest',
                  title: '',
                }
              : undefined,
          }
        }),
        incomplete: true, // So that autocompletion request is sent on every char
      }
    },
    async resolveCompletionItem(item) {
      const documentation = await twIntellisense.documentationFor(item.filterText || item.insertText)

      if (documentation) {
        item.documentation = {
          value: documentation,
          isTrusted: true,
          supportHtml: true,
          supportThemeIcons: true,
        }
      }

      return item
    },
  }),
)

// Provide inline colors
{
  // Based on https://github.com/tailwindlabs/play.tailwindcss.com/blob/master/src/monaco/html.js#L99
  const colorNames = Object.keys(namedColors)
  const editabelColorRe = new RegExp(
    `-\\[(${colorNames.join('|')}|(?:(?:#|(?:(?:hsl|rgb)a?|hwb|lab|lch|color)\\())[^]\\(]+)\\]$`,
    'i',
  )
  const oldDecorationsMap = new WeakMap<monaco.editor.ITextModel, string[]>()

  track(
    monaco.languages.registerColorProvider('html', {
      async provideDocumentColors(model) {
        const colors = await twIntellisense.collectColors(model.getValue(), model.getLanguageId())

        oldDecorationsMap.set(
          model,
          model.deltaDecorations(
            oldDecorationsMap.get(model) || [],
            colors
              .filter(color => !color.editable)
              .map(({ start, end, rgba }) => {
                // We must use injectGlobal because the class names are "sanitized" in some way by monaco-editor
                const className = `_${rgba.r}_${rgba.g}_${rgba.b}_${rgba.a}`
                injectGlobal({
                  '._monaco-color-decoration': {
                    '&::before': {
                      'content': '\' \'',
                      'boxSizing': 'border-box',
                      'display': 'inline-block',
                      'width': '0.8em',
                      'height': '0.8em',
                      'margin': '0.1em 0.2em 0',
                      'border': '0.1em solid black',
                      '.vs-dark &': {
                        borderColor: 'rgb(238,238,238)',
                      },
                    },
                    [`&.${className}::before`]: {
                      backgroundColor: `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`,
                    },
                  },
                })

                const { lineNumber: startLineNumber, column: startColumn }
                  = model.getPositionAt(start)
                const { lineNumber: endLineNumber, column: endColumn } = model.getPositionAt(end)

                return {
                  range: {
                    startLineNumber,
                    startColumn,
                    endLineNumber,
                    endColumn,
                  },
                  options: {
                    beforeContentClassName: `_monaco-color-decoration ${className}`,
                  },
                }
              }),
          ),
        )

        return colors
          .filter(color => color.editable)
          .map(({ start, end, rgba }) => {
            const { r: red, g: green, b: blue, a: alpha } = rgba

            const { lineNumber: startLineNumber, column: startColumn } = model.getPositionAt(start)
            const { lineNumber: endLineNumber, column: endColumn } = model.getPositionAt(end)

            return {
              range: {
                startLineNumber,
                startColumn,
                endLineNumber,
                endColumn,
              },
              color: { red, green, blue, alpha },
            }
          })
      },
      provideColorPresentations(model, colorInfo) {
        const className = model.getValueInRange(colorInfo.range)

        const match = className.match(editabelColorRe)

        if (match === null)
          return []

        const currentColor = match[1]

        const isNamedColor = colorNames.includes(currentColor)
        const color = fromRatio({
          r: colorInfo.color.red,
          g: colorInfo.color.green,
          b: colorInfo.color.blue,
          a: colorInfo.color.alpha,
        })

        let hexValue = color.toHex8String(
          !isNamedColor && (currentColor.length === 4 || currentColor.length === 5),
        )
        if (hexValue.length === 5)
          hexValue = hexValue.replace(/f$/, '')

        else if (hexValue.length === 9)
          hexValue = hexValue.replace(/ff$/, '')

        const prefix = className.substr(0, match.index)

        return [
          hexValue,
          color.toRgbString().replace(/ /g, ''),
          color.toHslString().replace(/ /g, ''),
        ].map(value => ({ label: `${prefix}-[${value}]` }))
      },
    }),
  )
}

monaco.languages.register({ id: 'hfc' })

track(
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
  }),
)

let provider: SimpleLanguageInfoProvider
let inited = false
export async function initMonaco() {
  if (inited)
    return
  inited = true

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

export function createEditor(domElement: HTMLElement, options: monaco.editor.IStandaloneEditorConstructionOptions) {
  options.theme = 'vs-dark'
  options.renderLineHighlight = 'none'
  options.suggestFontSize = 14
  options.codeLensFontSize = 14
  options.tabSize = 2
  options.cursorBlinking = 'smooth'
  options.colorDecorators = true
  options.suggest = {
    filterGraceful: true,
    showWords: false,
    showStatusBar: true,
    preview: true,
    previewMode: 'subwordSmart',
  }
  options.quickSuggestions = {
    strings: true,
  }
  options.inlineSuggest = { enabled: true, mode: 'subwordSmart' }
  options.suggestSelection = 'first'
  options.acceptSuggestionOnEnter = 'smart'
  options.peekWidgetDefaultFocus = 'editor'
  const editor = monaco.editor.create(domElement, options)
  provider.injectCSS()

  editor.addAction({
    id: 'editor.action.formatDocument',
    label: 'Format Document',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
    run: async () => {
      const source = editor.getValue()
      const formatted = await prettier.format(source, {
        parser: 'html',
      })

      const model = editor.getModel()!

      const edits: monaco.editor.IIdentifiedSingleEditOperation[] = []
      const decorations: monaco.editor.IModelDeltaDecoration[] = []

      const changes = diff(source, formatted)

      let offset = 0
      for (let index = 0; index < changes.length; index++) {
        const change = changes[index]
        if (change[0] === diff.EQUAL) {
          offset += change[1].length
        }
        else if (change[0] === diff.INSERT) {
          const position = model.getPositionAt(offset)
          edits.push({
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
            text: change[1],
            forceMoveMarkers: true,
          })
          const decorationEnd = model.getPositionAt(offset + change[1].length)
          decorations.push({
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: decorationEnd.lineNumber,
              endColumn: decorationEnd.column,
            },
            options: {
              marginClassName: tw('bg-info-7'),
              className: tw('rounded-sm ring-1 ring-info-10'),
            },
          })
        }
        /* if (change[0] === diff.DELETE) */ else {
          const startPosition = model.getPositionAt(offset)
          offset += change[1].length
          const endPosition = model.getPositionAt(offset)
          const nextChange = changes[index + 1]
          if (nextChange?.[0] === diff.INSERT) {
            index += 1
            // replace
            edits.push({
              range: {
                startLineNumber: startPosition.lineNumber,
                startColumn: startPosition.column,
                endLineNumber: endPosition.lineNumber,
                endColumn: endPosition.column,
              },
              text: nextChange[1],
              forceMoveMarkers: true,
            })
            const decorationEnd = model.getPositionAt(
              offset - change[1].length + nextChange[1].length,
            )
            decorations.push({
              range: {
                startLineNumber: startPosition.lineNumber,
                startColumn: startPosition.column,
                endLineNumber: decorationEnd.lineNumber,
                endColumn: decorationEnd.column,
              },
              options: {
                marginClassName: tw('bg-info-7'),
                className: tw('rounded-sm ring-1 ring-info-10'),
              },
            })
          }
          else {
            // simple delete
            edits.push({
              range: {
                startLineNumber: startPosition.lineNumber,
                startColumn: startPosition.column,
                endLineNumber: endPosition.lineNumber,
                endColumn: endPosition.column,
              },
              text: null,
              forceMoveMarkers: true,
            })
          }
        }
      }

      editor.executeEdits('', edits)
      editor.revealRangeNearTop(
        (edits.find(edit => edit.text) || edits[0]).range,
        monaco.editor.ScrollType.Smooth,
      )

      editor.pushUndoStop()
    },
  })

  return editor
}

export { monaco }
