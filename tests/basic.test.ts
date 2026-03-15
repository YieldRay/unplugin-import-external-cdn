import path from 'node:path'
import { rspack } from '@rspack/core'
import { build as esbuild } from 'esbuild'
import { rolldown } from 'rolldown'
import { rollup, type RollupOutput } from 'rollup'
import { build as vite } from 'vite'
import { expect, test } from 'vitest'
import webpack from 'webpack'
import CDNP from '../src'

const resolveDir = path.resolve(__dirname, 'fixtures')
const entryFile = path.resolve(resolveDir, 'main.js')

test('esbuild', async () => {
  const result = await esbuild({
    entryPoints: [entryFile],
    write: false,
    bundle: true,
    format: 'esm',
    plugins: [CDNP.esbuild()],
  })
  expect(result.outputFiles[0].text).toMatchSnapshot()
})

test('rollup', async () => {
  const bundle = await rollup({
    input: [entryFile],
    plugins: [CDNP.rollup()],
  })
  const result = await bundle.generate({ format: 'esm' })
  expect(result.output[0].code).toMatchSnapshot()
})

test('vite', async () => {
  const output = await vite({
    root: resolveDir,
    plugins: [CDNP.vite()],
    build: {
      rollupOptions: { input: [entryFile] },
      minify: false,
      write: false,
    },
    logLevel: 'silent',
  })
  expect((output as RollupOutput).output[0].code).toMatchSnapshot()
})

test('rolldown', async () => {
  const bundle = await rolldown({
    input: [entryFile],
    plugins: [CDNP.rolldown()],
  })
  const result = await bundle.generate({ format: 'esm' })
  expect(result.output[0].code).toMatchSnapshot()
})

test('webpack', async () => {
  await new Promise<void>((resolve, reject) => {
    webpack(
      {
        entry: entryFile,
        output: {
          path: path.resolve(__dirname, 'dist'),
          filename: 'webpack.js',
          libraryTarget: 'module',
        },
        experiments: { outputModule: true },
        plugins: [CDNP.webpack()],
      },
      (err, stats) => {
        if (err) return reject(err)
        if (stats?.hasErrors()) return reject(stats.toString())
        resolve()
      },
    )
  })
  const fs = await import('node:fs/promises')
  const content = await fs.readFile(
    path.resolve(__dirname, 'dist/webpack.js'),
    'utf8',
  )
  expect(content).toMatchSnapshot()
})

test('rspack', async () => {
  await new Promise<void>((resolve, reject) => {
    rspack(
      {
        entry: entryFile,
        output: {
          path: path.resolve(__dirname, 'dist'),
          filename: 'rspack.js',
          chunkFormat: 'module',
        },
        experiments: { outputModule: true },
        plugins: [CDNP.rspack()],
      },
      (err, stats) => {
        if (err) return reject(err)
        if (stats?.hasErrors()) return reject(stats.toString())
        resolve()
      },
    )
  })
  const fs = await import('node:fs/promises')
  const content = await fs.readFile(
    path.resolve(__dirname, 'dist/rspack.js'),
    'utf8',
  )
  expect(content).toMatchSnapshot()
})
