import EventEmitter from 'events'
import colors from 'picocolors'
import { EsmBuilder } from './esm-builder.js'
import { HfmBuilder } from './hfm-builder.js'
import { PropsBuilder } from './hfc-props-builder.js'
import { ManifestBuilder } from './manifest-builder.js'

import { DevServer } from './dev-server.js'
import type {
  ResolvedConfig,
} from './config.js'
import {
  resolveConfig,
} from './config.js'
import { CssVarBuilder } from './css-variable-builder.js'

export class Service extends EventEmitter {
  config!: ResolvedConfig
  devServer?: DevServer

  constructor(public context: string, public command: 'serve' | 'build') {
    super()
  }

  async run() {
    this.config = await resolveConfig(this.context, this.command)

    const propsBuilder = new PropsBuilder(this.config)
    const cssVarBuilder = new CssVarBuilder(this.config)
    const manifestBuilder = new ManifestBuilder(this.config)

    await Promise.all([
      propsBuilder.build(),
      cssVarBuilder.build(),
      manifestBuilder.build(),
    ])

    const hfmBuilder = new HfmBuilder(this.config)
    await hfmBuilder.resolveConfig()

    const esmBuilder = new EsmBuilder(this.config)
    await esmBuilder.build()
    await new Promise((resolve) => {
      esmBuilder.once('build-complete', resolve)
    })

    await hfmBuilder.build()

    console.log(colors.green('Build complete'))
    this.emit('ready')

    if (this.command !== 'serve')
      return

    propsBuilder.on('build-complete', () => {
      esmBuilder.build()
    })

    cssVarBuilder.on('build-complete', () => {
      esmBuilder.build()
    })

    manifestBuilder.on('build-complete', () => {
      esmBuilder.build()
    })

    esmBuilder.on('build-complete', () => {
      hfmBuilder.build()
    })

    hfmBuilder.on('build-complete', () => {
      console.log(colors.green('Rebuild complete'))
    })

    this.devServer = new DevServer(this.config, {
      hfmBuilder,
      esmBuilder,
      manifestBuilder,
      propsBuilder,
      cssVarBuilder,
    })
  }
}
