import path from 'path'
import { pathToFileURL } from 'url'
import fs from 'fs/promises'
import type { BuildOptions, UserConfig } from 'vite'
import { readJson } from './utils'

export interface ConfigEnv {
  command: 'build' | 'serve'
  mode: string
}

export type HfcConfig = Pick<
  UserConfig,
  'plugins' | 'resolve' | 'css' | 'json' | 'esbuild' | 'assetsInclude'
> & {
  entry: string
  port?: number
  env?: Record<string, any>
  rollupOptions?: BuildOptions['rollupOptions']
  sharedNpmImports?: string[]
}

export type UserConfigFn = (env: ConfigEnv) => UserConfig | Promise<UserConfig>
export type UserConfigExport = UserConfig | Promise<UserConfig> | UserConfigFn

export function defineHfcPackConfig(
  config: UserConfigExport,
): UserConfigExport {
  return config
}

export interface CssVar {
  name: string
  value: string
  comment?: string
}

export type ResolvedConfig = HfcConfig & {
  name: string
  version: string
  license: string
  keywords: string[]
  description: string
  context: string
  command: 'serve' | 'build'
  cssVars: CssVar[]
  outputPath: string
  pkgJsonPath: string
  hfcpackPath: string
  cssVarsPath: string
  manifestPath: string
  propTypesPath: string
  pkgOutputPath: string
  hfmOutputPath: string
  hfcDocImgPath: string
  cssVarsDistPath: string
  propTypesDistPath: string
  deps: Record<string, { v: string; rv: string }>
  devDependencies: Record<string, string>
  sharedNpmImportMap: Record<string, { imports: string[] }>
}

const SHARED_NPM_IMPORTS = [
  'react',
  'react-dom',
  'vue',
  'preact',
  'jquery',
  'd3',
  'chart.js',
  'apexcharts',
  'echarts',
]

export async function resolveConfig(
  context: string,
  command: 'serve' | 'build',
  defaultMode = 'development',
): Promise<ResolvedConfig> {
  if (command === 'build')
    defaultMode = 'production'
  const configEnv = {
    command,
    mode: defaultMode,
  }

  const { default: userConfig } = await import(
    pathToFileURL(path.resolve(context, 'hfcpack.config.js')).toString()
  )

  const config: HfcConfig
    = typeof userConfig === 'function' ? await userConfig(configEnv) : userConfig

  // const mode = config.mode || defaultMode;
  const env = config.env || {}

  const outputPath = path.resolve(context, '.hfc', command)

  if (command === 'build')
    await fs.rm(outputPath, { recursive: true, force: true })

  const pkgOutputPath = path.resolve(outputPath, 'pkg')
  const hfmOutputPath = path.resolve(outputPath, 'hfm')
  const manifestPath = path.resolve(outputPath, 'manifest.json')
  const cssVarsDistPath = path.resolve(outputPath, 'css-vars.json')
  const propTypesDistPath = path.resolve(outputPath, 'prop-types.json')

  const pkgJsonPath = path.join(context, 'package.json')
  const hfcpackPath = path.join(context, 'hfcpack')
  const hfcDocImgPath = path.join(hfcpackPath, 'imgs')
  const cssVarsPath = path.join(hfcpackPath, 'vars.css')
  const propTypesPath = path.join(hfcpackPath, 'props.hfc')

  await Promise.all(
    [outputPath, pkgOutputPath, hfmOutputPath, hfcpackPath, hfcDocImgPath].map(p =>
      fs.mkdir(p, { recursive: true }),
    ),
  )

  const deps: ResolvedConfig['deps'] = {}
  const rollupOptions: BuildOptions['rollupOptions']
    = config.rollupOptions || {}

  rollupOptions!.external = (source, importer, isResolved) => {
    if (isResolved)
      return false

    const firstChar = source[0]
    if (firstChar === '.' || firstChar === '/')
      return false

    const parts = source.split('/')
    const npmName = firstChar === '@' ? `${parts[0]}/${parts[1]}` : parts[0]

    if (deps[npmName])
      return true

    return false
  }

  const packageJson = await readJson(pkgJsonPath)

  const keywords = packageJson.keywords || []
  const description = packageJson.description
  const devDependencies = packageJson.devDependencies || {}

  await Promise.all(
    Object.entries<string>(packageJson.dependencies || {}).map(
      async ([name, requiredVersion]) => {
        const pkgJsonPath = path.resolve(
          context,
          'node_modules',
          name,
          'package.json',
        )

        const pkgJson = await readJson(pkgJsonPath)
        deps[name] = { rv: requiredVersion, v: pkgJson.version }
      },
    ),
  )

  const sharedNpmImportMap: ResolvedConfig['sharedNpmImportMap'] = {}

  for (const importItem of new Set([
    ...SHARED_NPM_IMPORTS,
    ...(config.sharedNpmImports || []),
  ])) {
    const arr = importItem.split('/')
    let npmName = arr[0]
    if (npmName[0] === '@')
      npmName += `/${arr[1]}`

    if (!deps[npmName])
      continue
    // special case for react-dom, which must bundle with react
    if (npmName === 'react-dom')
      continue

    sharedNpmImportMap[npmName] = sharedNpmImportMap[npmName] || {
      imports: [],
    }
    sharedNpmImportMap[npmName].imports.push(importItem)
  }

  config.css = config.css || {}
  if (!config.css.postcss)
    config.css.postcss = {}

  const resolvedConfig: ResolvedConfig = {
    ...config,
    env,
    // mode,
    context,
    command,
    keywords,
    description,
    rollupOptions,
    deps,
    name: process.env.HFC_NAME || packageJson.name,
    version: process.env.HFC_VERSION || packageJson.version,
    license: process.env.HFC_LICENSE || packageJson.license || '',
    port: Number(process.env.PORT) || Number(config.port) || 8787,
    outputPath,
    hfcpackPath,
    pkgJsonPath,
    cssVarsPath,
    manifestPath,
    propTypesPath,
    hfcDocImgPath,
    pkgOutputPath,
    hfmOutputPath,
    cssVarsDistPath,
    propTypesDistPath,
    devDependencies,
    cssVars: [],
    sharedNpmImportMap,
  }

  return resolvedConfig
}
