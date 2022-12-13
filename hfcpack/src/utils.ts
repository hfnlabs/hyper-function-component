import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import xxhash from 'xxhash-wasm'

let xxhasher: Awaited<ReturnType<typeof xxhash>>
export async function xxhash64(input: Buffer) {
  if (!xxhasher)
    xxhasher = await xxhash()

  const value = xxhasher.h64Raw(input)
  const buf64 = Buffer.allocUnsafe(8)
  buf64.writeBigUint64BE(value)

  return buf64
}

export function ensureFileSync(file: string) {
  let stats
  try {
    stats = fs.statSync(file)
  }
  catch {}
  if (stats && stats.isFile())
    return

  const dir = path.dirname(file)
  try {
    if (!fs.statSync(dir).isDirectory()) {
      // parent is not a directory
      // This is just to cause an internal ENOTDIR error to be thrown
      fs.readdirSync(dir)
    }
  }
  catch (err: any) {
    // If the stat call above failed because the directory doesn't exist, create it
    if (err && err.code === 'ENOENT')
      fs.mkdirSync(dir, { recursive: true })
    else throw err
  }

  fs.writeFileSync(file, '')
}

export function remove(path: string) {
  return fsp.rm(path, { recursive: true, force: true })
}

export function removeSync(path: string) {
  fs.rmSync(path, { recursive: true, force: true })
}

export async function readJson(file: string) {
  const content = await fsp.readFile(file, 'utf-8')
  return JSON.parse(content)
}

export function readJsonSync(file: string) {
  const content = fs.readFileSync(file, 'utf-8')
  return JSON.parse(content)
}

export async function wirteJson(file: string, data: Record<string, any>, space = 0) {
  const str = JSON.stringify(data, null, space)

  await fsp.writeFile(file, str)
}

export function wirteJsonSync(file: string, data: Record<string, any>, space = 0) {
  const str = JSON.stringify(data, null, space)

  fs.writeFileSync(file, str)
}
