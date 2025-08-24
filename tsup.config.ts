import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  target: 'es2022',
  outDir: 'dist',
  shims: true,
  external: [],
  noExternal: [],
  bundle: true,
  platform: 'browser',
  globalName: 'Kengo',
  esbuildOptions(options) {
    options.banner = {
      js: `/**
 * Kengo - A Prisma-like ORM for IndexedDB
 * @version ${process.env.npm_package_version || '0.1.0'}
 * @license MIT
 */`,
    }
  },
})