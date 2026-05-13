import type { ElementType, ReactNode, Ref, CSSProperties } from 'react';

export type MotionPreset =
  | 'fade-in'
  | 'fade-out'
  | 'slide-in-up'
  | 'slide-in-down'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'scale-in'
  | 'scale-out'
  | 'bounce-in'
  | 'pop'
  | 'rotate-in'
  | 'flip-in'
  | 'blur-in';

export interface MotionBaseProps {
  /** Animation preset name. */
  animation?: MotionPreset;
  /** Duration in ms. Default uses CSS token --duration-normal. */
  duration?: number;
  /** Delay in ms before animation starts. Default 0. */
  delay?: number;
  /** Easing override. Default depends on preset. */
  easing?: string;
  /** Trigger animation only when scrolled into view. Default false. */
  whenInView?: boolean;
  /** rootMargin for the IntersectionObserver. Default '0px'. */
  rootMargin?: string;
  /** Animate once or every time element enters view. Default true. */
  once?: boolean;
  /** Disable animation entirely (renders children unchanged). */
  disabled?: boolean;
  /**
   * Force animation to run regardless of `prefers-reduced-motion`. Off by
   * default (respects user setting). Use for demo / showcase pages where the
   * animation itself is the content.
   */
  force?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}

export type MotionProps = MotionBaseProps;
