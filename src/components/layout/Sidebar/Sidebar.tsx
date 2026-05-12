import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  PanelLeft,
  PanelLeftClose,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { IconButton } from '@/components/primitives/IconButton';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/feedback/Drawer';

/*
 * Sidebar context — accessed by both the sidebar itself and the topbar's
 * collapse/menu buttons. PageShell wraps everything in <SidebarProvider>.
 *
 * State:
 *   - `collapsed` — desktop only; persists to localStorage
 *   - `mobileOpen` — mobile only; controls the Drawer
 *   - `isMobile`  — < md breakpoint
 */

const STORAGE_KEY = 'sidebar-collapsed';

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (next: boolean) => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (ctx === null) throw new Error('useSidebar must be used inside <SidebarProvider>');
  return ctx;
}

function readStoredCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export interface SidebarProviderProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarProvider({ children, defaultCollapsed }: SidebarProviderProps) {
  const [collapsed, setCollapsedState] = useState<boolean>(
    () => defaultCollapsed ?? readStoredCollapsed(),
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore (private mode, etc.)
    }
  }, []);

  // Auto-close mobile drawer on viewport switch back to desktop. Intentional
  // setState-in-effect: clearing transient UI state in response to an external
  // (matchMedia) signal is the documented pattern.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isMobile && mobileOpen) setMobileOpen(false);
  }, [isMobile, mobileOpen]);

  const value = useMemo<SidebarContextValue>(
    () => ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile }),
    [collapsed, setCollapsed, mobileOpen, isMobile],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/*  Sidebar (desktop) + mobile drawer                                          */
/* -------------------------------------------------------------------------- */

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  /** Header content (logo, brand). Renders in the sticky top region. */
  header?: ReactNode;
  /** Footer content (e.g. user card). Sticks to the bottom. */
  footer?: ReactNode;
  /** Collapsed width in rem. Default: 4 */
  collapsedWidth?: number;
  /** Expanded width in rem. Default: 15 (240px) */
  expandedWidth?: number;
  mobileTitle?: string;
}

export function Sidebar({
  ref,
  header,
  footer,
  children,
  className,
  collapsedWidth = 4,
  expandedWidth = 15,
  mobileTitle,
  ...rest
}: SidebarProps) {
  const ctx = useSidebar();
  const { t } = useTranslation();
  const resolvedMobileTitle = mobileTitle ?? t('sidebar.mobileTitle');

  if (ctx.isMobile) {
    return (
      <Drawer open={ctx.mobileOpen} onOpenChange={ctx.setMobileOpen} side="left" responsive={false}>
        <DrawerContent className="w-72 max-w-[85vw]" data-print="hide">
          <DrawerHeader>
            <DrawerTitle>{resolvedMobileTitle}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            {header !== undefined ? <div className="mb-4">{header}</div> : null}
            {children}
            {footer !== undefined ? <div className="mt-4">{footer}</div> : null}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  const widthRem = ctx.collapsed ? collapsedWidth : expandedWidth;
  return (
    <aside
      ref={ref}
      data-collapsed={ctx.collapsed}
      data-print="hide"
      style={{ width: `${widthRem}rem` }}
      className={cn(
        'relative flex shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ease-in-out',
        className,
      )}
      {...rest}
    >
      {header !== undefined ? (
        <div className="flex h-14 shrink-0 items-center border-b border-border px-3">{header}</div>
      ) : null}
      <button
        type="button"
        aria-label={ctx.collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        aria-expanded={!ctx.collapsed}
        onClick={() => ctx.setCollapsed(!ctx.collapsed)}
        className="absolute top-7 right-0 z-30 flex h-7 w-7 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground-muted shadow-md transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        data-print="hide"
      >
        {ctx.collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">{children}</div>
      {footer !== undefined ? <div className="border-t border-border p-2">{footer}</div> : null}
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Triggers                                                                  */
/* -------------------------------------------------------------------------- */

export function SidebarCollapseToggle({ className }: { className?: string }) {
  const ctx = useSidebar();
  const { t } = useTranslation();
  if (ctx.isMobile) return null;
  return (
    <IconButton
      aria-label={ctx.collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
      variant="ghost"
      size="sm"
      onClick={() => ctx.setCollapsed(!ctx.collapsed)}
      className={className}
    >
      {ctx.collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
    </IconButton>
  );
}

export function SidebarMobileToggle({ className }: { className?: string }) {
  const ctx = useSidebar();
  const { t } = useTranslation();
  if (!ctx.isMobile) return null;
  return (
    <IconButton
      aria-label={t('sidebar.openNav')}
      variant="ghost"
      size="sm"
      onClick={() => ctx.setMobileOpen(true)}
      className={className}
    >
      <MenuIcon className="h-4 w-4" />
    </IconButton>
  );
}
