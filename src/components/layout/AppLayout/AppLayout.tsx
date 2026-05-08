import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from '@/components/primitives/IconButton';

type Theme = 'light' | 'dark';

const NAV_ITEMS: ReadonlyArray<{ to: string; label: string }> = [
  { to: '/primitives', label: 'Primitives' },
  { to: '/forms', label: 'Forms' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/layout', label: 'Layout' },
];

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  if (typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const isDark = theme === 'dark';
  return (
    <IconButton
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      variant="ghost"
      size="md"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </IconButton>
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-60 shrink-0 border-r border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h1 className="text-base font-semibold tracking-tight">Admin Template</h1>
          <p className="mt-0.5 text-xs text-foreground-subtle">Component library</p>
        </div>
        <nav className="p-3" aria-label="Primary">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-surface-muted font-medium text-foreground'
                        : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-end gap-2 border-b border-border bg-surface px-6">
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
