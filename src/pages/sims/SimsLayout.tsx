import { Outlet } from 'react-router-dom';
import { Avatar } from '@/components/primitives/Avatar';
import {
  NavGroup,
  NavLink,
  Sidebar,
  SidebarProvider,
  useSidebar,
} from '@/components/layout/Sidebar';
import { SIMS_NAV } from './nav';
import { SimsTopbar } from './SimsTopbar';
import { SimsBreadcrumbs } from './SimsBreadcrumbs';

function SimsBrand() {
  const { isMobile, collapsed } = useSidebar();

  if (!isMobile && collapsed) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-base font-bold text-primary-foreground">
          S
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-base font-bold text-primary-foreground">
        S
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold tracking-tight text-foreground">SIMS</p>
        <p className="truncate text-[11px] leading-tight text-foreground-subtle">Administration</p>
      </div>
    </div>
  );
}

function SimsFooter() {
  const { isMobile, collapsed } = useSidebar();

  if (!isMobile && collapsed) {
    return (
      <div className="flex w-full justify-center">
        <Avatar name="Arta Krasniqi" size="sm" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <Avatar name="Arta Krasniqi" size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">Arta Krasniqi</p>
        <p className="truncate text-xs text-foreground-subtle">Administrator</p>
      </div>
    </div>
  );
}

function SimsNav() {
  return (
    <nav aria-label="SIMS navigation">
      <ul className="space-y-0.5">
        {SIMS_NAV.map((entry) => {
          if (entry.kind === 'link') {
            const { Icon } = entry;
            return (
              <NavLink
                key={entry.to}
                to={entry.to}
                label={entry.label}
                icon={<Icon className="h-4 w-4" />}
              />
            );
          }
          const { Icon } = entry;
          return (
            <NavGroup
              key={entry.id}
              id={entry.id}
              label={entry.label}
              icon={<Icon className="h-4 w-4" />}
              {...(entry.defaultOpen === true ? { defaultOpen: true } : {})}
            >
              {entry.children.map((child) => {
                const ChildIcon = child.Icon;
                return (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    label={child.label}
                    icon={<ChildIcon className="h-4 w-4" />}
                  />
                );
              })}
            </NavGroup>
          );
        })}
      </ul>
    </nav>
  );
}

function SimsSidebarShell() {
  return (
    <Sidebar header={<SimsBrand />} footer={<SimsFooter />} mobileTitle="SIMS">
      <SimsNav />
    </Sidebar>
  );
}

export function SimsLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <SimsSidebarShell />
        <div className="flex min-w-0 flex-1 flex-col">
          <SimsTopbar />
          <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            <SimsBreadcrumbs />
            <main className="relative flex-1 p-4 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-[1400px]">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
