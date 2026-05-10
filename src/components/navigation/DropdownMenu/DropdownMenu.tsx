import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useId } from '@/hooks/useId';
import { useControllableState } from '@/hooks/useControllableState';
import { useFocusReturn } from '@/hooks/useFocusReturn';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { usePosition, type Boundary, type Placement } from '@/hooks/usePosition';
import { RovingFocusGroup, useRovingFocusItem } from '@/hooks/useRovingFocus';
import { Portal } from '@/components/overlays/Portal';
import { Kbd } from '@/components/primitives/Kbd';

/*
 * Compositional dropdown menu. Items use roving focus via cloneElement-injected
 * indices on direct children of <DropdownMenuContent>. If you wrap an item in
 * a non-Item component (e.g. a Tooltip), arrow nav skips it — wrap the
 * Item INSIDE the Tooltip's TooltipTrigger (asChild) instead.
 *
 * Sub-menus get their own roving group inside <DropdownMenuSubContent>, so
 * arrow keys inside a submenu don't bleed into the parent.
 *
 * Typeahead: while focused inside the menu, typing letters jumps to the next
 * item whose text starts with the accumulated prefix; the buffer resets after
 * 500ms of inactivity (ARIA APG menu pattern).
 */

/* -------------------------------------------------------------------------- */
/*  Root context                                                              */
/* -------------------------------------------------------------------------- */

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLElement | null>;
  contentId: string;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu(part: string): DropdownMenuContextValue {
  const ctx = useContext(DropdownMenuContext);
  if (ctx === null) throw new Error(`<${part}> must be used inside <DropdownMenu>`);
  return ctx;
}

export interface DropdownMenuProps {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  children: ReactNode;
}

export function DropdownMenu({ open, defaultOpen, onOpenChange, children }: DropdownMenuProps) {
  const [isOpen, setOpenInternal] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentId = useId('menu');
  const setOpen = useCallback((next: boolean) => setOpenInternal(next), [setOpenInternal]);

  const value = useMemo<DropdownMenuContextValue>(
    () => ({ open: isOpen ?? false, setOpen, triggerRef, contentId }),
    [isOpen, setOpen, contentId],
  );
  return <DropdownMenuContext.Provider value={value}>{children}</DropdownMenuContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/*  Trigger                                                                   */
/* -------------------------------------------------------------------------- */

interface TriggerChildProps {
  ref?: Ref<HTMLElement> | undefined;
  onClick?: ((e: ReactMouseEvent) => void) | undefined;
  onKeyDown?: ((e: ReactKeyboardEvent) => void) | undefined;
  'aria-haspopup'?: 'menu' | undefined;
  'aria-expanded'?: boolean | undefined;
  'aria-controls'?: string | undefined;
}

export interface DropdownMenuTriggerProps {
  children: ReactElement<TriggerChildProps>;
}

export function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const ctx = useDropdownMenu('DropdownMenuTrigger');
  const child = Children.only(children);
  const merged = useMergedRefs<HTMLElement>(ctx.triggerRef, child.props.ref);

  const childOnClick = child.props.onClick;
  const childOnKeyDown = child.props.onKeyDown;
  return cloneElement<TriggerChildProps>(child, {
    ref: merged,
    onClick: (e) => {
      childOnClick?.(e);
      if (!e.defaultPrevented) ctx.setOpen(!ctx.open);
    },
    onKeyDown: (e) => {
      childOnKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ctx.setOpen(true);
      }
    },
    'aria-haspopup': 'menu',
    'aria-expanded': ctx.open,
    'aria-controls': ctx.open ? ctx.contentId : undefined,
  });
}

/* -------------------------------------------------------------------------- */
/*  Item registry / typeahead context                                         */
/* -------------------------------------------------------------------------- */

interface MenuPanelContextValue {
  close: () => void;
  registerItem: (id: string, getEl: () => HTMLElement | null, getText: () => string) => () => void;
  focusItemByIndex: (i: number) => void;
  itemCount: () => number;
  handleTypeahead: (key: string) => void;
}

const MenuPanelContext = createContext<MenuPanelContextValue | null>(null);

