import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: { entry: 'src/consent.ts', name: 'AsopiConsentBanner', formats: ['iife'], fileName: () => 'consent/v1/consent.js' },
    rollupOptions: { output: { assetFileNames: 'consent/v1/[name][extname]' } },
  },
});
