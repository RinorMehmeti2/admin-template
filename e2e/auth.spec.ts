import { test, expect } from './fixtures';

test.describe('auth', () => {
  test('login success: valid credentials redirect to overview', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('admin');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/showcase$/);
    // Topbar opener becomes visible once layout chrome mounts.
    await expect(page.getByRole('button', { name: /Open command palette/i })).toBeVisible();
  });

  test('login failure: invalid credentials show inline error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@example.com');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('alert')).toContainText(/Sign-in failed/);
    await expect(page).toHaveURL(/\/login$/);
  });

  test('client validation: empty submit shows required errors', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('ProtectedRoute redirects unauthenticated traffic to /login', async ({ page }) => {
    await page.goto('/tables');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logout clears the session and bounces back to login', async ({ page, gotoSignedIn }) => {
    await gotoSignedIn('/showcase', 'admin');
    await expect(page).toHaveURL(/\/showcase$/);

    // The account menu trigger is labelled "Account menu for <name>" in AppLayout.tsx.
    await page.getByRole('button', { name: /Account menu/i }).click();
    await page.getByRole('menuitem', { name: /Log out/i }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('RoleGate hides admin-only content from non-admins', async ({ gotoSignedIn, page }) => {
    await gotoSignedIn('/admin', 'viewer');
    await expect(page.getByText(/do not have permission/i)).toBeVisible();
  });

  test('RoleGate allows admin-only content for admins', async ({ gotoSignedIn, page }) => {
    await gotoSignedIn('/admin', 'admin');
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
    await expect(page.getByText(/do not have permission/i)).not.toBeVisible();
  });
});
