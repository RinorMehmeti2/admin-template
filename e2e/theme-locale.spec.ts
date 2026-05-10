import { test, expect } from './fixtures';

test.describe('theme + locale persistence', () => {
  test('toggling theme persists across reload', async ({ gotoSignedIn, page }) => {
    // Seed light explicitly so "click Dark" produces an observable change.
    await gotoSignedIn('/showcase', 'admin', { theme: 'light' });
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // ThemeToggle aria-label: "Theme: <current>. Click to change."
    await page.getByRole('button', { name: /^Theme:/ }).click();
    const darkOption = page.getByRole('menuitemradio', { name: 'Dark' });
    await expect(darkOption).toBeVisible();
    await darkOption.click();

    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('admin-template-theme')))
      .toBe('dark');
    // Playwright's class/attribute observers race oddly against the React
    // useEffect that toggles the dark class on <html>; poll classList directly.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
      .toBe(true);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.classList.contains('dark')).catch(() => false),
      )
      .toBe(true);
  });

  test('switching locale persists across reload', async ({ gotoSignedIn, page }) => {
    await gotoSignedIn('/showcase', 'admin', { locale: 'en' });

    // LocaleSwitcher aria-label is t('locale.switcher.aria') — "Change language" in en.
    await page.getByRole('button', { name: 'Change language' }).click();
    await page.getByRole('menuitemradio', { name: /Español/ }).click();

    await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toMatch(/^es/);
    // Sanity: storage cache reflects es so the post-reload detector picks it.
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('admin-template-locale')))
      .toBe('es');

    await page.reload({ waitUntil: 'domcontentloaded' });
    // .catch swallows the brief "execution context destroyed" window between
    // reload start and the new document being ready (firefox is slower here).
    // Bump the poll timeout — i18next detection + React commit racing the lang
    // attribute write is observably slower on firefox than chromium.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.lang).catch(() => 'navigating'), {
        timeout: 10_000,
      })
      .toMatch(/^es/);
  });
});
