import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '@/lib/cn';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { usePositionAtPoint } from '@/hooks/usePosition';
import { MenuPanel } from '@/components/navigation/DropdownMenu';

/*
 * ContextMenu reuses DropdownMenu's MenuPanel + item types. Difference: it
 * opens on `contextmenu` event, anchored at cursor coordinates instead of
 * to a trigger element. All items, separators, labels, checkbox/radio,
 * and shortcuts are imported from DropdownMenu.
 */

interface ContextMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  position: { x: number; y: number };
  setPosition: (p: { x: number; y: number }) => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenu(part: string): ContextMenuContextValue {
  const ctx = useContext(ContextMenuContext);
  if (ctx === null) throw new Error(`<${part}> must be used inside <ContextMenu>`);
  return ctx;
}

export interface ContextMenuProps {
  children: ReactNode;
}

export function ContextMenu({ children }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const value = useMemo<ContextMenuContextValue>(
    () => ({ open, setOpen, position, setPosition }),
    [open, position],
  );
  return <ContextMenuContext.Provider value={value}>{children}</ContextMenuContext.Provider>;
}

export interface ContextMenuTriggerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onContextMenu'
> {
  ref?: Ref<HTMLDivElement>;
  disabled?: boolean;
}

export function ContextMenuTrigger({
  ref,
  className,
  children,
  disabled,
  ...rest
}: ContextMenuTriggerProps) {
  const ctx = useContextMenu('ContextMenuTrigger');
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (disabled === true) return;
      e.preventDefault();
      ctx.setPosition({
        x: e.clientX + window.scrollX,
        y: e.clientY + window.scrollY,
      });
      ctx.setOpen(true);
    },
    [ctx, disabled],
  );

  return (
    <div ref={merged} onContextMenu={handleContextMenu} className={cn(className)} {...rest}>
      {children}
    </div>
  );
}

export interface ContextMenuContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  ref?: Ref<HTMLDivElement>;
}

export function ContextMenuContent({ ref, className, children, ...rest }: ContextMenuContentProps) {
  const ctx = useContextMenu('ContextMenuContent');
  const internal = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs<HTMLDivElement>(internal, ref);
  const pos = usePositionAtPoint(internal, {
    point: ctx.position,
    enabled: ctx.open,
    placement: 'bottom-start',
    offset: 0,
  });

  return (
    <MenuPanel
      ref={merged}
      open={ctx.open}
      onClose={() => ctx.setOpen(false)}
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

// Re-export item primitives so consumers have a single import site.
export {
  DropdownMenuCheckboxItem as ContextMenuCheckboxItem,
  DropdownMenuItem as ContextMenuItem,
  DropdownMenuLabel as ContextMenuLabel,
  DropdownMenuRadioGroup as ContextMenuRadioGroup,
  DropdownMenuRadioItem as ContextMenuRadioItem,
  DropdownMenuSeparator as ContextMenuSeparator,
  DropdownMenuShortcut as ContextMenuShortcut,
  DropdownMenuSub as ContextMenuSub,
  DropdownMenuSubContent as ContextMenuSubContent,
  DropdownMenuSubTrigger as ContextMenuSubTrigger,
} from '@/components/navigation/DropdownMenu';
