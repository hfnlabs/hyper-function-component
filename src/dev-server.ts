import path, { dirname } from 'path'
import type { ServerResponse } from 'http'
import { createServer } from 'http'
import { fileURLToPath } from 'url'
import fs, { readFileSync } from 'fs'
import cors from 'cors'
import sirv from 'sirv'
import colors from 'picocolors'
import prettyBytes from 'pretty-bytes'
import Busboy from 'busboy'
import type { App, Router } from 'h3'
import { callNodeListener, createApp, createRouter, eventHandler, fromNodeMiddleware, getQuery, readBody, toNodeListener } from 'h3'

import bundleSize from './bundle-size.js'
import type { ResolvedConfig } from './config.js'
import type { HfmBuilder } from './hfm-builder.js'
import type { EsmBuilder } from './esm-builder.js'
import type { PropsBuilder } from './hfc-props-builder'
import type { ManifestBuilder } from './manifest-builder.js'
import { HfcPropTypesParser } from './hfc-props-parser'
import { ensureFileSync, readJsonSync, wirteJsonSync, xxhash64 } from './utils.js'
import type { CssVarBuilder } from './css-variable-builder.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const extToMime: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

const mimeToExt: Record<string, string> = {
  'image/jpeg': '.jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
}
const allowImageTypse = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']

export class DevServer {
  app: App
  router: Router
  buildEventMsgId = Date.now()
  buildEventMsgs: { id: number; data: any }[] = []
  buildEventServerResponses: ServerResponse[] = []
  constructor(private config: ResolvedConfig, private builders: {
    hfmBuilder: HfmBuilder
    esmBuilder: EsmBuilder
    propsBuilder: PropsBuilder
    cssVarBuilder: CssVarBuilder
    manifestBuilder: ManifestBuilder
  }) {
    this.app = createApp({
      onError: (err, event) => {
        console.error('dev server error:')
        console.error(err)
        if (event.node.res.writableEnded || event.node.res.headersSent)
          return

        event.node.res.writeHead(500, { 'Content-Type': 'application/json' })
        event.node.res.end(JSON.stringify({ err: err.message }))
      },
    })
    this.router = createRouter()

    this.app.use(fromNodeMiddleware(cors()))

    this.setupRoute()
    this.app.use(this.router)

    this.builders.hfmBuilder.on('build-complete', async () => {
      this.sendMessage({ action: 'rebuild-complete' })
    })

    this.builders.manifestBuilder.on('build-complete', async () => {
      this.sendMessage({ action: 'update-hfc-pkg-json' })
    })
  }

  private setupRoute() {
    this.router.get('/api/events', eventHandler((event) => {
      return callNodeListener((req, res, _next) => {
        const query = getQuery(event)
        const msgId = parseInt(query.id as string)

        if (msgId) {
          const msgIndex = this.buildEventMsgs.findIndex(
            item => item.id === msgId,
          )

          const nextMsg = this.buildEventMsgs[msgIndex + 1]
          if (nextMsg) {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(nextMsg))
            return
          }
        }

        this.buildEventServerResponses.push(res)

        event.node.res.on('close', () => {
          if (!event.node.res.headersSent)
            res.end()

          if (!this.buildEventServerResponses.length)
            return
          const idx = this.buildEventServerResponses.indexOf(res)
          if (idx >= 0)
            this.buildEventServerResponses.splice(idx, 1)
        })
      }, event.node.req, event.node.res)
    }))

    this.router.get('/api/doc', eventHandler(() => {
      const docPath = path.join(this.config.hfcpackPath, 'hfc.md')
      ensureFileSync(docPath)
      const stats = fs.statSync(docPath)
      const etag = `W/"${stats.size}-${stats.mtime.getTime()}"`

      const content = fs.readFileSync(docPath, 'utf-8')

      return { etag, content }
    }))

    this.router.post('/api/doc', eventHandler(async (event) => {
      const { etag, content } = await readBody<{ etag: string; content: string }>(event)

      const docPath = path.join(this.config.hfcpackPath, 'hfc.md')
      const stats = fs.statSync(docPath)
      const realEtag = `W/"${stats.size}-${stats.mtime.getTime()}"`
      if (etag !== realEtag)
        return { err: 'ETAG_MISS_MATCH' }

      fs.writeFileSync(docPath, content)
      const newStats = fs.statSync(docPath)
      const newEtag = `W/"${newStats.size}-${newStats.mtime.getTime()}"`

      return { err: 'OK', etag: newEtag }
    }))

