import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

const TABS: ReadonlyArray<{ to: string; labelKey: string; end?: boolean }> = [
  { to: '/forms', labelKey: 'nav.forms.overview', end: true },
  { to: '/forms/fields', labelKey: 'nav.forms.fields' },
  { to: '/forms/layouts', labelKey: 'nav.forms.layouts' },
  { to: '/forms/validation', labelKey: 'nav.forms.validation' },
  { to: '/forms/cards', labelKey: 'nav.forms.cards' },
  { to: '/forms/tables', labelKey: 'nav.forms.tables' },
  { to: '/forms/multi-step', labelKey: 'nav.forms.multiStep' },
  { to: '/forms/repeater', labelKey: 'nav.forms.repeater' },
  { to: '/forms/async', labelKey: 'nav.forms.async' },
];

export function FormsLayout() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
          {t('forms.layout.eyebrow')}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{t('forms.layout.title')}</h1>
        <p className="max-w-3xl text-foreground-muted">{t('forms.layout.subtitle')}</p>
      </header>

      <nav
        aria-label={t('forms.layout.title')}
        data-print="hide"
        className="sticky top-0 z-20 -mx-1 overflow-x-auto rounded-md border border-border bg-background/95 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      >
        <ul className="flex flex-nowrap gap-1">
          {TABS.map((tab) => (
            <li key={tab.to} className="shrink-0">
              <NavLink
                to={tab.to}
                end={tab.end === true}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
                  )
                }
              >
                {t(tab.labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Outlet />
    </div>
  );
}
