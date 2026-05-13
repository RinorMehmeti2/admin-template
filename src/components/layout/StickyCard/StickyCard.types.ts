import type { HTMLAttributes, ReactNode, Ref } from 'react';

export type StickySide = 'top' | 'bottom';
export type StickyCardVariant = 'default' | 'outlined' | 'elevated';

export interface StickyCardProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Side to stick to in the nearest scroll container. Default 'top'. */
  side?: StickySide;
  /** Offset in px from the side. Default 0. Use to clear topbars. */
  offset?: number;
  variant?: StickyCardVariant;
  /** Compress padding/typography when stuck. Default false. */
  compactWhenStuck?: boolean;
  /** Apply elevated shadow + opaque bg when stuck. Default true. */
  shadowWhenStuck?: boolean;
  children: ReactNode;
}

export interface StickyStackProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Distance each card slips behind the next, in px. Default 12. */
  gap?: number;
  /** Top offset for the stack origin, in px. Default 0. */
  offset?: number;
  /** Vertical spacing between cards in flow. Default 24. */
  flowGap?: number;
  children: ReactNode;
}
