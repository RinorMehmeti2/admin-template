import type { HTMLAttributes, ReactNode, Ref } from 'react';

export interface CarouselSlide {
  id: string;
  content: ReactNode;
  /** Used for aria-label on the slide. Falls back to "Slide N of M". */
  label?: string;
}

export interface CarouselProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  ref?: Ref<HTMLElement>;
  slides: CarouselSlide[];
  /** Controlled current index. */
  index?: number;
  /** Uncontrolled initial index. */
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Visible slides per view. Object form for responsive breakpoints (mobile-first). Default 1. */
  slidesPerView?: number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
  /** Gap between slides in px. Default 16. */
  gap?: number;
  /** Wrap navigation at the ends. Default true. */
  loop?: boolean;
  /** Auto-advance every N ms. 0 disables. Pauses on hover/focus/touch. Default 0. */
  autoplayMs?: number;
  /** Show prev/next buttons. Default true. */
  showArrows?: boolean;
  /** Show dot indicators. Default true. */
  showDots?: boolean;
  /** Accessible label for the carousel region. Required. */
  'aria-label': string;
  /** Position arrows inside the slide area (overlay) or outside. Default 'overlay'. */
  arrowPosition?: 'overlay' | 'outside';
  /** Render the carousel borderless and transparent. Default false. */
  bare?: boolean;
}
