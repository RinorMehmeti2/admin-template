import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import type { StickyCardProps, StickyStackProps } from './StickyCard.types';

const cardStyles = cva(
  'rounded-lg transition-[box-shadow,padding,background-color] duration-200 will-change-transform',
  {
    variants: {
      variant: {
        default: 'bg-surface',
        outlined: 'border border-border bg-surface',
        elevated: 'bg-surface-elevated shadow-sm',
      },
      stuck: {
        true: '',
        false: '',
      },
      stuckShadow: {
        true: '',
        false: '',
      },
      stuckCompact: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { stuck: true, stuckShadow: true, class: 'shadow-lg bg-surface-elevated' },
      { stuck: true, stuckCompact: true, class: 'py-2' },
    ],
    defaultVariants: { variant: 'outlined', stuck: false, stuckShadow: true, stuckCompact: false },
  },
);

/*
 * StickyCard uses CSS `position: sticky` and detects "stuck" via IntersectionObserver
 * against a sentinel positioned 1px above (or below) the card's stick edge.
 * Once stuck, an opt-in shadow + compact mode kick in. Skip detection on
 * `data-print` so print layout collapses to static (handled by print.css).
 */

export function StickyCard({
  ref,
  side = 'top',
  offset = 0,
  variant,
  compactWhenStuck = false,
  shadowWhenStuck = true,
  className,
  children,
  style,
  ...rest
}: StickyCardProps & VariantProps<typeof cardStyles>) {
  const innerRef = useRef<HTMLDivElement>(null);
  const setRef = useMergedRefs<HTMLDivElement>(innerRef, ref);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const node = innerRef.current;
    if (node === null) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.position = 'absolute';
    sentinel.style.left = '0';
    sentinel.style.right = '0';
    sentinel.style.height = '1px';
    sentinel.style.pointerEvents = 'none';
    if (side === 'top') {
      sentinel.style.top = '0';
    } else {
      sentinel.style.bottom = '0';
    }
    // Anchor sentinel to the card so it scrolls with it. Wrapper must be relative.
    const parent = node.parentElement;
    if (parent === null) return;
    const prevPosition = parent.style.position;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }
    parent.insertBefore(sentinel, node);

    const rootMargin =
      side === 'top' ? `-${offset + 1}px 0px 0px 0px` : `0px 0px -${offset + 1}px 0px`;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry === undefined) return;
        setStuck(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin },
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
      if (prevPosition === '') parent.style.position = '';
    };
  }, [side, offset]);

  const stickyStyle: CSSProperties = {
    position: 'sticky',
    [side]: `${offset}px`,
    zIndex: 10,
    ...style,
  };

  return (
    <div
      ref={setRef}
      data-stuck={stuck ? '' : undefined}
      data-print="hide"
      style={stickyStyle}
      className={cn(
        cardStyles({
          variant,
          stuck,
          stuckShadow: shadowWhenStuck,
          stuckCompact: compactWhenStuck,
        }),
        'p-4',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/*
 * StickyStack — multiple cards that pile on top of each other as you scroll.
 * Each child gets `position: sticky` + an increasing top offset, so when card
 * N+1 reaches the top, card N stays pinned just above it.
 */

export function StickyStack({
  ref,
  gap = 12,
  offset = 0,
  flowGap = 24,
  className,
  children,
  ...rest
}: StickyStackProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<{
    style?: CSSProperties;
    className?: string;
  }>[];

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      style={{ display: 'flex', flexDirection: 'column', gap: `${flowGap}px` }}
      {...rest}
    >
      {items.map((child, i) =>
        cloneElement(child, {
          key: child.key ?? i,
          style: {
            position: 'sticky',
            top: `${offset + i * gap}px`,
            zIndex: 10 + i,
            ...(child.props.style ?? {}),
          },
          className: cn(child.props.className),
        }),
      )}
    </div>
  );
}
