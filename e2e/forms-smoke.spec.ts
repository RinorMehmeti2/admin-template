import { test, expect } from '@playwright/test';

const ROUTES = [
  '/forms',
  '/forms/fields',
  '/forms/layouts',
  '/forms/validation',
  '/forms/cards',
  '/forms/tables',
  '/forms/multi-step',
  '/forms/repeater',
  '/forms/async',
];

for (const path of ROUTES) {
  test(`Forms route renders without console errors: ${path}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto(path, { waitUntil: 'networkidle' });

    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });

    expect(pageErrors, `Uncaught errors on ${path}:\n${pageErrors.join('\n')}`).toEqual([]);
    expect(consoleErrors, `Console errors on ${path}:\n${consoleErrors.join('\n')}`).toEqual([]);
  });
}
