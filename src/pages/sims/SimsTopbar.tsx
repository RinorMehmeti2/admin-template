import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { Avatar } from '@/components/primitives/Avatar';
import {
  SidebarMobileToggle,
  useSidebar,
  SidebarCollapseToggle,
} from '@/components/layout/Sidebar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ThemePicker } from '@/components/layout/ThemePicker';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/navigation/DropdownMenu';
import { MOCK_NOTIFS } from './data';
import { NOTIF_ICONS } from './nav';

export function SimsTopbar() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const [notifs] = useState(MOCK_NOTIFS);
  const unread = notifs.filter((n) => n.unread).length;

  return (
    <header
      className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface px-3 sm:px-4 md:px-6"
      data-print="hide"
    >
      <SidebarMobileToggle />
      <SidebarCollapseToggle />

      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-sm font-bold leading-tight tracking-tight text-foreground sm:text-base">
          School Information Management System
        </h1>
        <p className="hidden truncate text-[11px] leading-tight text-foreground-subtle sm:block">
          Administration console · v2.4
        </p>
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button
              type="button"
              aria-label="Notifications"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-danger-foreground">
                  {unread}
                </span>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom-end" className="w-96">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">Notifications</span>
                <span className="text-xs font-normal text-foreground-subtle">{unread} unread</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifs.slice(0, 5).map((n) => {
              const Icon = NOTIF_ICONS[n.iconKey] ?? Bell;
              return (
                <DropdownMenuItem key={n.id} closeOnSelect>
                  <div className="flex w-full items-start gap-3 py-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      <p className="text-xs text-foreground-muted">{n.body}</p>
                      <p className="text-[11px] text-foreground-subtle">{n.ts}</p>
                    </div>
                    {n.unread ? (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-success" />
                    ) : null}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {!isMobile ? (
          <>
            <LocaleSwitcher />
            <ThemePicker />
          </>
        ) : null}
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Account menu"
            >
              <Avatar name="Arta Krasniqi" size="sm" />
              <span className="hidden md:inline-block">Arta</span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-foreground-subtle md:inline-block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom-end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">Arta Krasniqi</span>
                <span className="text-xs font-normal text-foreground-subtle">
                  arta.krasniqi@sims.edu
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/sims/dashboard')}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/sims/administration/theme-configuration')}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/showcase')}>
              <LogOut className="mr-2 h-4 w-4" /> Exit SIMS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
