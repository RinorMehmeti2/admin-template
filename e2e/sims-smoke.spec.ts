import { test, expect } from '@playwright/test';

const ROUTES = [
  '/sims/dashboard',
  '/sims/administration/users',
  '/sims/administration/roles',
  '/sims/administration/modules',
  '/sims/administration/menu',
  '/sims/administration/holidays',
  '/sims/administration/email-configuration',
  '/sims/administration/notifications',
  '/sims/administration/reports',
  '/sims/administration/statistics',
  '/sims/administration/logs',
  '/sims/administration/lookup-tables',
  '/sims/administration/theme-configuration',
  '/sims/administration/schema-drift',
];

for (const path of ROUTES) {
  test(`SIMS route renders without console errors: ${path}`, async ({ page }) => {
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
