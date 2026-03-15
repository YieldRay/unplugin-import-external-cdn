import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { createUnplugin, type UnpluginInstance } from 'unplugin'
import type { URL } from 'node:url'
import type { InputOptions, OutputOptions } from 'rollup'

export interface Options {
  path?: (
    name: string,
    version: string,
    deps: Record<string, string>,
  ) => string | URL
  importMap?: ImportMap
}

interface ImportMap {
  imports?: Record<string, string>
  scopes?: Record<string, Record<string, string>>
}

interface PackageJson {
  version?: string
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  [key: string]: unknown
}

function getCoreLogic(options: Options = {}) {
  const { path, importMap } = options
  const __dirname = cwd()
  const require = createRequire(`${__dirname}/`)

  let packageJson: PackageJson
  try {
    packageJson = require(resolve(__dirname, 'package.json'))
  } catch {
    packageJson = { dependencies: {} }
  }

  const external = Object.keys(packageJson.dependencies || {})

  const getPackageJSONCache: Record<string, PackageJson> = {}
  function getPackageJSON(packageName: string): PackageJson {
    if (getPackageJSONCache[packageName])
      return getPackageJSONCache[packageName]
    try {
      const packageJsonPath = resolve(
        __dirname,
        'node_modules',
        `${packageName}/package.json`,
      )
      const pkg = require(packageJsonPath) as PackageJson
      getPackageJSONCache[packageName] = pkg
      return pkg
    } catch {
      throw new Error(
        `[unplugin-import-external-cdn] cannot find package.json of "${packageName}", is it installed?`,
      )
    }
  }

  const paths = external.reduce(
    (acc, name) => {
      let pkg: PackageJson
      try {
        pkg = getPackageJSON(name)
      } catch {
        return acc
      }
      const deps: Record<string, string> = {}
      for (const peer of Object.keys(pkg.peerDependencies || {})) {
        if (external.includes(peer)) {
          const { version } = getPackageJSON(peer)
          deps[peer] = version || 'latest'
        }
      }

      if (path) {
        acc[name] = String(path(name, pkg.version || 'latest', deps))
      } else {
        let url = `https://esm.sh/${name}@${pkg.version || 'latest'}?target=esnext`
        const depsEntries = Object.entries(deps)
        if (depsEntries.length) {
          url += `&deps=${depsEntries.map(([k, v]) => `${k}@${v}`).join(',')}`
        }
        acc[name] = url
      }
      return acc
    },
    {} as Record<string, string>,
  )

  return { external, paths, importMap }
}

const unplugin: UnpluginInstance<Options | undefined, false> = createUnplugin(
  (options = {}) => {
    const { external, paths, importMap } = getCoreLogic(options)

    return {
      name: 'unplugin-import-external-cdn',
      resolveId(id: string) {
        if (external.includes(id)) {
          return { id: paths[id] || id, external: true }
        }
      },
      vite: {
        config: () => ({
          build: {
            target: 'esnext',
            rollupOptions: { external, output: { paths } },
          },
        }),
        transformIndexHtml: importMap
          ? (html: string) => {
              const scriptTag = `<script type="importmap">\n    ${JSON.stringify(importMap, null, 4)}\n</script>`
              return html.replace('</title>', `</title>\n${scriptTag}`)
            }
          : undefined,
      },
      rollup: {
        options(options: InputOptions) {
          if (!options) return
          const rollupOpts = options as InputOptions & {
            output?: OutputOptions | OutputOptions[]
          }
          const ext = rollupOpts.external
          rollupOpts.external = (
            id: string,
            parentId: string | undefined,
            isResolved: boolean,
          ) => {
            if (external.includes(id)) return true
            if (typeof ext === 'function') return ext(id, parentId, isResolved)
            if (Array.isArray(ext)) return ext.includes(id)
            return false
          }
          if (Array.isArray(rollupOpts.output)) {
            rollupOpts.output.forEach((out: OutputOptions) => {
              out.paths = { ...paths, ...(out.paths as object) }
            })
          } else if (rollupOpts.output) {
            rollupOpts.output.paths = {
              ...paths,
              ...(rollupOpts.output.paths as object),
            }
          }
        },
      },
      webpack(compiler) {
        if (!compiler.options) return
        compiler.options.externalsType = 'module'
        compiler.options.externals = {
          ...(compiler.options.externals as object),
          ...paths,
        }
      },
      esbuild: {
        setup(build) {
          if (!external.length) return
          const filter = new RegExp(`^(${external.join('|')})$`)
          build.onResolve({ filter }, (args) => {
            return { path: paths[args.path] || args.path, external: true }
          })
        },
      },
    }
  },
)

export default unplugin
