import type { ReactNode, Ref, HTMLAttributes } from 'react';

export interface RepeaterRenderArgs<T> {
  item: T;
  index: number;
  /** Remove the row at this index. */
  remove: () => void;
  /** Move row by delta (negative = up, positive = down). Clamped. */
  move: (delta: number) => void;
  /** Update the row in place. Pass partial patch or full value. */
  update: (patch: Partial<T> | T) => void;
  /** True if this is the only remaining row. */
  isOnly: boolean;
  /** True if this is the first row. */
  isFirst: boolean;
  /** True if this is the last row. */
  isLast: boolean;
}

export interface RepeaterProps<T> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'children'
> {
  ref?: Ref<HTMLDivElement>;
  /** Controlled items. */
  items?: T[];
  /** Uncontrolled initial items. */
  defaultItems?: T[];
  onChange?: (items: T[]) => void;
  /** Factory for a new blank row. Called by add button + min-row backfill. */
  createItem: () => T;
  /** Stable key per row. Strongly recommended — falls back to index. */
  keyFor?: (item: T, index: number) => string;
  renderItem: (args: RepeaterRenderArgs<T>) => ReactNode;
  /** Optional label above the list. */
  label?: ReactNode;
  /** Helper text below the label. */
  description?: ReactNode;
  /** Error message rendered below the list. */
  error?: ReactNode;
  /** Min rows the user can have. Default 0. Removing below min is blocked. */
  min?: number;
  /** Max rows. Default Infinity. Add button disabled at max. */
  max?: number;
  /** Add button label. Default "Add row". */
  addLabel?: ReactNode;
  /** Render order/move buttons next to each row. Default true. */
  reorderable?: boolean;
  /** Render remove button on each row. Default true. */
  removable?: boolean;
  /** Render add button below list. Default true. */
  addable?: boolean;
  /** Empty-state node shown when no rows. */
  emptyState?: ReactNode;
  /** Visual variant. */
  variant?: 'separated' | 'stacked';
}
