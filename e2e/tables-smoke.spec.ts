import { test, expect } from './fixtures';

const ROUTES = [
  '/tables',
  '/tables/styles',
  '/tables/sorting',
  '/tables/filtering',
  '/tables/selection',
  '/tables/columns',
  '/tables/sub-rows',
  '/tables/actions',
  '/tables/states',
];

for (const path of ROUTES) {
  test(`Tables route renders without console errors: ${path}`, async ({ page, gotoSignedIn }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await gotoSignedIn(path, 'admin');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });

    expect(pageErrors, `Uncaught errors on ${path}:\n${pageErrors.join('\n')}`).toEqual([]);
    expect(consoleErrors, `Console errors on ${path}:\n${consoleErrors.join('\n')}`).toEqual([]);
  });
}
