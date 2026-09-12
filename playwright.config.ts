import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:4173/princess-grace-sitio/';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: BASE_URL, trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    { name: 'pixel-7', use: { ...devices['Pixel 7 landscape'] } },
    { name: 'iphone-13', use: { ...devices['iPhone 13 landscape'] } },
  ],
});
