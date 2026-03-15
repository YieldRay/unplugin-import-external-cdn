# Project Guidelines

## Project Overview

This project (`unplugin-import-external-cdn`) is a multi-framework plugin based on `unplugin` that automatically rewrites external package imports to CDN URLs (defaulting to esm.sh).

## Code Style & Conventions

- **Language**: TypeScript (strict mode, ES2022+ target).
- **Linter & Formatter**: ESLint and Prettier, extending `@sxzz/eslint-config` and `@sxzz/prettier-config`.
- **Package Manager**: pnpm (v10+). Ensure to use `pnpm` for all dependency management.
- **Entry Points**: Shallow entry points are used for each builder natively (e.g., `src/vite.ts`, `src/webpack.ts`).

## Architecture & Boundaries

- **Core Logic**: `src/index.ts` contains the main `createUnplugin` instance which reads `package.json`, extracts external dependencies, and generates CDN URLs.
- **Builder Adapters**: Framework-specific entry files (`vite.ts`, `webpack.ts`, `rollup.ts`, `esbuild.ts`, `rspack.ts`, `rolldown.ts`) provide thin wrappers re-exporting the typed unplugin instance for each build tool.

## Build and Test

- **Build**: `pnpm run build` (uses `tsdown`, outputs to `dist/`)
- **Dev/Watch**: `pnpm run dev`
- **Test**: `pnpm run test` (uses `vitest` with fixtures in `tests/fixtures/`)
- **Lint**: `pnpm run lint` or `pnpm run lint:fix`
- **Typecheck**: `pnpm run typecheck`
- **Release**: `pnpm run release` (using `bumpp`)