function useMenuPanel(part: string): MenuPanelContextValue {
  const ctx = useContext(MenuPanelContext);
  if (ctx === null) throw new Error(`<${part}> must be used inside a menu content`);
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Menu panel (shared between DropdownMenuContent + ContextMenuContent)      */
/* -------------------------------------------------------------------------- */

interface MenuPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'id'> {
  ref?: Ref<HTMLDivElement> | undefined;
  open: boolean;
  onClose: () => void;
  triggerRef?: RefObject<HTMLElement | null> | undefined;
  /** Computed style — caller decides positioning. */
  positionStyle: React.CSSProperties;
  /** Element id for ARIA wiring. */
  id?: string | undefined;
  /** Resolved placement (post-flip) — exposed as data-side for styling. */
  dataSide?: Placement | undefined;
}

interface ItemEntry {
  id: string;
  getEl: () => HTMLElement | null;
  getText: () => string;
}

export function MenuPanel({
  ref,
  open,
  onClose,
  positionStyle,
  id,
  dataSide,
  className,
  children,
  ...rest
}: MenuPanelProps) {
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);

  // Item registry — items self-register on mount in DOM order.
  const itemsRef = useRef<ItemEntry[]>([]);
  const registerItem = useCallback(
    (itemId: string, getEl: () => HTMLElement | null, getText: () => string) => {
      itemsRef.current = [...itemsRef.current, { id: itemId, getEl, getText }];
      return () => {
        itemsRef.current = itemsRef.current.filter((x) => x.id !== itemId);
      };
    },
    [],
  );

  // Sort registered items by document order before navigating.
  const orderedItems = useCallback((): ItemEntry[] => {
    const list = itemsRef.current.slice();
    list.sort((a, b) => {
      const ea = a.getEl();
      const eb = b.getEl();
      if (ea === null || eb === null) return 0;
      const pos = ea.compareDocumentPosition(eb);

      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;

      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    return list;
  }, []);

  const focusItemByIndex = useCallback(
    (i: number) => {
      const items = orderedItems();
      if (items.length === 0) return;
      const safe = ((i % items.length) + items.length) % items.length;
      const target = items[safe]?.getEl();
      // `preventScroll: true` is required because this is called on menu
      // open (via the useEffect below), at which point the menu's portal is
      // still at (0,0) waiting on usePosition — a plain .focus() would
      // scroll the page to the top of the document.
      target?.focus({ preventScroll: true });
    },
    [orderedItems],
  );

  // Typeahead
  const typeahead = useRef({ query: '', timer: null as ReturnType<typeof setTimeout> | null });
  const handleTypeahead = useCallback(
    (key: string) => {
      if (typeahead.current.timer !== null) clearTimeout(typeahead.current.timer);
      typeahead.current.query += key.toLowerCase();
      typeahead.current.timer = setTimeout(() => {
        typeahead.current.query = '';
      }, 500);
      const items = orderedItems();
      const start = items.findIndex((it) => it.getEl() === document.activeElement);
      const startFrom = start >= 0 ? start + 1 : 0;
      for (let i = 0; i < items.length; i += 1) {
        const idx = (startFrom + i) % items.length;
        const text = items[idx]!.getText().toLowerCase();
        if (text.startsWith(typeahead.current.query)) {
          items[idx]!.getEl()?.focus();
          return;
        }
      }
    },
    [orderedItems],
  );

  const itemCount = useCallback(() => orderedItems().length, [orderedItems]);

  const panelCtx = useMemo<MenuPanelContextValue>(
    () => ({
      close: onClose,
      registerItem,
      focusItemByIndex,
      itemCount,
      handleTypeahead,
    }),
    [onClose, registerItem, focusItemByIndex, itemCount, handleTypeahead],
  );

  // Focus first item when the menu opens.
  useEffect(() => {
    if (!open) return;
    // Wait one frame for items to register.
    const id = window.setTimeout(() => focusItemByIndex(0), 0);
    return () => window.clearTimeout(id);
  }, [open, focusItemByIndex]);

  useFocusReturn(open);
  useEscapeKey(() => onClose(), { enabled: open });
  useClickOutside(internal, () => onClose(), { enabled: open });

  // Arrow handling at panel level (in addition to roving on items).
  const onKeyDownPanel = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      // Tabbing closes the menu (ARIA APG menu pattern)
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <MenuPanelContext.Provider value={panelCtx}>
      <Portal>
        <div
          ref={merged}
          role="menu"
          id={id}
          data-side={dataSide}
          data-print="hide"
          tabIndex={-1}
          style={positionStyle}
          onKeyDown={onKeyDownPanel}
          className={cn(
            'z-[60] min-w-[10rem] rounded-md border border-border bg-surface p-1 shadow-lg',
            'motion-safe:animate-dialog-in',
            className,
          )}
          {...rest}
        >
          <RovingFocusGroup orientation="vertical" loop>
            {children}
          </RovingFocusGroup>
        </div>
      </Portal>
    </MenuPanelContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  DropdownMenuContent — anchored to trigger                                 */
/* -------------------------------------------------------------------------- */

export interface DropdownMenuContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  ref?: Ref<HTMLDivElement>;
  side?: Placement;
  sideOffset?: number;
  flip?: boolean;
  shift?: boolean;
  padding?: number;
  boundary?: Boundary;
}

export function DropdownMenuContent({
  ref,
  side = 'bottom-start',
  sideOffset = 4,
  flip,
  shift,
  padding,
  boundary,
  className,
  children,
  ...rest
}: DropdownMenuContentProps) {
  const ctx = useDropdownMenu('DropdownMenuContent');
  const contentRef = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(contentRef, ref);
  const positionOptions: Parameters<typeof usePosition>[2] = {
    placement: side,
    offset: sideOffset,
    enabled: ctx.open,
  };
  if (flip !== undefined) positionOptions.flip = flip;
  if (shift !== undefined) positionOptions.shift = shift;
  if (padding !== undefined) positionOptions.padding = padding;
  if (boundary !== undefined) positionOptions.boundary = boundary;
  const pos = usePosition(ctx.triggerRef, contentRef, positionOptions);

  return (
    <MenuPanel
      ref={merged}
      open={ctx.open}
      onClose={() => ctx.setOpen(false)}
      id={ctx.contentId}
      positionStyle={{ position: 'absolute', left: pos.x, top: pos.y }}
      dataSide={pos.placement}
      className={className}
      {...rest}
    >
      {Children.toArray(children)
        .filter(isValidElement)
        .map((c, i) =>
          cloneElement(c as ReactElement<{ __rovingIndex?: number }>, { __rovingIndex: i }),
        )}
    </MenuPanel>
  );
}

/* -------------------------------------------------------------------------- */
/*  Items                                                                     */
/* -------------------------------------------------------------------------- */

const itemBase =
  'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none ' +
  'focus:bg-surface-muted hover:bg-surface-muted ' +
  'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50';

interface BaseItemProps {
  className?: string;
  disabled?: boolean;
  children: ReactNode;
  __rovingIndex?: number;
  onSelect?: (event: Event) => void;
  /** Keep the menu open after activation. Default: false (closes). */
  closeOnSelect?: boolean;
}

function useMenuItemKeyboard({
  ref,
  rovingIndex,
  disabled,
  onActivate,
  textGetter,
}: {
  ref: RefObject<HTMLElement | null>;
  rovingIndex: number;
  disabled: boolean;
  onActivate: (event: ReactKeyboardEvent<HTMLElement> | ReactMouseEvent<HTMLElement>) => void;
  textGetter: () => string;
}) {
  const panel = useMenuPanel('MenuItem');
  const itemId = useId('menu-item');
  const { tabIndex, onKeyDown: rovingOnKeyDown, onFocus } = useRovingFocusItem(rovingIndex, ref);

  useEffect(
    () => panel.registerItem(itemId, () => ref.current, textGetter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemId, panel.registerItem],
  );

  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    rovingOnKeyDown(e);
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate(e);
    } else if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      panel.handleTypeahead(e.key);
    }
  };

  return { tabIndex, onKeyDown, onFocus };
}

