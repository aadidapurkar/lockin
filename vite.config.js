import { defineConfig } from 'vite'

// For Chrome extensions we don’t need HTML entry points bundled,
// we just tell Vite where to start (your TS entry).
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: 'src/index.ts',
        background: 'src/background.ts'
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    outDir: 'dist',
    sourcemap: true,
  }
})
