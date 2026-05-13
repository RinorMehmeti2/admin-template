import {
  Children,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '@/lib/cn';
import { Motion } from './Motion';
import type { MotionPreset } from './Motion.types';

export interface StaggerProps {
  ref?: Ref<HTMLDivElement>;
  /** Animation preset for each child. Default 'slide-in-up'. */
  animation?: MotionPreset;
  /** ms between each child's start. Default 60. */
  stagger?: number;
  /** Initial delay before the first child. Default 0. */
  delay?: number;
  /** Per-child duration. Default 220. */
  duration?: number;
  /** Trigger when scrolled into view. Default true. */
  whenInView?: boolean;
  rootMargin?: string;
  once?: boolean;
  /** Force animation regardless of reduced-motion. Passes through to Motion. */
  force?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/*
 * Stagger — applies an incremental animation delay to each direct child.
 *
 *   <Stagger animation="slide-in-up">
 *     <Card />
 *     <Card />
 *     <Card />
 *   </Stagger>
 *
 * Wraps each child in <Motion>. To keep your own JSX wrapper, pass `<Motion>`
 * children directly and let them inherit the timing — Stagger only wraps
 * children that are NOT already <Motion>.
 */
export function Stagger({
  ref,
  animation = 'slide-in-up',
  stagger = 60,
  delay = 0,
  duration = 220,
  whenInView = true,
  rootMargin = '0px 0px -10% 0px',
  once = true,
  force = false,
  className,
  style,
  children,
}: StaggerProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement[];
  return (
    <div ref={ref} className={cn(className)} style={style}>
      {items.map((child, i) => (
        <Motion
          key={child.key ?? i}
          animation={animation}
          duration={duration}
          delay={delay + i * stagger}
          whenInView={whenInView}
          rootMargin={rootMargin}
          once={once}
          force={force}
        >
          {child}
        </Motion>
      ))}
    </div>
  );
}