export interface DropdownMenuItemProps extends BaseItemProps {
  ref?: Ref<HTMLDivElement>;
}

export function DropdownMenuItem({
  ref,
  __rovingIndex = 0,
  disabled,
  children,
  className,
  onSelect,
  closeOnSelect = true,
}: DropdownMenuItemProps) {
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);
  const panel = useMenuPanel('DropdownMenuItem');
  const isDisabled = disabled === true;

  const activate = (e: { preventDefault: () => void; defaultPrevented: boolean }) => {
    if (isDisabled) return;
    onSelect?.(e as unknown as Event);
    if (closeOnSelect && !e.defaultPrevented) panel.close();
  };

  const { tabIndex, onKeyDown, onFocus } = useMenuItemKeyboard({
    ref: internal,
    rovingIndex: __rovingIndex,
    disabled: isDisabled,
    onActivate: activate,
    textGetter: () => internal.current?.textContent ?? '',
  });

  return (
    <div
      ref={merged}
      role="menuitem"
      tabIndex={tabIndex}
      data-disabled={isDisabled}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onClick={(e) => activate(e)}
      className={cn(itemBase, className)}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('my-1 h-px bg-border', className)}
    />
  );
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-2 py-1.5 text-xs font-semibold text-foreground-subtle', className)}>
      {children}
    </div>
  );
}

