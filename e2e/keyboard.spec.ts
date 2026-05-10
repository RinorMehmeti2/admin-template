import { test, expect } from './fixtures';

test.describe('command palette', () => {
  test.beforeEach(async ({ gotoSignedIn }) => {
    await gotoSignedIn('/showcase', 'admin');
  });

  test('Ctrl/Cmd+K opens the palette; Escape closes it', async ({ page }) => {
    // The opener button in the topbar is always present and focusable;
    // pressing Cmd/Ctrl+K from there delivers the chord to document.
    const opener = page.getByRole('button', { name: 'Open command palette' });
    await opener.focus();
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+k' : 'Control+k');

    const palette = page.getByRole('dialog');
    await expect(palette).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(palette).not.toBeVisible();
  });

  test('typing filters commands; Enter navigates', async ({ page }) => {
    const opener = page.getByRole('button', { name: 'Open command palette' });
    await opener.focus();
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+k' : 'Control+k');
    await expect(page.getByRole('dialog')).toBeVisible();

    const input = page.getByRole('combobox');
    await input.fill('tables');

    // The matching command becomes the active option; pressing Enter performs.
    const tablesOption = page.getByRole('option', { name: /Go to Tables/i });
    await expect(tablesOption).toBeVisible();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/tables$/);
  });

  test('"/" opens the palette when not typing in an input', async ({ page }) => {
    // Focus a non-input element so the "/" handler doesn't bail.
    const opener = page.getByRole('button', { name: 'Open command palette' });
    await opener.focus();
    await page.keyboard.press('/');
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
