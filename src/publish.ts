import { readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import fs from 'fs/promises'
import colors from 'picocolors'
import fetch, { FormData, fileFromSync } from 'node-fetch'

export async function publish({ token }: { token: string }) {
  const context = process.env.HFC_CLI_CONTEXT || process.cwd()
  const hfcpackPath = join(context, 'hfcpack')
  const outputPath = join(context, '.hfc', 'build')

  // ! file must append at the end of formData
  const form = new FormData()
  form.append('token', token!)

  const manifest: HfcManifest = JSON.parse(readFileSync(join(outputPath, 'manifest.json'), 'utf-8'))
  form.append('manifest', JSON.stringify(manifest))

  const docMd = readFileSync(join(hfcpackPath, 'hfc.md'), 'utf8')
  if (Buffer.byteLength(docMd) > 1024 * 1024)
    throw new Error('doc too large, max 1024kb')

  form.append('doc', docMd)
  form.append(
    'prop-types',
    fileFromSync(join(hfcpackPath, 'props.hfc')),
  )
  form.append(
    'prop-types.json',
    fileFromSync(join(outputPath, 'prop-types.json')),
  )
  form.append(
    'css-vars',
    fileFromSync(join(hfcpackPath, 'vars.css')),
  )
  form.append('css-vars.json', fileFromSync(join(outputPath, 'css-vars.json')))

  const imgsPath = join(hfcpackPath, 'imgs')
  const imgFileNames = await fs.readdir(imgsPath)
  for (const imgFileName of imgFileNames) {
    if (docMd.includes(imgFileName)) {
      form.append(
        'docImg',
        fileFromSync(join(imgsPath, imgFileName)),
        imgFileName,
      )
    }
  }

  if (manifest.banner) {
    form.append(
      'banner',
      fileFromSync(join(hfcpackPath, manifest.banner)),
      manifest.banner,
    )
  }

  const pkgPath = join(outputPath, 'pkg')
  form.append('hfc.js', fileFromSync(join(pkgPath, 'hfc.js')))
  form.append('hfc.css', fileFromSync(join(pkgPath, 'hfc.css')))

  const hfmPath = join(outputPath, 'hfm', manifest.name, manifest.version)
  form.append('hfm.js', fileFromSync(join(hfmPath, 'hfm.js')))
  form.append('hfm.css', fileFromSync(join(hfmPath, 'hfm.css')))

  const publishUrl
    = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3032/publish'
      : 'https://api.hfc.hyper.fun/publish'

  try {
    const res = await fetch(publishUrl, {
      method: 'POST',
      body: form,
    })
      .then(res => res.json() as unknown as {
        error?: { code: string; message?: string }
      })

    if (res.error) {
      console.log(colors.red('publish failed:'))
      console.error(res.error.message || res.error.code)
      return
    }

    console.log(colors.green('publish success'))
  }
  catch (error) {
    console.log('failed to publish, network error')
    console.error(error)
  }
}

export function readToken() {
  let token
  try {
    token = readFileSync(join(homedir(), '.hfc', 'token'), 'utf8')
  }
  catch (error) {}

  return token
}