export interface DropdownMenuCheckboxItemProps extends BaseItemProps {
  ref?: Ref<HTMLDivElement>;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}

export function DropdownMenuCheckboxItem({
  ref,
  __rovingIndex = 0,
  disabled,
  children,
  className,
  checked,
  onCheckedChange,
  closeOnSelect = false,
}: DropdownMenuCheckboxItemProps) {
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);
  const panel = useMenuPanel('DropdownMenuCheckboxItem');
  const isDisabled = disabled === true;

  const activate = (e: { preventDefault: () => void; defaultPrevented: boolean }) => {
    if (isDisabled) return;
    onCheckedChange(!checked);
    if (closeOnSelect && !e.defaultPrevented) panel.close();
  };

  const { tabIndex, onKeyDown, onFocus } = useMenuItemKeyboard({
    ref: internal,
    rovingIndex: __rovingIndex,
    disabled: isDisabled,
    onActivate: activate,
    textGetter: () => internal.current?.textContent ?? '',
  });

  return (
    <div
      ref={merged}
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={tabIndex}
      data-disabled={isDisabled}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onClick={(e) => activate(e)}
      className={cn(itemBase, 'pl-7', className)}
    >
      <span
        className="absolute left-2 inline-flex h-3.5 w-3.5 items-center justify-center"
        aria-hidden="true"
      >
        {checked ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
      {children}
    </div>
  );
}

/* DropdownMenuRadioGroup + RadioItem */
interface RadioGroupCtx {
  value: string | undefined;
  onValueChange: (next: string) => void;
}
const DropdownRadioGroupContext = createContext<RadioGroupCtx | null>(null);

export interface DropdownMenuRadioGroupProps {
  value: string;
  onValueChange: (next: string) => void;
  children: ReactNode;
}

export function DropdownMenuRadioGroup({
  value,
  onValueChange,
  children,
}: DropdownMenuRadioGroupProps) {
  return (
    <DropdownRadioGroupContext.Provider value={{ value, onValueChange }}>
      {children}
    </DropdownRadioGroupContext.Provider>
  );
}

export interface DropdownMenuRadioItemProps extends BaseItemProps {
  ref?: Ref<HTMLDivElement>;
  value: string;
}

export function DropdownMenuRadioItem({
  ref,
  __rovingIndex = 0,
  disabled,
  children,
  className,
  value,
  closeOnSelect = false,
}: DropdownMenuRadioItemProps) {
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);
  const group = useContext(DropdownRadioGroupContext);
  if (group === null)
    throw new Error('DropdownMenuRadioItem must be inside DropdownMenuRadioGroup');
  const panel = useMenuPanel('DropdownMenuRadioItem');
  const isDisabled = disabled === true;
  const checked = group.value === value;

  const activate = (e: { preventDefault: () => void; defaultPrevented: boolean }) => {
    if (isDisabled) return;
    group.onValueChange(value);
    if (closeOnSelect && !e.defaultPrevented) panel.close();
  };

  const { tabIndex, onKeyDown, onFocus } = useMenuItemKeyboard({
    ref: internal,
    rovingIndex: __rovingIndex,
    disabled: isDisabled,
    onActivate: activate,
    textGetter: () => internal.current?.textContent ?? '',
  });

  return (
    <div
      ref={merged}
      role="menuitemradio"
      aria-checked={checked}
      tabIndex={tabIndex}
      data-disabled={isDisabled}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onClick={(e) => activate(e)}
      className={cn(itemBase, 'pl-7', className)}
    >
      <span
        className="absolute left-2 inline-flex h-3.5 w-3.5 items-center justify-center"
        aria-hidden="true"
      >
        {checked ? <Circle className="h-2 w-2 fill-current" /> : null}
      </span>
      {children}
    </div>
  );
}

