import * as Comlink from 'comlink'

import type { Options } from 'prettier'

import PrettierWorker from './prettier.worker?worker'

export interface Prettier {
  /**
   * `format` is used to format text using Prettier. [Options](https://prettier.io/docs/en/options.html) may be provided to override the defaults.
   */
  format(source: string, options?: Omit<Options, 'plugins' | 'pluginSearchDirs'>): Promise<string>
}

export default load()

function load(): Prettier {
  return Comlink.wrap<Prettier>(new PrettierWorker())
}
