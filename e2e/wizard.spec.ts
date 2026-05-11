import { test, expect } from './fixtures';

const PERSIST_KEY = 'admin-template-wizard-demo-draft';

test.describe('FormWizard demo (/wizard)', () => {
  test('completes the 4-step happy path', async ({ gotoSignedIn, page }) => {
    // Start fresh — clear any persisted draft before navigating.
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key);
    }, PERSIST_KEY);
    await gotoSignedIn('/wizard', 'admin');

    await expect(page.getByRole('heading', { name: /onboarding wizard/i })).toBeVisible();

    // Step 1: Account
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Password').fill('super-secret-pw');
    await page.getByTestId('wizard-next').click();

    // Step 2: Profile
    await expect(page.getByLabel('Full name')).toBeVisible();
    await page.getByLabel('Full name').fill('Ada Lovelace');
    await page.getByLabel('Bio').fill('Builds correct things.');
    await page.getByTestId('wizard-next').click();

    // Step 3: Workspace
    await expect(page.getByLabel('Workspace name')).toBeVisible();
    await page.getByLabel('Workspace name').fill('Analytical Engine Inc');
    await page.getByLabel('Pro').click();
    await page.getByTestId('wizard-next').click();

    // Step 4: Review (auto summary)
    await expect(page.getByTestId('wizard-summary')).toBeVisible();
    await page.getByTestId('wizard-submit').click();

    // Toast on success.
    await expect(page.getByText('Account created')).toBeVisible();
  });

  test('reloads mid-flow and restores draft', async ({ gotoSignedIn, page }) => {
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key);
    }, PERSIST_KEY);
    await gotoSignedIn('/wizard', 'admin');

    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Password').fill('super-secret-pw');
    // Debounce is 500ms — wait for the persistence write before reloading.
    await page.waitForFunction(
      (key) => {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return false;
        try {
          const v = JSON.parse(raw) as { values?: { email?: string } };
          return v?.values?.email === 'ada@example.com';
        } catch {
          return false;
        }
      },
      PERSIST_KEY,
      { timeout: 3000 },
    );

    await page.reload();

    // Restore dialog appears.
    await expect(page.getByText(/Restore draft\?|Restaurar borrador/i)).toBeVisible();
    await page.getByRole('button', { name: /Restore|Restaurar/i }).click();

    // Email pre-filled from draft.
    await expect(page.getByLabel('Email')).toHaveValue('ada@example.com');
  });
});