export function DropdownMenuShortcut({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('ml-auto pl-3', className)}>
      <Kbd>{children}</Kbd>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Submenu (one level)                                                        */
/* -------------------------------------------------------------------------- */

interface SubmenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLElement | null>;
  contentId: string;
}
const DropdownMenuSubContext = createContext<SubmenuContextValue | null>(null);

export interface DropdownMenuSubProps {
  children: ReactNode;
}
export function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentId = useId('submenu');
  const value = useMemo<SubmenuContextValue>(
    () => ({ open, setOpen, triggerRef, contentId }),
    [open, contentId],
  );
  return (
    <DropdownMenuSubContext.Provider value={value}>{children}</DropdownMenuSubContext.Provider>
  );
}

function useSubContext(part: string): SubmenuContextValue {
  const ctx = useContext(DropdownMenuSubContext);
  if (ctx === null) throw new Error(`<${part}> must be used inside <DropdownMenuSub>`);
  return ctx;
}

export interface DropdownMenuSubTriggerProps extends BaseItemProps {
  ref?: Ref<HTMLDivElement>;
}

export function DropdownMenuSubTrigger({
  ref,
  __rovingIndex = 0,
  disabled,
  children,
  className,
}: DropdownMenuSubTriggerProps) {
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);
  const sub = useSubContext('DropdownMenuSubTrigger');
  // Attach trigger to sub's triggerRef so usePosition can anchor.
  // The sub.triggerRef is a mutable RefObject by design.
  /* eslint-disable react-hooks/immutability */
  useEffect(() => {
    sub.triggerRef.current = internal.current;
  });
  /* eslint-enable react-hooks/immutability */
  const isDisabled = disabled === true;

  const activate = () => {
    if (!isDisabled) sub.setOpen(true);
  };
  const { tabIndex, onKeyDown, onFocus } = useMenuItemKeyboard({
    ref: internal,
    rovingIndex: __rovingIndex,
    disabled: isDisabled,
    onActivate: activate,
    textGetter: () => internal.current?.textContent ?? '',
  });

  // ArrowRight opens, ArrowLeft closes
  const onKeyDownExtended = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      sub.setOpen(true);
      return;
    }
    onKeyDown(e);
  };

  return (
    <div
      ref={merged}
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={sub.open}
      aria-controls={sub.open ? sub.contentId : undefined}
      tabIndex={tabIndex}
      data-disabled={isDisabled}
      onKeyDown={onKeyDownExtended}
      onFocus={onFocus}
      onClick={() => activate()}
      onMouseEnter={() => !isDisabled && sub.setOpen(true)}
      className={cn(itemBase, className)}
    >
      <span className="flex-1">{children}</span>
      <ChevronRight className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
    </div>
  );
}

export function DropdownMenuSubContent({
  ref,
  className,
  children,
  side = 'right',
  sideOffset = 4,
  flip,
  shift,
  padding,
  boundary,
  ...rest
}: DropdownMenuContentProps) {
  const sub = useSubContext('DropdownMenuSubContent');
  const contentRef = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(contentRef, ref);
  const positionOptions: Parameters<typeof usePosition>[2] = {
    placement: side,
    offset: sideOffset,
    enabled: sub.open,
  };
  if (flip !== undefined) positionOptions.flip = flip;
  if (shift !== undefined) positionOptions.shift = shift;
  if (padding !== undefined) positionOptions.padding = padding;
  if (boundary !== undefined) positionOptions.boundary = boundary;
  const pos = usePosition(sub.triggerRef, contentRef, positionOptions);

  return (
    <MenuPanel
      ref={merged}
      open={sub.open}
      onClose={() => sub.setOpen(false)}
      id={sub.contentId}
      positionStyle={{ position: 'absolute', left: pos.x, top: pos.y }}
      dataSide={pos.placement}
      className={className}
      {...rest}
    >
      {Children.toArray(children)
        .filter(isValidElement)
        .map((c, i) =>
          cloneElement(c as ReactElement<{ __rovingIndex?: number }>, { __rovingIndex: i }),
        )}
    </MenuPanel>
  );
}
