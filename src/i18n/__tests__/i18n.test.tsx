import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n, { LOCALE_STORAGE_KEY } from '@/i18n';
import { LocaleProvider, useLocale } from '@/context/LocaleProvider';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { LoginPage } from '@/pages/auth/login/LoginPage';
import { AuthProvider } from '@/auth/AuthProvider';
import type { AuthClient } from '@/auth/AuthClient';

function makeClient(): AuthClient {
  return {
    async login() {
      throw { code: 'invalid_credentials', message: 'nope' };
    },
    async logout() {},
    async refresh() {
      return null;
    },
    async getCurrentUser() {
      return null;
    },
  };
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider client={makeClient()}>
        <LocaleProvider>{children}</LocaleProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('i18n', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await i18n.changeLanguage('en');
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
    window.localStorage.clear();
  });

  it('switches rendered text in the login form when locale changes', async () => {
    const user = userEvent.setup();
    render(
      <Wrap>
        <LocaleSwitcher />
        <LoginPage />
      </Wrap>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sign in');

    await user.click(screen.getByRole('button', { name: /change language/i }));
    await user.click(await screen.findByRole('menuitemradio', { name: /español/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Iniciar sesión');
    });
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  });

  it('translates zod validation messages', async () => {
    const user = userEvent.setup();
    render(
      <Wrap>
        <LoginPage />
      </Wrap>,
    );

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();

    await act(async () => {
      await i18n.changeLanguage('es');
    });
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(await screen.findByText('El correo es obligatorio')).toBeInTheDocument();
  });

  it('persists choice via localStorage detector cache', async () => {
    await act(async () => {
      await i18n.changeLanguage('es');
    });
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('es');
  });

  it('restores persisted choice on reload', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'es');
    const detected = i18n.services.languageDetector?.detect();
    const head = Array.isArray(detected) ? detected[0] : detected;
    expect(head).toBe('es');
  });

  it('falls back to fallbackLng for missing keys', () => {
    const missing = i18n.t('this.key.does.not.exist', { defaultValue: 'this.key.does.not.exist' });
    expect(missing).toBe('this.key.does.not.exist');

    expect(i18n.getFixedT('en')('common.save')).toBe('Save');
    expect(i18n.getFixedT('es')('common.save')).toBe('Guardar');
  });

  it('exposes locale and dir from useLocale', () => {
    function Probe() {
      const { locale, dir } = useLocale();
      const { t } = useTranslation();
      return (
        <>
          <span data-testid="locale">{locale}</span>
          <span data-testid="dir">{dir}</span>
          <span data-testid="hello">{t('common.save')}</span>
        </>
      );
    }
    render(
      <Wrap>
        <Probe />
      </Wrap>,
    );
    expect(screen.getByTestId('locale').textContent).toBe('en');
    expect(screen.getByTestId('dir').textContent).toBe('ltr');
    expect(screen.getByTestId('hello').textContent).toBe('Save');
  });
});
