import { test as base, expect, type Page } from '@playwright/test';

/*
 * E2E fixtures.
 *
 * The shipped `mockAuthClient` (src/auth/mockAuthClient.ts) reads its session
 * from `localStorage` under the key `admin-template-auth-user`. We seed that
 * key directly via `addInitScript` so test pages start signed in without
 * driving the login form for every spec. The login form is exercised
 * separately in `auth.spec.ts`.
 *
 * Roles map to the three demo accounts in mockAuthClient.ts.
 */

export type Role = 'admin' | 'editor' | 'viewer';

interface MockUser {
  id: string;
  name: string;
  email: string;
  roles: ReadonlyArray<Role>;
}

const USERS: Record<Role, MockUser> = {
  admin: { id: 'u_1', name: 'Ada Admin', email: 'admin@example.com', roles: ['admin'] },
  editor: { id: 'u_2', name: 'Edie Editor', email: 'editor@example.com', roles: ['editor'] },
  viewer: { id: 'u_3', name: 'Vic Viewer', email: 'viewer@example.com', roles: ['viewer'] },
};

const STORAGE_KEY = 'admin-template-auth-user';
const LOCALE_KEY = 'admin-template-locale';
const THEME_KEY = 'admin-template-theme';
const SEEDED_FLAG = '__e2e_prefs_seeded__';

interface SignInOptions {
  /** Optional locale to seed (default: leave detector chain alone). */
  locale?: 'en' | 'es';
  /** Optional theme to seed. */
  theme?: 'light' | 'dark' | 'system';
}

interface Helpers {
  /** Seed an authenticated session for `role` before the next page load. */
  loginAs(role: Role, options?: SignInOptions): Promise<void>;
  /** Seed the session and navigate to `path`. */
  gotoSignedIn(path: string, role?: Role, options?: SignInOptions): Promise<void>;
  /** Clear the seeded session — useful between sub-tests. */
  signOut(): Promise<void>;
}

type Fixtures = Helpers & { page: Page };

export const test = base.extend<Fixtures>({
  loginAs: async ({ page }, use) => {
    const fn: Helpers['loginAs'] = async (role, options) => {
      const user = USERS[role];
      // addInitScript runs on EVERY navigation (incl. reload). Re-seed the
      // auth user every time (signOut() removes it explicitly), but seed
      // locale/theme only on the first navigation — guarded by a localStorage
      // flag — so a test that exercises setTheme/setLocale + reload sees its
      // own choice survive instead of being clobbered back to the seed.
      await page.addInitScript(
        ({ key, value, localeKey, locale, themeKey, theme, flagKey }) => {
          window.localStorage.setItem(key, value);
          if (window.localStorage.getItem(flagKey) === '1') return;
          window.localStorage.setItem(flagKey, '1');
          if (locale !== null) window.localStorage.setItem(localeKey, locale);
          if (theme !== null) window.localStorage.setItem(themeKey, theme);
        },
        {
          key: STORAGE_KEY,
          value: JSON.stringify(user),
          localeKey: LOCALE_KEY,
          locale: options?.locale ?? null,
          themeKey: THEME_KEY,
          theme: options?.theme ?? null,
          flagKey: SEEDED_FLAG,
        },
      );
    };
    await use(fn);
  },

  gotoSignedIn: async ({ page, loginAs }, use) => {
    const fn: Helpers['gotoSignedIn'] = async (path, role = 'admin', options) => {
      await loginAs(role, options);
      await page.goto(path);
    };
    await use(fn);
  },

  signOut: async ({ page }, use) => {
    const fn: Helpers['signOut'] = async () => {
      await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY);
    };
    await use(fn);
  },
});

export { expect };
