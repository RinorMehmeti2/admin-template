import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { cn } from '@/lib/cn';
import { useControllableState } from '@/hooks/useControllableState';
import { useId } from '@/hooks/useId';
import { useSwipe } from '@/hooks/useSwipe';
import { IconButton } from '@/components/primitives/IconButton';
import type { CarouselProps } from './Carousel.types';

interface ResponsivePerView {
  base: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

function resolvePerView(spv: CarouselProps['slidesPerView']): ResponsivePerView {
  if (typeof spv === 'number') return { base: spv, sm: spv, md: spv, lg: spv, xl: spv };
  if (spv === undefined) return { base: 1, sm: 1, md: 1, lg: 1, xl: 1 };
  const base = spv.base ?? 1;
  const sm = spv.sm ?? base;
  const md = spv.md ?? sm;
  const lg = spv.lg ?? md;
  const xl = spv.xl ?? lg;
  return { base, sm, md, lg, xl };
}

const BREAKPOINTS: Array<[keyof ResponsivePerView, number]> = [
  ['base', 0],
  ['sm', 640],
  ['md', 768],
  ['lg', 1024],
  ['xl', 1280],
];

function useResolvedPerView(per: ResponsivePerView): number {
  const [width, setWidth] = useState<number>(() =>
    typeof window === 'undefined' ? 0 : window.innerWidth,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  let active: keyof ResponsivePerView = 'base';
  for (const [key, min] of BREAKPOINTS) {
    if (width >= min) active = key;
  }
  return per[active];
}

export function Carousel({
  ref,
  slides,
  index,
  defaultIndex = 0,
  onIndexChange,
  slidesPerView,
  gap = 16,
  loop = true,
  autoplayMs = 0,
  showArrows = true,
  showDots = true,
  arrowPosition = 'overlay',
  bare = false,
  className,
  'aria-label': ariaLabel,
  ...rest
}: CarouselProps) {
  const count = slides.length;
  const per = useResolvedPerView(resolvePerView(slidesPerView));
  const maxIndex = Math.max(0, count - per);

  const [current, setCurrent] = useControllableState<number>({
    value: index,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  });
  const value = current ?? 0;
  const baseId = useId('carousel');

  const clamp = useCallback(
    (next: number) => {
      if (count === 0) return 0;
      if (loop) {
        if (next < 0) return maxIndex;
        if (next > maxIndex) return 0;
        return next;
      }
      return Math.min(Math.max(0, next), maxIndex);
    },
    [count, loop, maxIndex],
  );

  const goTo = useCallback((next: number) => setCurrent(clamp(next)), [clamp, setCurrent]);
  const next = useCallback(() => goTo(value + 1), [goTo, value]);
  const prev = useCallback(() => goTo(value - 1), [goTo, value]);

  // Autoplay — pauses on hover, focus, swipe.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (autoplayMs <= 0 || paused || count <= per) return;
    const id = window.setInterval(() => {
      setCurrent((cur) => {
        const cv = cur ?? 0;
        return loop ? (cv + 1 > maxIndex ? 0 : cv + 1) : Math.min(cv + 1, maxIndex);
      });
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayMs, paused, count, per, loop, maxIndex, setCurrent]);

  // Swipe.
  const [dragDx, setDragDx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const swipe = useSwipe({
    axis: 'x',
    onSwipeStart: () => setPaused(true),
    onSwipeMove: ({ dx }) => setDragDx(dx),
    onSwipe: (direction) => {
      if (direction === 'left') next();
      else if (direction === 'right') prev();
    },
    onSwipeEnd: () => {
      setDragDx(0);
      setPaused(false);
    },
  });

  // Keyboard.
  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prev();
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(maxIndex);
          break;
        default:
      }
    },
    [next, prev, goTo, maxIndex],
  );

