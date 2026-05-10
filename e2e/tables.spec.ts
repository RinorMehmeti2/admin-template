import { test, expect } from './fixtures';

test.describe('DataTable', () => {
  test.beforeEach(async ({ gotoSignedIn }) => {
    await gotoSignedIn('/tables', 'admin');
  });

  test('renders the Users DataTable once data resolves', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    // Three Cards on this page: SimpleTable, Users, Orders. Wait for users to load.
    await expect(page.getByPlaceholder(/Search users/i)).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(3);
  });

  test('global search filters rows', async ({ page }) => {
    const search = page.getByPlaceholder(/Search users/i);
    await search.fill('zzz_no_match_zzz');
    // EmptyState heading "No users yet" replaces the rows once nothing matches.
    await expect(page.getByRole('heading', { name: 'No users yet' })).toBeVisible();
    await search.fill('');
  });

  test('sort: clicking a column header toggles asc / desc', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search users/i)).toBeVisible();
    // The Users column header is a button inside a <th>.
    const userHeader = page.getByRole('button', { name: /^User$/ }).first();
    const headerCell = userHeader.locator('xpath=ancestor::th');

    await userHeader.click();
    await expect(headerCell).toHaveAttribute('aria-sort', 'ascending');
    await userHeader.click();
    await expect(headerCell).toHaveAttribute('aria-sort', 'descending');
  });

  test('paginate: Next page advances', async ({ page }) => {
    // Orders table — the only one with > pageSize rows + a Next button.
    const ordersHeading = page.getByRole('heading', { name: 'Orders' });
    await expect(ordersHeading).toBeVisible();
    // The orders Card sits at the bottom of the page; grab its Next button by
    // scoping to the last DataTable on screen.
    await expect(page.getByText(/Page 1 of/).last()).toBeVisible();
    await page.getByLabel('Next page').last().click();
    await expect(page.getByText(/Page 2 of/).last()).toBeVisible();
  });

  test('row select + bulk action: select all, then "Delete N" appears', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search users/i)).toBeVisible();
    await page.getByLabel('Select all rows on page').first().click();
    await expect(page.getByRole('button', { name: /^Delete \d+/ })).toBeVisible();
  });
});
