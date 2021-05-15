#!/usr/bin/env node
import { readdir, writeFile, readFile, lstat, rename } from 'fs/promises'
import { compress } from 'brotli'

async function compressFile(file) {
  const compressed = `${file}.br`
  await writeFile(compressed, compress(await readFile(file)))
  await rename(compressed, file)
}

async function compressDirectory(directory) {
  const files = await readdir(directory)
  await Promise.all(
    files
      .map((file) => `${directory}/${file}`)
      .map(async function (file) {
        if ((await lstat(file)).isDirectory()) {
          compressDirectory(file)
        } else {
          compressFile(file)
        }
      }),
  )
}

await compressDirectory('build')
