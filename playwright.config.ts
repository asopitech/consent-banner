import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: 'e2e', webServer: { command: 'npm run build && python3 -m http.server 4173 -d dist --bind 127.0.0.1', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI }, use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium' } });
