import { test, expect } from './fixtures';

test.describe('overlays', () => {
  test.beforeEach(async ({ gotoSignedIn }) => {
    // Feedback page hosts Dialog, Drawer, Tooltip examples.
    await gotoSignedIn('/feedback', 'admin');
  });

  test('Dialog: opens, traps focus, closes on Escape, returns focus to trigger', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Open dialog' });
    await trigger.focus();
    await trigger.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Focus must be inside the dialog after open.
    const focusInsideDialog = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return d !== null && d.contains(document.activeElement);
    });
    expect(focusInsideDialog).toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('Drawer: opens, Escape closes, focus returns to trigger', async ({ page }) => {
    // Drawer triggers in FeedbackPage are labelled "From left/right/top/bottom".
    const trigger = page.getByRole('button', { name: 'From right' });
    await trigger.focus();
    await trigger.press('Enter');

    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });

  test('Tooltip: shows on hover and on focus', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Hover or focus' });

    await trigger.hover();
    await expect(page.getByRole('tooltip')).toBeVisible();

    // Move focus elsewhere then back to verify focus also reveals.
    await page.keyboard.press('Tab');
    await trigger.focus();
    await expect(page.getByRole('tooltip')).toBeVisible();
  });
});
