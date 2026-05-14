import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import { cn } from '@/lib/cn';

const TABS: ReadonlyArray<{ to: string; labelKey: string; end?: boolean }> = [
  { to: '/tables', labelKey: 'nav.tables.overview', end: true },
  { to: '/tables/styles', labelKey: 'nav.tables.styles' },
  { to: '/tables/sorting', labelKey: 'nav.tables.sorting' },
  { to: '/tables/filtering', labelKey: 'nav.tables.filtering' },
  { to: '/tables/selection', labelKey: 'nav.tables.selection' },
  { to: '/tables/columns', labelKey: 'nav.tables.columns' },
  { to: '/tables/sub-rows', labelKey: 'nav.tables.subRows' },
  { to: '/tables/actions', labelKey: 'nav.tables.actions' },
  { to: '/tables/states', labelKey: 'nav.tables.states' },
];

export function TablesLayout() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <SimsPageHeader title={t('tables.layout.title')} description={t('tables.layout.subtitle')} />

      <nav
        aria-label={t('tables.layout.title')}
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
                    'inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-surface text-foreground-muted hover:bg-surface-muted',
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
