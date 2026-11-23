import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 240000,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:8081',
    navigationTimeout: 120000,
    screenshot: 'on',
    video: 'on',
    trace: 'on',
  },
  projects: [{ name: 'celular', use: { ...devices['Pixel 7'] } }],
});