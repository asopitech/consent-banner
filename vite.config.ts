import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: { entry: 'src/index.ts', name: 'AsopiConsent', formats: ['iife'], fileName: () => 'consent/v1/consent.js', cssFileName: 'consent/v1/consent' },
  },
});
