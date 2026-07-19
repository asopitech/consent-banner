import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2019',
    sourcemap: true,
    minify: 'esbuild',
    lib: {
      entry: 'src/index.ts',
      name: 'AsopiConsentBundle',
      formats: ['iife'],
      fileName: () => 'consent/v1/consent.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith('.css')
            ? 'consent/v1/consent.css'
            : 'assets/[name]-[hash][extname]',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
  },
});
