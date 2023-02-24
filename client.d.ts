/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly HFC_NAME: string
  readonly HFC_VERSION: string
  readonly HFC_PROP_NAMES: [string[], string[], string[], string[]]
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
