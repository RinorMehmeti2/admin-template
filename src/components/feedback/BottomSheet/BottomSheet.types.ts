import type { HTMLAttributes, ReactNode, Ref } from 'react';

export interface BottomSheetProps {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;

  /** Snap points as viewport-height percentages. Default [50, 90]. */
  snapPoints?: ReadonlyArray<number>;
  /** Controlled active snap (must be in snapPoints). */
  snap?: number | undefined;
  defaultSnap?: number | undefined;
  onSnapChange?: ((next: number) => void) | undefined;

  children: ReactNode;
}

export interface BottomSheetContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  ref?: Ref<HTMLDivElement>;
  /** Render the grab handle at the top. Default true. */
  showHandle?: boolean;
  /** Allow swipe-down to dismiss past the lowest snap point. Default true. */
  swipeToDismiss?: boolean;
  /** Pixels past the lowest snap that triggers dismiss. Default 60. */
  dismissThreshold?: number;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}
