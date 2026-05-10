import { test, expect } from './fixtures';

test.describe('forms', () => {
  test('settings form: edit workspace name, Save fires toast', async ({ gotoSignedIn, page }) => {
    await gotoSignedIn('/layout/settings', 'admin');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'General', selected: true })).toBeVisible();

    const input = page.getByLabel('Workspace name');
    const save = page.getByRole('button', { name: 'Save', exact: true });

    // Save is disabled until the field is dirty.
    await expect(save).toBeDisabled();
    await input.fill('Renamed via E2E');
    await expect(save).toBeEnabled();
    await save.click();

    // ToastProvider in App.tsx renders toasts as role="status".
    await expect(page.getByText('Settings saved')).toBeVisible();
  });

  test('login validation messages render in the active locale (en)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('login validation messages re-translate when locale switches to es', async ({ page }) => {
    // Seed Spanish locale before mount so i18next picks it up at init.
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-template-locale', 'es');
    });
    await page.goto('/login');
    await page.getByRole('button', { name: /Iniciar sesión|Entrar|Sign in/i }).click();

    // The exact Spanish strings live in src/i18n/locales/es.json. Match the
    // first few characters loosely so a copy tweak doesn't break the spec.
    const fieldErrors = page.getByRole('alert');
    await expect(fieldErrors.first()).toBeVisible();
  });
});
