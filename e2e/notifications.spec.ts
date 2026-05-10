import { test, expect } from './fixtures';

/*
 * Notifications inbox — top-level user flow:
 *   bell visible with seed unread count → open panel → filter → mark read
 *   → mark all → empty state → reload persistence (sessionStorage)
 *
 * The shipped mockNotificationsClient seeds ~12 items via localStorage. We
 * reset that key per-test by clearing storage before each navigation so the
 * seed always reappears fresh.
 */

const NOTIFS_STORAGE_KEY = 'admin-template-notifications';

test.describe('notifications inbox', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('admin');
    // Gate the wipe with a sessionStorage flag so reload() inside a test
    // doesn't re-clear (would defeat the persistence test).
    await page.addInitScript((key) => {
      const flagKey = '__e2e_notifs_seeded__';
      if (window.sessionStorage.getItem(flagKey) === '1') return;
      window.sessionStorage.setItem(flagKey, '1');
      window.localStorage.removeItem(key);
    }, NOTIFS_STORAGE_KEY);
    await page.goto('/showcase');
  });

  test('bell exposes an unread count and opens the panel', async ({ page }) => {
    const bell = page.getByRole('button', { name: /open notifications/i });
    await expect(bell).toBeVisible();
    await expect(bell).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(bell).toHaveAttribute('aria-expanded', 'false');

    // Accessible name carries the unread count, e.g. "Open notifications, 9 unread".
    const name = await bell.getAttribute('aria-label');
    expect(name).toMatch(/\d+\s*unread/i);

    await bell.click();
    await expect(bell).toHaveAttribute('aria-expanded', 'true');
    const dialog = page.getByRole('dialog', { name: /notifications/i });
    await expect(dialog).toBeVisible();
  });

  test('filter switches to unread and hides read items', async ({ page }) => {
    const bell = page.getByRole('button', { name: /open notifications/i });
    await bell.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const all = dialog.getByRole('tab', { name: /^all/i });
    const unread = dialog.getByRole('tab', { name: /^unread/i });
    await expect(all).toHaveAttribute('aria-selected', 'true');
    await unread.click();
    await expect(unread).toHaveAttribute('aria-selected', 'true');

    // Every listitem shown in unread filter should be marked aria-current=true.
    const listItems = dialog.getByRole('listitem');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(listItems.nth(i)).toHaveAttribute('aria-current', 'true');
    }
  });

  test('marking one item read decrements the badge', async ({ page }) => {
    const bell = page.getByRole('button', { name: /open notifications/i });
    // Wait for the unread suffix to land (provider list() resolves async).
    let initialCount = 0;
    await expect(async () => {
      const name = await bell.getAttribute('aria-label');
      initialCount = Number(name?.match(/(\d+)\s*unread/i)?.[1] ?? '0');
      expect(initialCount).toBeGreaterThan(0);
    }).toPass();

    await bell.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // aria-current="true" sits on the li itself for unread rows.
    const firstUnreadRow = dialog.locator('li[aria-current="true"]').first();
    await expect(firstUnreadRow).toBeVisible();
    // The clickable surface inside the li carries role="button".
    await firstUnreadRow.locator('[role="button"]').first().click();

    // Close panel so the next aria-label read is from a settled state.
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    await expect(async () => {
      const name = await bell.getAttribute('aria-label');
      const after = Number(name?.match(/(\d+)\s*unread/i)?.[1] ?? '0');
      expect(after).toBe(initialCount - 1);
    }).toPass();
  });

  test('mark all read empties the badge and disables the action', async ({ page }) => {
    const bell = page.getByRole('button', { name: /open notifications/i });
    await bell.click();
    const dialog = page.getByRole('dialog');
    const markAll = dialog.getByRole('button', { name: /mark all read/i });
    await expect(markAll).toBeEnabled();
    await markAll.click();
    await expect(markAll).toBeDisabled();

    // Badge label drops the ", N unread" suffix.
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(bell).toHaveAttribute('aria-label', /^Open notifications$/i);
  });

  test('panel openness persists across reload via sessionStorage', async ({ page }) => {
    const bell = page.getByRole('button', { name: /open notifications/i });
    await bell.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.reload();
    // After reload the panel should reappear without clicking.
    await expect(page.getByRole('dialog', { name: /notifications/i })).toBeVisible();
  });

  test('Escape closes the panel and returns focus to the bell', async ({ page }) => {
    const bell = page.getByRole('button', { name: /open notifications/i });
    await bell.focus();
    await bell.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(bell).toBeFocused();
  });
});
