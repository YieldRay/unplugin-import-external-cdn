# unplugin-import-external-cdn

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

A unified plugin based on `unplugin` that automatically rewrites external package imports to CDN URLs (defaulting to [esm.sh](https://esm.sh)). It reads your `package.json`, extracts external dependencies, and intelligently generated CDN equivalents seamlessly across multiple bundlers.

## Features

- ⚡️ Supports Vite, Rollup, Webpack, esbuild, Rolldown, and Rspack.
- 📦 Automatically analyzes dependencies from `package.json`.
- 🔗 Auto-resolves peerDependencies.
- 🎨 Customizable CDN URL generation.
- 🗺️ Support for `importMap` injection.

## Installation

```bash
npm i -D unplugin-import-external-cdn
```

```bash
pnpm i -D unplugin-import-external-cdn
```

```bash
yarn add -D unplugin-import-external-cdn
```

## Usage

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import externalCDN from 'unplugin-import-external-cdn/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [externalCDN()],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import externalCDN from 'unplugin-import-external-cdn/rollup'

export default {
  plugins: [externalCDN()],
}
```

<br></details>

<details>
<summary>Rolldown</summary><br>

```ts
// rolldown.config.js
import externalCDN from 'unplugin-import-external-cdn/rolldown'

export default {
  plugins: [externalCDN()],
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import externalCDN from 'unplugin-import-external-cdn/esbuild'

build({
  plugins: [externalCDN()],
})
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
import externalCDN from 'unplugin-import-external-cdn/webpack'

export default {
  plugins: [externalCDN()],
}
```

</details>

<details>
<summary>Rspack</summary><br>

```ts
// rspack.config.js
import externalCDN from 'unplugin-import-external-cdn/rspack'

export default {
  plugins: [externalCDN()],
}
```

<br></details>

## Options

```ts
export interface ImportMap {
  imports?: Record<string, string>
  scopes?: Record<string, Record<string, string>>
}

export interface Options {
  /**
   * Custom path generator logic.
   * If not provided, it defaults to esm.sh: `https://esm.sh/${name}@${version}?target=esnext`
   */
  path?: (
    name: string,
    version: string,
    deps: Record<string, string>,
  ) => string | URL

  /**
   * Optionally inject an importMap via Vite's `transformIndexHtml`.
   */
  importMap?: ImportMap
}
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/unplugin-import-external-cdn.svg
[npm-version-href]: https://npmjs.com/package/unplugin-import-external-cdn
[npm-downloads-src]: https://img.shields.io/npm/dm/unplugin-import-external-cdn
[npm-downloads-href]: https://www.npmcharts.com/compare/unplugin-import-external-cdn?interval=30
