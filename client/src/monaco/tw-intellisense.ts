import type {
  ColorInformation,
  Diagnostics,
  DocumentationAt,
  DocumentationForOptions,
  LanguageId,
  SuggestAtOptions,
  Suggestion,
  SuggestionAt,
} from '@twind/intellisense'

import * as Comlink from 'comlink'

import IntellisenseWorker from './tw-intellisense.worker?worker'

export interface Intellisense {
  init(options: { entry: string; importMap: any }): Promise<void>

  suggest(input: string, options?: SuggestAtOptions): Promise<Suggestion[]>
  suggestAt(source: string, offset: number, language: LanguageId): Promise<SuggestionAt | null>

  documentationFor(token: string, options?: DocumentationForOptions): Promise<string | null>

  documentationAt(
    content: string,
    offset: number,
    language: LanguageId,
  ): Promise<DocumentationAt | null>

  collectColors(source: string, language: LanguageId): Promise<ColorInformation[]>

  validate(content: string, language: LanguageId): Promise<Diagnostics[]>

  getColors(): Promise<Record<string, Record<string, string>>>
}

export default load()

function load(): Intellisense {
  return Comlink.wrap<Intellisense>(new IntellisenseWorker())
}
