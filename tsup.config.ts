import { defineConfig } from 'tsup'

export default defineConfig([
  // Development build
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: false,
    treeshake: true,
    target: 'es2020',
    outDir: 'dist',
    platform: 'browser',
    env: {
      NODE_ENV: 'development'
    },
    esbuildOptions(options) {
      options.keepNames = true
    },
    onSuccess: 'echo "📦 Development build complete"'
  },
  // Production build (minified)
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: false,
    sourcemap: false,
    clean: false,
    minify: 'terser',
    treeshake: true,
    target: 'es2020',
    outDir: 'dist',
    platform: 'browser',
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.min.js' : '.min.cjs'
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
        passes: 2,
      },
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
      format: {
        comments: false,
      },
    },
    env: {
      NODE_ENV: 'production'
    },
    esbuildOptions(options) {
      options.legalComments = 'none'
      options.banner = {
        js: `/* Kengo v${process.env.npm_package_version || '0.1.0'} | MIT */`,
      }
    },
    onSuccess: 'echo "✨ Production build complete"'
  }
])