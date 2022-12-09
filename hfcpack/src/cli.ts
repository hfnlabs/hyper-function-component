import os from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { readFileSync } from 'fs'
import colors from 'picocolors'
import minimist from 'minimist'
import prompts from 'prompts'
import updateNotifier from 'simple-update-notifier'
import pleaseUpgradeNode from 'please-upgrade-node'

import { Service } from './service.js'
import { publish, readToken } from './publish.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'))

pleaseUpgradeNode(pkg)
updateNotifier({ pkg })

const argv = minimist(process.argv.slice(2))

export async function runCli() {
  if (argv.v || argv.version) {
    console.log(pkg.version)
    process.exit(0)
  }

  const context = process.env.HFC_CLI_CONTEXT || process.cwd()
  const cwdPkgPath = join(context, 'package.json')
  const cwdPkg = JSON.parse(await fs.readFile(cwdPkgPath, 'utf-8'))
  if (
    !cwdPkg.hfcName
    || verifyHfcName(cwdPkg.hfcName) !== true
  ) {
    const name = '' // await askForHfcName()

    cwdPkg.hfcName = name
    await fs.writeFile(cwdPkgPath, JSON.stringify(cwdPkg, null, 2))
  }

  if (!/^\d+(?:\.\d+){2}$/.test(cwdPkg.version)) {
    console.log('version format must be X.Y.Z, eg: 1.2.3')
    process.exit(-1)
  }

  run(argv._[0], context)
}

async function run(command: string, context: string) {
  if (!command) {
    const service = new Service(context, 'serve')
    await service.run()
    await service.devServer?.listen()
  }
  else if (command === 'login') {
    let token = argv.token

    if (!token) {
      try {
        console.log(
          `You can generate token at: ${
             colors.green(colors.bold('https://hyper.fun/settings/tokens'))}`,
        )

        const answers = await prompts.prompt([
          {
            name: 'token',
            message: 'Enter Access Token:',
            type: 'password',
            mask: '*',
          },
        ])

        if (!answers.token) {
          console.log('cancel login')
          return
        }

        token = answers.token
      }
      catch (error) {
        if ((error as any).isTtyError) {
          console.log('run "npx hfc-cli-service login --token=<token>"')
          return
        }

        console.log('something wrong: ', error)
        return
      }
    }

    await fs.mkdir(join(os.homedir(), '.hfc'), { recursive: true })
    await fs.writeFile(join(os.homedir(), '.hfc', 'token'), token)
    console.log('login success')
  }
  else if (command === 'build') {
    const service = new Service(context, 'build')
    service.run()
  }
  else if (command === 'publish') {
    let token = argv.token
    if (!token)
      token = readToken()

    if (!token)
      await run('login', context)

    token = readToken()
    if (!token) {
      console.log('fail to read token')
      process.exit(-1)
    }

    if (argv['skip-build']) {
      publish({ token })
      return
    }

    const service = new Service(context, 'build')

    service.on('ready', () => {
      publish({ token })
    })

    service.run()
  }
  else {
    console.log('unknow command')
  }
}

function verifyHfcName(input: string) {
  const ref = '\nref: https://bit.ly/3QzRS7S'

  if (input.length > 64)
    return 'name is too long (max 64 characters)'

  if (!input.includes('-'))
    return `name must contain a '-' \nlike awesome-button ${ref}`

  if (/[^a-z]/.test(input[0]))
    return `first character must be [a-z] ${ref}`

  if (/[^a-z0-9]/.test(input[input.length - 1]))
    return 'last character must be [a-z] [0-9] '

  if (/[^a-z0-9\-]/.test(input))
    return 'invalid name, valid character is [a-z] [0-9] and -'

  if (
    [
      'annotation-xml',
      'color-profile',
      'font-face',
      'font-face-src',
      'font-face-uri',
      'font-face-format',
      'font-face-name',
      'missing-glyph',
    ].includes(input)
  )
    return `${input} is reveresd ${ref}`

  return true
}
