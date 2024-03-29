import EventEmitter from 'events'
import fs from 'fs/promises'
import type { ResolvedConfig } from './config.js'

export class ManifestBuilder extends EventEmitter {
  constructor(private config: ResolvedConfig) {
    super()
  }

  async build() {
    const pkg = JSON.parse(await fs.readFile(this.config.pkgJsonPath, 'utf-8'))

    const banner = process.env.HFC_BANNER || pkg.banner
    const homepage = process.env.HFC_HOMEPAGE || pkg.homepage
    const description = process.env.HFC_DESCRIPTION || pkg.description || ''
    const repository = process.env.HFC_REPOSITORY || pkg.repository
    const license = process.env.HFC_LICENSE || pkg.license

    if (description.length > 256)
      throw new Error('description too lang, max 256 char')

    const manifest: HfcManifest = {
      name: this.config.name,
      version: this.config.version,
      banner,
      homepage,
      description,
      license,
      repository,
      deps: this.config.deps,
      sharedNpmImportMap: this.config.sharedNpmImportMap,
    }

    await fs.writeFile(
      this.config.manifestPath,
      JSON.stringify(manifest),
    )

    this.emit('build-complete')
  }
}
