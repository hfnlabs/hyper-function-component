import EventEmitter from 'events'

import fs from 'fs'
import type { ResolvedConfig } from './config.js'
import type { PropNames, PropTypes } from './hfc-props-parser'
import { HfcPropTypesParser } from './hfc-props-parser'

export class PropsBuilder extends EventEmitter {
  public propTypes: PropTypes = {}
  public propNames: PropNames = [[], [], [], []]

  constructor(private config: ResolvedConfig) {
    super()
  }

  async build() {
    const schema = fs.readFileSync(this.config.propTypesPath, 'utf8')
    const parser = new HfcPropTypesParser()
    const err = parser.parse(schema)
    if (err)
      throw new Error('fail to parse hfcpack/props.hfc')

    this.propTypes = parser.propTypes
    this.propNames = parser.propNames
    process.env.HFC_PROP_NAMES = JSON.stringify(this.propNames)
    fs.writeFileSync(this.config.propTypesDistPath, JSON.stringify(this.propTypes))

    this.emit('build-complete')
  }
}
