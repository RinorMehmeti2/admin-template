import { test, expect } from './fixtures';

const ROUTES = [
  // Components menu
  '/primitives',
  '/feedback',
  '/data',
  '/dropzone',
  '/motion',
  '/new-components',
  // Data menu
  '/tree',
  '/timeline',
  '/charts',
  '/kanban',
  '/files',
  '/gallery',
  // Playground menu
  '/playground',
  // Layout menu
  '/layout',
  '/layout/users',
  '/layout/settings',
  '/split',
  '/focus',
  '/positioning',
  '/workspace',
];

for (const path of ROUTES) {
  test(`route renders without console errors: ${path}`, async ({ page, gotoSignedIn }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await gotoSignedIn(path);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('main').first()).toBeVisible({ timeout: 5000 });

    expect(pageErrors, `Uncaught errors on ${path}:\n${pageErrors.join('\n')}`).toEqual([]);
    expect(consoleErrors, `Console errors on ${path}:\n${consoleErrors.join('\n')}`).toEqual([]);
  });
}
