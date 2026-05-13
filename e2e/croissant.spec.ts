import { test, expect } from './fixtures';

/*
 * Smoke test for the Croissant tour. Visits each of the seven child routes
 * (signed in) and asserts that the page heading renders and that the
 * "Components used on this page" footer card is present. This is intentionally
 * shallow — variant coverage lives in component-level tests and stories.
 */

const ROUTES: ReadonlyArray<{ path: string; heading: RegExp }> = [
  { path: '/croissant/bakery-dashboard', heading: /Bakery dashboard/i },
  { path: '/croissant/cards-and-people', heading: /Cards & people/i },
  { path: '/croissant/forms-bakery', heading: /Forms bakery/i },
  { path: '/croissant/feedback-theater', heading: /Feedback theater/i },
  { path: '/croissant/data-lab', heading: /Data lab/i },
  { path: '/croissant/navigation-trail', heading: /Navigation trail/i },
  { path: '/croissant/timeline-and-activity', heading: /Timeline & activity/i },
];

test.describe('Croissant tour smoke', () => {
  for (const { path, heading } of ROUTES) {
    test(`renders ${path}`, async ({ gotoSignedIn, page }) => {
      await gotoSignedIn(path, 'admin');
      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
      await expect(page.getByTestId('components-used-footer')).toBeVisible();
    });
  }

  test('sidebar surfaces a Croissant group', async ({ gotoSignedIn, page }) => {
    await gotoSignedIn('/croissant/bakery-dashboard', 'admin');
    // The nav group renders as a button (expandable) labelled "Croissant".
    const group = page.getByRole('button', { name: /Croissant/ });
    await expect(group.first()).toBeVisible();
  });

  test('croissant root redirects to bakery dashboard', async ({ gotoSignedIn, page }) => {
    await gotoSignedIn('/croissant', 'admin');
    await expect(page).toHaveURL(/\/croissant\/bakery-dashboard$/);
  });
});
