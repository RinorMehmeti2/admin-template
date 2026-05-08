import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { SidebarProvider } from '@/components/layout/Sidebar';

export interface PageShellProps {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  className?: string;
}

/*
 * Wires Sidebar + Topbar + a scrollable main into a full-viewport shell.
 * Wraps everything in SidebarProvider so the sidebar's collapse / mobile-open
 * state is reachable from anywhere inside (e.g. a topbar toggle button).
 */
export function PageShell({ sidebar, topbar, children, className }: PageShellProps) {
  return (
    <SidebarProvider>
      <div className={cn('flex min-h-screen bg-background text-foreground', className)}>
        {sidebar}
        <div className="flex min-w-0 flex-1 flex-col">
          {topbar}
          <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