    function getHfzViewCodeById(lines: string[], id: string) {
      let startLineNum = Infinity
      let endLineNum = 0
      let backtick = ''
      const codeLines = []
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        if (
          line.startsWith('```')
          && line.includes('hfz-view')
          && line.includes(`id=${id}`)
        ) {
          backtick = line.split('hfz-view')[0]
          startLineNum = i
          continue
        }

        if (i > startLineNum) {
          if (line === backtick) {
            endLineNum = i
            break
          }

          codeLines.push(line)
        }
      }

      return { start: startLineNum, end: endLineNum, codeLines, backtick }
    }

    this.router.get('/api/hfzView/code', eventHandler(async (event) => {
      const query = getQuery(event)
      const id = query.id as string

      const docPath = path.join(this.config.hfcpackPath, 'hfc.md')
      const content = fs.readFileSync(docPath, 'utf-8')
      const lines = content.split('\n')

      const { start, codeLines } = getHfzViewCodeById(lines, id)

      if (start === Infinity)
        return { err: 'NOT_FOUND' }

      return { err: 'OK', code: codeLines.join('\n') }
    }))

    this.router.post('/api/hfzView/code', eventHandler(async (event) => {
      const { id, code, prevCode } = await readBody<{ id: string; code: string; prevCode: string }>(event)

      const docPath = path.join(this.config.hfcpackPath, 'hfc.md')
      const content = fs.readFileSync(docPath, 'utf-8')

      const lines = content.split('\n')

      const { start, end, backtick, codeLines } = getHfzViewCodeById(lines, id)

      if (start === Infinity)
        return { err: 'NOT_FOUND' }

      if (codeLines.join('\n') !== prevCode)
        return { err: 'PREV_CODE_NOT_MATCH' }

      const newBacktick = `${(code.match(/`{3,}/g) || ['``']).sort((a, b) => b.length - a.length)[0]}\``
      const startLine = lines[start].replace(backtick, newBacktick)

      const codeBlock = [startLine, code, newBacktick].join('\n')

      lines.splice(start, end - start + 1, codeBlock)
      fs.writeFileSync(docPath, lines.join('\n'))

      return { err: 'OK' }
    }))

    this.router.get('/api/manifest', eventHandler(() => {
      const content = fs.readFileSync(this.config.manifestPath, 'utf-8')
      return JSON.parse(content)
    }))

    const updatePackageJson = (update: Record<string, any>) => {
      const pkg = readJsonSync(this.config.pkgJsonPath)
      Object.assign(pkg, update)
      wirteJsonSync(this.config.pkgJsonPath, pkg, 2)
    }

    const updateHfcNameInDoc = (name: string) => {
      const docPath = path.join(this.config.hfcpackPath, 'hfc.md')
      const doc = readFileSync(docPath, 'utf-8')

      const newDoc = doc.split(this.config.name).join(name)
      fs.writeFileSync(docPath, newDoc)
    }

    this.router.post('/api/manifest', eventHandler(async (event) => {
      const { key, value } = await readBody<{ key: string; value: any }>(event)

      if (key === 'name') {
        updatePackageJson({ name: value })
        updateHfcNameInDoc(value)
        this.config.name = value

        await this.builders.manifestBuilder.build()
        await this.builders.esmBuilder.build()
      }

      if (key === 'banner') {
        updatePackageJson({ banner: value })
        await this.builders.manifestBuilder.build()
      }

      return { err: 'OK' }
    }))

    this.router.get('/api/props', eventHandler(async () => {
      const content = fs.readFileSync(this.config.propTypesPath, 'utf-8')
      return { err: 'OK', content }
    }))

    this.router.post('/api/props', eventHandler(async (event) => {
      const { content } = await readBody<{ content: string }>(event)

      fs.writeFileSync(this.config.propTypesPath, content)
      await this.builders.propsBuilder.build()
      return { err: 'OK' }
    }))

    this.router.post('/api/props/check', eventHandler(async (event) => {
      const { content } = await readBody<{ content: string }>(event)
      const parser = new HfcPropTypesParser()
      const err = parser.parse(content)
      if (err)
        return { err: 'SYNTAX_ERROR', ...err }

      const { unkonwType, typePos } = parser.checkTypes()

      return { err: 'OK', unkonwType, typePos }
    }))

    this.router.get('/api/cssvars', eventHandler(async () => {
      const content = fs.readFileSync(this.config.cssVarsPath, 'utf-8')
      return { err: 'OK', content }
    }))

    this.router.post('/api/cssvars', eventHandler(async (event) => {
      const { content } = await readBody<{ content: string }>(event)

      try {
        await this.builders.cssVarBuilder.build(content)
      }
      catch (error: any) {
        return { err: 'BUILD_ERROR', errmsg: error.message }
      }

      fs.writeFileSync(this.config.cssVarsPath, content)
      return { err: 'OK' }
    }))

    this.router.get('/api/size', eventHandler(async () => {
      const { sizeJs, sizeCss } = await bundleSize(this.config.pkgOutputPath)

      return {
        sizeJs: prettyBytes(sizeJs),
        sizeCss: prettyBytes(sizeCss),
      }
    }))

    this.router.post('/api/img/upload', fromNodeMiddleware((req, res, _next) => {
      const busboy = Busboy({ headers: req.headers })

      busboy.on('file', (name, file, info) => {
        res.setHeader('content-type', 'application/json')
        const isAllow = allowImageTypse.includes(info.mimeType)
        if (!isAllow) {
          res.end(JSON.stringify({ err: 'UNSUPPORT_TYPE', errmsg: `unsupported file type: ${info.mimeType}` }))
          return
        }

        const bufs: Uint8Array[] = []
        file.on('data', d => bufs.push(d))
        file.on('end', async () => {
          const buf = Buffer.concat(bufs)

          if (buf.byteLength > 512 * 1024) {
            res.end(JSON.stringify({ err: 'IMG_TOO_LARGE', errmsg: 'img too large, max 512 Kb' }))
            return
          }

          const hash = (await xxhash64(buf)).toString('base64url')

          const ext = mimeToExt[info.mimeType]
          const filename = `${hash}${ext}`

          const filepath = path.join(this.config.hfcDocImgPath, filename)
          fs.writeFileSync(filepath, buf)

          res.end(JSON.stringify({ err: 'OK' }))
        })
      })
      req.pipe(busboy)
    }))

    this.router.get('/api/img/all', eventHandler(() => {
      const allImgFileNames = fs.readdirSync(this.config.hfcDocImgPath)
      const imgs = allImgFileNames.map(filename => filename.split('/').pop()).filter(filename => !!extToMime[path.extname(filename!)])
      return { err: 'OK', imgs }
    }))

    this.router.get(
      '/imgs/**',
      staticMiddleware(this.config.hfcDocImgPath, '/imgs'),
    )

    this.router.get(
      '/hfm/**',
      staticMiddleware(this.config.hfmOutputPath, '/hfm'),
    )

    const clientStaticHandler = sirv(path.resolve(__dirname, '..', 'dist', 'client'), { dev: true, etag: true })
    this.router.use('**', fromNodeMiddleware((_req, res, _next) => {
      clientStaticHandler(_req, res, () => {
        res.statusCode = 404
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ err: 'NOT_FOUND' }))
      })
    }))
  }

  sendMessage(msg: any) {
    const id = this.buildEventMsgId++
    const event = { id, data: msg }
    this.buildEventMsgs.push(event)
    if (this.buildEventMsgs.length > 100)
      this.buildEventMsgs.shift()
    const buildEventServerResponses = this.buildEventServerResponses.slice()
    this.buildEventServerResponses = []

    buildEventServerResponses.forEach((res) => {
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify(event))
    })
  }

  listener() {
    return toNodeListener(this.app)
  }

  async listen() {
    const httpServer = createServer(this.listener())
    let port = this.config.port!
    const onError = (e: Error & { code?: string }) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying another one...`)
        httpServer.listen(++port)
      }
      else {
        httpServer.removeListener('error', onError)
        throw e
      }
    }

    httpServer.on('error', onError)

    httpServer.listen(port, () => {
      console.log(
        `${colors.green('➜')} ${colors.cyan(`http://localhost:${port}`)}`,
      )
    })
  }
}

function staticMiddleware(dir: string, prefix: string) {
  const handler = sirv(dir, {
    dev: true,
    etag: true,
  })

  return fromNodeMiddleware((req, res, next) => {
    req.url = req.url!.replace(prefix, '')
    handler(req, res, next)
  })
}
