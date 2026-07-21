import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: 'e2e',
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --host 127.0.0.1',
    url: `${baseURL}/demo/a.html`,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL,
    browserName: 'chromium',
  },
});
