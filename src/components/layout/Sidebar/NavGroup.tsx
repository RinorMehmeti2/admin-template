import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  useRef,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { usePosition } from '@/hooks/usePosition';
import { Portal } from '@/components/overlays/Portal';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import { useSidebar } from './Sidebar';
import type { NavLinkProps } from './NavLink';

function collectChildPaths(children: ReactNode): string[] {
  const paths: string[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement<{ to?: unknown }>(child)) return;
    const to = child.props.to;
    if (typeof to === 'string') paths.push(to);
  });
  return paths;
}

function isPathActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export interface NavGroupProps {
  ref?: Ref<HTMLLIElement>;
  /** Stable id used as the open-group key in the lifted state. */
  id: string;
  label: string;
  icon: ReactNode;
  children: ReactNode;
  /** Auto-open in inline mode when a descendant matches the current route. Default: true. */
  expandOnActiveChild?: boolean;
  /** Kept for API stability — no effect in the auto-follow model. */
  defaultOpen?: boolean;
  className?: string;
}

export function NavGroup({
  ref,
  id,
  label,
  icon,
  children,
  expandOnActiveChild = true,
  className,
}: NavGroupProps) {
  const { isMobile, collapsed, openGroupIds, setOpenGroupIds } = useSidebar();
  const inline = isMobile || !collapsed;
  const { pathname } = useLocation();
  const childPaths = collectChildPaths(children);
  const hasActiveChild = childPaths.some((p) => isPathActive(pathname, p));

  // Resolution:
  //   inline    → open if user opened OR (auto-follow && has active child).
  //   collapsed → flyout opens only on user gesture; never auto.
  const manuallyOpen = openGroupIds.has(id);
  const autoOpen = expandOnActiveChild && hasActiveChild;
  const open = inline ? manuallyOpen || autoOpen : manuallyOpen;

  // Toggle: inline = multi-open accordion (flip own id). Collapsed = single-flyout
  // (clicking another icon swaps which flyout is shown).
  const toggle = () => {
    setOpenGroupIds((prev) => {
      if (inline) {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }
      if (prev.has(id)) {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }
      return new Set([id]);
    });
  };

  const closeOwnFlyout = () => {
    setOpenGroupIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const triggerRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const flyoutOpen = !inline && open;
  const flyoutPos = usePosition(triggerRef, flyoutRef, {
    placement: 'right',
    offset: 8,
    enabled: flyoutOpen,
  });

  useClickOutside<HTMLElement>(
    [triggerRef as RefObject<HTMLElement | null>, flyoutRef as RefObject<HTMLElement | null>],
    closeOwnFlyout,
    { enabled: flyoutOpen },
  );
  useEscapeKey(
    () => {
      closeOwnFlyout();
      triggerRef.current?.focus();
    },
    { enabled: flyoutOpen },
  );

  const listId = useId();

  if (inline) {
    const decoratedChildren = Children.map(children, (child) => {
      if (isValidElement<NavLinkProps>(child)) {
        return cloneElement(child, { indented: true });
      }
      return child;
    });

    return (
      <li ref={ref} className={className}>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={listId}
          className={cn(
            'group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
            'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
          )}
        >
          <span style={{ color: 'var(--color-primary)' }} className="shrink-0">
            {icon}
          </span>
          <span className="flex-1 truncate text-left">{label}</span>
          <ChevronRight
            className={cn(
              'h-4 w-4 shrink-0 text-foreground-subtle transition-transform',
              open && 'rotate-90',
            )}
            aria-hidden="true"
          />
        </button>
        <ul id={listId} hidden={!open} className={cn('mt-0.5 space-y-0.5', !open && 'hidden')}>
          {decoratedChildren}
        </ul>
      </li>
    );
  }

  // Collapsed-icon mode: trigger renders icon-only with tooltip; click opens a flyout panel.
  const flyoutChildren = Children.map(children, (child) => {
    if (isValidElement<NavLinkProps>(child)) {
      return cloneElement(child, { forceLabel: true });
    }
    return child;
  });

  const triggerClasses = cn(
    'relative flex w-full items-center justify-center rounded-md px-2 py-2 text-sm transition-colors',
    hasActiveChild
      ? 'bg-surface-muted font-medium text-foreground'
      : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
  );

  return (
    <li ref={ref} className={className}>
      <Tooltip>
        <TooltipTrigger>
          <button
            ref={triggerRef}
            type="button"
            onClick={toggle}
            aria-haspopup="true"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={label}
            className={triggerClasses}
          >
            <span
              style={{ color: 'var(--color-primary)' }}
              className="shrink-0 [&>svg]:h-5 [&>svg]:w-5"
            >
              {icon}
            </span>
            {hasActiveChild ? (
              <span
                aria-hidden="true"
                data-testid="nav-group-active-bubble"
                className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary"
              />
            ) : null}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          {label}
        </TooltipContent>
      </Tooltip>

      {flyoutOpen ? (
        <Portal>
          <div
            ref={flyoutRef}
            // Keep in DOM before first measurement (tests can query without
            // advancing rAF); opacity hides the (0,0) flash from real users.
            style={{
              position: 'absolute',
              left: flyoutPos.x,
              top: flyoutPos.y,
              opacity: flyoutPos.ready ? 1 : 0,
            }}
            className="z-50 min-w-[12rem] rounded-md border border-border bg-surface p-1 shadow-md"
            data-print="hide"
          >
            <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-foreground-subtle">
              {label}
            </div>
            <ul id={listId} className="space-y-0.5">
              {flyoutChildren}
            </ul>
          </div>
        </Portal>
      ) : null}
    </li>
  );
}
