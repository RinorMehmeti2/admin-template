import {
  createContext,
  useContext,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useId } from '@/hooks/useId';
import { Badge } from '@/components/primitives/Badge';

/*
 * Sidebar menu. Composition:
 *   <Menu>
 *     <MenuItem to="..." icon={...}>Label</MenuItem>
 *     <MenuGroup label="..." icon={...}>
 *       <MenuItem ... />
 *       <MenuItem ... />
 *     </MenuGroup>
 *   </Menu>
 *
 * Keyboard nav: native Tab order across visible items + group triggers.
 * Reason for not using useRovingFocus across the whole menu: items can be
 * NavLinks (no `tabIndex` prop control needed for a roving pattern), nesting
 * + dynamic show/hide make a single roving index registry messy. Native
 * Tab/Shift+Tab works correctly because every item is naturally focusable
 * (link or button), and assistive tech announces them in order.
 *
 * Group expand/collapse: click OR Enter/Space (native button behavior).
 *
 * `iconOnly` (used when sidebar is collapsed) hides labels + collapses
 * groups; nested items become inaccessible via the menu in that mode (a
 * popover-on-hover pattern is a follow-up).
 */

interface MenuContextValue {
  iconOnly: boolean;
}

const MenuContext = createContext<MenuContextValue>({ iconOnly: false });

export interface MenuProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  iconOnly?: boolean;
  ariaLabel?: string;
}

export function Menu({
  ref,
  iconOnly = false,
  ariaLabel = 'Sidebar',
  className,
  children,
  ...rest
}: MenuProps) {
  return (
    <MenuContext.Provider value={{ iconOnly }}>
      <nav ref={ref} aria-label={ariaLabel} className={cn('flex flex-col', className)} {...rest}>
        <ul className="flex flex-col gap-0.5">{children}</ul>
      </nav>
    </MenuContext.Provider>
  );
}

const itemBase =
  'flex items-center gap-2.5 rounded-md text-sm font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const itemPad = 'h-9 px-3';
const itemPadIconOnly = 'h-9 w-9 justify-center px-0';

export interface MenuItemProps {
  to: string;
  icon?: ReactNode;
  badge?: ReactNode;
  end?: boolean;
  children: ReactNode;
  className?: string;
}

export function MenuItem({ to, icon, badge, end, children, className }: MenuItemProps) {
  const { iconOnly } = useContext(MenuContext);
  return (
    <li>
      <NavLink
        to={to}
        {...(end === true ? { end: true } : {})}
        className={({ isActive }) =>
          cn(
            itemBase,
            iconOnly ? itemPadIconOnly : itemPad,
            isActive
              ? 'bg-surface-muted text-foreground'
              : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
            className,
          )
        }
        title={iconOnly ? String(children) : undefined}
      >
        {icon !== undefined ? (
          <span className="shrink-0 text-foreground-subtle [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {!iconOnly ? (
          <>
            <span className="min-w-0 flex-1 truncate">{children}</span>
            {badge !== undefined ? <span className="ml-auto">{badge}</span> : null}
          </>
        ) : null}
      </NavLink>
    </li>
  );
}

export interface MenuGroupProps {
  label: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function MenuGroup({ label, icon, defaultOpen = true, children, className }: MenuGroupProps) {
  const { iconOnly } = useContext(MenuContext);
  const { isOpen, toggle } = useDisclosure(defaultOpen);
  const contentId = useId('menu-group');

  // In icon-only mode the group degrades to its label being hidden + children
  // suppressed (children can still be reached via the keyboard since they're
  // not unmounted, but they're visually hidden). For v1 we just hide them.
  if (iconOnly) {
    return (
      <li className={cn('py-1', className)}>
        <span
          className={cn(itemBase, itemPadIconOnly, 'text-foreground-subtle')}
          title={typeof label === 'string' ? label : undefined}
        >
          {icon !== undefined ? (
            <span className="[&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
              {icon}
            </span>
          ) : null}
        </span>
      </li>
    );
  }

  return (
    <li className={className}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={cn(
          itemBase,
          itemPad,
          'w-full text-foreground-muted hover:bg-surface-muted hover:text-foreground',
        )}
      >
        {icon !== undefined ? (
          <span className="shrink-0 text-foreground-subtle [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : 'rotate-0')}
        />
      </button>
      <ul
        id={contentId}
        hidden={!isOpen}
        className="mt-0.5 ml-3 flex flex-col gap-0.5 border-l border-border pl-3"
      >
        {children}
      </ul>
    </li>
  );
}

/** Convenience: wrap a number in a small Badge for trailing slot. */
export function MenuBadge({ children }: { children: ReactNode }) {
  return <Badge variant="neutral" size="sm">{children}</Badge>;
}
