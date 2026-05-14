import { Home, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconButton } from '@/components/primitives/IconButton';
import { SIMS_BREADCRUMBS } from './nav';

export function SimsBreadcrumbs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const crumbs = SIMS_BREADCRUMBS[pathname] ?? ['Home'];

  return (
    <div
      className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-surface px-3 py-2 sm:px-4 md:px-6"
      data-print="hide"
    >
      <IconButton
        aria-label="Home"
        variant="ghost"
        size="sm"
        onClick={() => navigate('/sims/dashboard')}
      >
        <Home className="h-4 w-4" />
      </IconButton>
      <ol className="flex items-center gap-1 text-sm">
        {crumbs.map((label, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${label}-${i}`} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight className="h-3.5 w-3.5 text-foreground-subtle" /> : null}
              <span className={last ? 'font-semibold text-foreground' : 'text-foreground-muted'}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
