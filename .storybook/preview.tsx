import { useEffect } from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, type Theme } from '../src/context/ThemeProvider';
import { LocaleProvider } from '../src/context/LocaleProvider';
import { ToastProvider } from '../src/context/ToastProvider';
import '../src/i18n';
import { TooltipProvider } from '../src/components/feedback/Tooltip';
import { CommandRegistryProvider } from '../src/components/overlays/CommandPalette';
import { NotificationsProvider } from '../src/notifications';
import { createMockNotificationsClient } from '../src/notifications/mockNotificationsClient';
import '../src/styles/globals.css';

// Stable, non-persisting client so stories don't share a localStorage cache.
const storyNotificationsClient = createMockNotificationsClient({
  persist: false,
  emitEveryMs: null,
  latencyMs: 0,
});

/**
 * Sync the toolbar theme into our ThemeProvider's persistence so its initial
 * state and addon-themes' html.dark class agree. Re-mounts the provider tree
 * on theme change via `key` to ensure no stale subscribers.
 */
const withProviders: Decorator = (Story, context) => {
  const theme = (context.globals.theme as Theme | undefined) ?? 'light';

  // Keep ThemeProvider's persisted choice in lock-step with the toolbar.
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('admin-template-theme', theme);
    } catch {
      // ignore
    }
  }

  // Stories that import the route-aware MemoryRouter outer wrapper still get
  // a fresh router instance per story.
  return (
    <MemoryRouter>
      <ThemeProvider key={theme} defaultTheme={theme}>
        <LocaleProvider>
          <NotificationsProvider client={storyNotificationsClient}>
            <CommandRegistryProvider>
              <ToastProvider position="top-right">
                <TooltipProvider delayDuration={300}>
                  <StoryFrame>
                    <Story />
                  </StoryFrame>
                </TooltipProvider>
              </ToastProvider>
            </CommandRegistryProvider>
          </NotificationsProvider>
        </LocaleProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

function StoryFrame({ children }: { children: React.ReactNode }) {
  // Storybook's preview iframe has its own <html>; the addon-themes class
  // toggle targets it. Make sure the surrounding paint matches our tokens.
  useEffect(() => {
    document.body.style.background = 'var(--color-background)';
    document.body.style.color = 'var(--color-foreground)';
  }, []);
  return <div className="bg-background text-foreground">{children}</div>;
}

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    layout: 'padded',
    a11y: { test: 'todo' },
  },
  decorators: [
    withProviders,
    withThemeByClassName<Theme>({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
  ],
  tags: ['autodocs'],
};

export default preview;
