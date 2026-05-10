import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 5180);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const isCI = process.env.CI === 'true';

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  reporter: isCI
    ? [['html', { open: 'never', outputFolder: 'playwright-report' }], ['list'], ['github']]
    : [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    /*
     * E2E runs against the Vite dev server with MSW enabled. Routes like
     * /tables call /api/users, which is only mocked when VITE_USE_MSW=true
     * mounts the MSW worker (see src/main.tsx). The production preview
     * build does not include MSW.
     */
    /*
     * `pnpm dev` forwards trailing args to Vite. Do NOT use the `--`
     * separator — it gets passed through and Vite stops parsing flags after
     * the literal `--`.
     */
    command: `pnpm exec vite --port ${PORT} --strictPort --mode e2e`,
    env: { ...process.env, VITE_USE_MSW: 'true' },
    url: BASE_URL,
    /*
     * Always spawn a fresh server. Reusing an existing one is convenient but
     * it bypasses the env / mode flags above — a stale `pnpm dev` on the
     * same port will silently serve without MSW, and the spec failures look
     * like assertion bugs rather than env bugs.
     */
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