  // Track width — measured via ResizeObserver so we don't read the ref
  // during render. First paint uses 0; the observer fires synchronously on
  // observe() in modern Chromium so the second paint has the real width.
  const [trackWidth, setTrackWidth] = useState(0);
  useEffect(() => {
    const node = trackRef.current;
    if (node === null) return;
    setTrackWidth(node.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry === undefined) return;
      setTrackWidth(entry.contentRect.width);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const slideWidth = per > 0 ? (trackWidth - gap * (per - 1)) / per : trackWidth;
  const offset = value * (slideWidth + gap) - dragDx;

  const trackStyle: CSSProperties = useMemo(
    () => ({
      transform: `translate3d(${-offset}px, 0, 0)`,
      transition: swipe.isSwiping ? 'none' : 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
      gap: `${gap}px`,
    }),
    [offset, swipe.isSwiping, gap],
  );

  const slideStyle = useMemo<CSSProperties>(
    () => ({
      flex: `0 0 calc((100% - ${gap * (per - 1)}px) / ${per})`,
      minWidth: 0,
    }),
    [gap, per],
  );

  // Dots — one per page (groups of `per`).
  const pageCount = Math.max(1, maxIndex + 1);
  const dotPages = Array.from({ length: pageCount }, (_, i) => i);

  return (
    <section
      ref={ref}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className={cn(
        'relative w-full',
        !bare && 'rounded-lg border border-border bg-surface',
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          !bare && 'rounded-lg',
          arrowPosition === 'outside' && showArrows && 'mx-12 sm:mx-14',
        )}
      >
        {/*
          ARIA carousel pattern: the slides viewport receives keyboard focus
          + arrow/Home/End nav (per APG https://www.w3.org/WAI/ARIA/apg/patterns/carousel).
          jsx-a11y flags role="group" + tabIndex + onKeyDown as "non-interactive
          with mouse/keyboard listeners" — it's correct here, the role is the
          ARIA-specified one for a carousel slides region.
        */}
        {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <div
          role="group"
          aria-roledescription="slides container"
          aria-live={autoplayMs > 0 ? 'off' : 'polite'}
          aria-label={`${ariaLabel} slides`}
          tabIndex={0}
          data-carousel-viewport=""
          onKeyDown={onKeyDown}
          onPointerDown={swipe.onPointerDown}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
        >
          {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
          <div ref={trackRef} className="flex touch-pan-y will-change-transform" style={trackStyle}>
            {slides.map((s, i) => {
              const inView = i >= value && i < value + per;
              return (
                <div
                  key={s.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={s.label ?? `Slide ${i + 1} of ${count}`}
                  aria-hidden={!inView}
                  id={`${baseId}-slide-${i}`}
                  style={slideStyle}
                  className={cn('select-none', !inView && 'pointer-events-none')}
                >
                  {s.content}
                </div>
              );
            })}
          </div>
        </div>

        {showArrows && count > per ? (
          <>
            <IconButton
              aria-label="Previous slide"
              variant="secondary"
              size="sm"
              onClick={prev}
              disabled={!loop && value === 0}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 shadow-md',
                arrowPosition === 'overlay' ? 'left-2' : '-left-12 sm:-left-14',
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </IconButton>
            <IconButton
              aria-label="Next slide"
              variant="secondary"
              size="sm"
              onClick={next}
              disabled={!loop && value >= maxIndex}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 shadow-md',
                arrowPosition === 'overlay' ? 'right-2' : '-right-12 sm:-right-14',
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </IconButton>
          </>
        ) : null}
      </div>

      {showDots && pageCount > 1 ? (
        <div
          role="tablist"
          aria-label="Slide pagination"
          className="flex items-center justify-center gap-1.5 py-3"
        >
          {dotPages.map((page) => {
            const active = page === value;
            return (
              <button
                key={page}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`${baseId}-slide-${page}`}
                aria-label={`Go to slide ${page + 1}`}
                tabIndex={active ? 0 : -1}
                onClick={() => goTo(page)}
                className={cn(
                  'rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  active ? 'h-2 w-6 bg-primary' : 'h-2 w-2 bg-border hover:bg-border-strong',
                )}
              />
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
