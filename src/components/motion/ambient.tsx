import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '@/lib/cn';
import { useMergedRefs } from '@/hooks/useMergedRefs';

/*
 * Continuous (looping) ambient effects. Reduced motion: the global CSS rule
 * in globals.css clamps animation-duration to 0.01ms with `!important` for
 * non-functional animations, so all of these auto-disable. Pass `force` to
 * bypass that clamp on showcase/demo surfaces — applied via setProperty(...,
 * 'important') since inline React `style` can't carry !important.
 */

interface ForceSpec {
  name: string;
  duration: string;
  timing: string;
  iteration?: string;
  delay?: string;
}

function useForcedAnimation<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  active: boolean,
  spec: ForceSpec,
): void {
  useLayoutEffect(() => {
    const node = ref.current;
    if (node === null) return;
    if (!active) {
      node.style.removeProperty('animation-name');
      node.style.removeProperty('animation-duration');
      node.style.removeProperty('animation-timing-function');
      node.style.removeProperty('animation-iteration-count');
      node.style.removeProperty('animation-delay');
      return;
    }
    node.style.setProperty('animation-name', spec.name, 'important');
    node.style.setProperty('animation-duration', spec.duration, 'important');
    node.style.setProperty('animation-timing-function', spec.timing, 'important');
    node.style.setProperty('animation-iteration-count', spec.iteration ?? 'infinite', 'important');
    if (spec.delay !== undefined) {
      node.style.setProperty('animation-delay', spec.delay, 'important');
    }
  }, [ref, active, spec.name, spec.duration, spec.timing, spec.iteration, spec.delay]);
}

export interface AmbientProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Force animation regardless of `prefers-reduced-motion`. */
  force?: boolean;
  children: ReactNode;
}

export function Float({ ref, force = false, className, children, ...rest }: AmbientProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const setRef = useMergedRefs<HTMLDivElement>(innerRef, ref);
  useForcedAnimation(innerRef, force, {
    name: 'float',
    duration: '3s',
    timing: 'ease-in-out',
  });
  return (
    <div ref={setRef} className={cn('animate-float', className)} {...rest}>
      {children}
    </div>
  );
}

export function Wiggle({ ref, force = false, className, children, ...rest }: AmbientProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const setRef = useMergedRefs<HTMLDivElement>(innerRef, ref);
  useForcedAnimation(innerRef, force, {
    name: 'wiggle',
    duration: '0.6s',
    timing: 'ease-in-out',
  });
  return (
    <div ref={setRef} className={cn('animate-wiggle', className)} {...rest}>
      {children}
    </div>
  );
}

export interface PulseRingProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  /** Force animation regardless of `prefers-reduced-motion`. */
  force?: boolean;
}

export function PulseRing({
  ref,
  color = 'primary',
  size = 'md',
  force = false,
  className,
  ...rest
}: PulseRingProps) {
  const ringRef = useRef<HTMLSpanElement | null>(null);
  useForcedAnimation(ringRef, force, {
    name: 'pulse-ring',
    duration: '1.6s',
    timing: 'cubic-bezier(0, 0, 0.2, 1)',
  });
  const dim = size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3';
  const tone =
    color === 'success'
      ? 'bg-success'
      : color === 'warning'
        ? 'bg-warning'
        : color === 'danger'
          ? 'bg-danger'
          : color === 'info'
            ? 'bg-info'
            : 'bg-primary';
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      {...rest}
    >
      <span
        ref={ringRef}
        className={cn('absolute inline-flex rounded-full opacity-60 animate-pulse-ring', dim, tone)}
      />
      <span className={cn('relative inline-flex rounded-full', dim, tone)} />
    </span>
  );
}

export interface ShimmerProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Force animation regardless of `prefers-reduced-motion`. */
  force?: boolean;
  children?: ReactNode;
}

export function Shimmer({ ref, force = false, className, children, style, ...rest }: ShimmerProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const setRef = useMergedRefs<HTMLDivElement>(innerRef, ref);
  useForcedAnimation(innerRef, force, {
    name: 'shimmer',
    duration: '1.5s',
    timing: 'linear',
  });
  const shimmerStyle: CSSProperties = {
    backgroundImage:
      'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-foreground) 8%, transparent) 50%, transparent 100%)',
    backgroundSize: '200% 100%',
    ...style,
  };
  return (
    <div
      ref={setRef}
      style={shimmerStyle}
      className={cn(
        'relative overflow-hidden rounded-md bg-surface-muted animate-shimmer',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface TypingDotsProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  color?: 'muted' | 'primary' | 'foreground';
  /** Force animation regardless of `prefers-reduced-motion`. */
  force?: boolean;
}

function TypingDot({
  delay,
  force,
  className,
}: {
  delay: number;
  force: boolean;
  className: string;
}) {
  const dotRef = useRef<HTMLSpanElement | null>(null);
  useForcedAnimation(dotRef, force, {
    name: 'typing-dot',
    duration: '1.2s',
    timing: 'ease-in-out',
    delay: `${delay}ms`,
  });
  return (
    <span
      ref={dotRef}
      className={cn('h-1.5 w-1.5 rounded-full animate-typing-dot', className)}
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

export function TypingDots({
  ref,
  color = 'muted',
  force = false,
  className,
  ...rest
}: TypingDotsProps) {
  const tone =
    color === 'primary'
      ? 'bg-primary'
      : color === 'foreground'
        ? 'bg-foreground'
        : 'bg-foreground-muted';
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn('inline-flex items-center gap-1', className)}
      {...rest}
    >
      {[0, 1, 2].map((i) => (
        <TypingDot key={i} delay={i * 160} force={force} className={tone} />
      ))}
    </span>
  );
}

export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Speed multiplier. 1 = default 18s loop. Default 1. */
  speed?: number;
  /** Pause on hover. Default true. */
  pauseOnHover?: boolean;
  /** Force animation regardless of `prefers-reduced-motion`. */
  force?: boolean;
  children: ReactNode;
}

export function Marquee({
  ref,
  speed = 1,
  pauseOnHover = true,
  force = false,
  className,
  children,
  style,
  ...rest
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dur = 18 / Math.max(0.1, speed);
  useForcedAnimation(trackRef, force, {
    name: 'marquee',
    duration: `${dur}s`,
    timing: 'linear',
  });
  return (
    <div ref={ref} className={cn('group overflow-hidden', className)} style={style} {...rest}>
      <div
        ref={trackRef}
        className={cn(
          'flex w-max gap-8 animate-marquee',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{ animationDuration: `${dur}s` }}
      >
        <div className="flex shrink-0 items-center gap-8">{children}</div>
        <div aria-hidden="true" className="flex shrink-0 items-center gap-8">
          {children}
        </div>
      </div>
    </div>
  );
}
