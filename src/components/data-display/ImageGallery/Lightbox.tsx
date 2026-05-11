import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFocusReturn } from '@/hooks/useFocusReturn';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useId } from '@/hooks/useId';
import { Portal } from '@/components/overlays/Portal';
import { IconButton } from '@/components/primitives/IconButton';
import type { LightboxProps } from './ImageGallery.types';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;
const CLICK_ZOOM_TARGET = 2;
const DRAG_THRESHOLD_PX = 4;

interface Anchor {
  x: number;
  y: number;
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

export function Lightbox({
  images,
  index,
  open,
  onClose,
  onIndexChange,
  showDownload = true,
  showThumbnails = true,
  className,
}: LightboxProps) {
  const titleId = useId('lightbox-title');
  const captionId = useId('lightbox-caption');
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const total = images.length;
  const hasPrev = total > 1;
  const hasNext = total > 1;
  const safeIndex = total === 0 ? 0 : clamp(index, 0, total - 1);
  const current = images[safeIndex];

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
    moved: boolean;
  } | null>(null);

  // Reset zoom whenever the active image changes or lightbox closes — done
  // during render via the "store previous prop" pattern instead of an effect
  // so we don't trigger a cascading render.
  const [prevIndex, setPrevIndex] = useState(safeIndex);
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevIndex !== safeIndex || prevOpen !== open) {
    setPrevIndex(safeIndex);
    setPrevOpen(open);
    if (zoom !== 1) setZoom(1);
    if (pan.x !== 0 || pan.y !== 0) setPan({ x: 0, y: 0 });
  }

  // Preload neighbours (no-op when SSR or no Image ctor).
  useEffect(() => {
    if (!open || typeof window === 'undefined' || total === 0) return;
    const preload = (i: number) => {
      const next = images[i];
      if (next === undefined) return;
      const img = new window.Image();
      img.src = next.src;
    };
    preload((safeIndex + 1) % total);
    preload((safeIndex - 1 + total) % total);
  }, [open, safeIndex, images, total]);

  /* ---------------------------- Navigation -------------------------------- */

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      const wrapped = ((next % total) + total) % total;
      onIndexChange?.(wrapped);
    },
    [onIndexChange, total],
  );
  const goNext = useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex]);
  const goPrev = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);

  /* ---------------------------- Zoom math --------------------------------- */

  const applyZoom = useCallback(
    (target: number, anchor: Anchor | null) => {
      const next = clamp(target, MIN_ZOOM, MAX_ZOOM);
      setZoom((prev) => {
        if (next === prev) return prev;
        if (anchor !== null && imgRef.current !== null) {
          const rect = imgRef.current.getBoundingClientRect();
          // anchor coords relative to image center
          const ax = anchor.x - (rect.left + rect.width / 2);
          const ay = anchor.y - (rect.top + rect.height / 2);
          setPan((p) => {
            // world-space position of the anchor under current pan/zoom
            const wx = (ax - p.x) / prev;
            const wy = (ay - p.y) / prev;
            // pan that keeps that world point under the cursor at new zoom
            return { x: ax - wx * next, y: ay - wy * next };
          });
        }
        if (next <= MIN_ZOOM) {
          setPan({ x: 0, y: 0 });
        }
        return next;
      });
    },
    [],
  );

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  /* ---------------------------- Keyboard ---------------------------------- */

  useEscapeKey(() => onClose(), { enabled: open });

  // Document-level keydown so the dialog div doesn't need an inline keyboard
  // listener (avoids jsx-a11y/no-noninteractive-element-interactions). Active
  // only while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          if (hasNext) {
            e.preventDefault();
            goNext();
          }
          return;
        case 'ArrowLeft':
          if (hasPrev) {
            e.preventDefault();
            goPrev();
          }
          return;
        case '+':
        case '=':
          e.preventDefault();
          applyZoom(zoom + ZOOM_STEP, null);
          return;
        case '-':
        case '_':
          e.preventDefault();
          applyZoom(zoom - ZOOM_STEP, null);
          return;
        case '0':
          e.preventDefault();
          resetZoom();
          return;
        default:
          return;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, hasNext, hasPrev, goNext, goPrev, zoom, applyZoom, resetZoom]);

  /* ---------------------------- Pointer / wheel --------------------------- */

  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    // Prevent the page from scrolling under the lightbox while wheeling.
    if (e.deltaY === 0) return;
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    applyZoom(zoom + delta, { x: e.clientX, y: e.clientY });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom <= MIN_ZOOM) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: false,
    };
    setIsDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    if (start === null) return;
    const dx = e.clientX - start.startX;
    const dy = e.clientY - start.startY;
    if (!start.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      start.moved = true;
    }
    setPan({ x: start.panX + dx, y: start.panY + dy });
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    if (start === null) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const moved = start.moved;
    dragRef.current = null;
    setIsDragging(false);
    // If pointer didn't move, treat as click-zoom on the image.
    if (!moved) {
      handleImageClick({ x: e.clientX, y: e.clientY });
    }
  };

  const handleImageClick = (anchor: Anchor) => {
    if (zoom < CLICK_ZOOM_TARGET) {
      applyZoom(CLICK_ZOOM_TARGET, anchor);
    } else {
      resetZoom();
    }
  };

  const onImageClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    // When zoomed, click is handled via pointer up to disambiguate from drag.
    if (zoom > MIN_ZOOM) return;
    handleImageClick({ x: e.clientX, y: e.clientY });
  };

  /* ---------------------------- Modal hooks ------------------------------- */

  useFocusReturn(open);
  useFocusTrap(containerRef, { active: open, returnFocus: false });
  useScrollLock(open);

  /* ---------------------------- Render ------------------------------------ */

  if (!open || current === undefined) return null;

  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;

  return (
    <Portal>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={current.caption !== undefined ? captionId : undefined}
        tabIndex={-1}
        data-print="hide"
        data-zoom={zoom.toFixed(2)}
        data-pan-x={pan.x.toFixed(0)}
        data-pan-y={pan.y.toFixed(0)}
        data-testid="lightbox"
        className={cn(
          'fixed inset-0 z-[60] flex flex-col bg-foreground/90 outline-none',
          'motion-safe:animate-overlay-in',
          className,
        )}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-background">
          <div className="min-w-0 flex-1 truncate">
            <span id={titleId} className="text-sm font-medium">
              {current.alt}
            </span>
            {total > 1 ? (
              <span className="ml-2 text-xs text-background/70">
                {safeIndex + 1} / {total}
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {showDownload ? (
              <a
                href={current.src}
                download={current.alt}
                aria-label="Download image"
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-md text-background hover:bg-white/10',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Close lightbox"
              onClick={onClose}
              className="text-background hover:bg-white/10"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </div>
        </div>

        {/* Image stage. role="group" lifts the bare <div> into ARIA-interactive
            territory so the pointer/wheel handlers (zoom + pan widget) don't
            trip jsx-a11y/no-noninteractive-element-interactions. */}
        <div
          role="group"
          aria-label="Zoom and pan area"
          className={cn(
            'relative flex min-h-0 flex-1 items-center justify-center overflow-hidden',
            zoom > MIN_ZOOM ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in',
          )}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {hasPrev ? (
            <IconButton
              variant="ghost"
              size="md"
              aria-label="Previous image"
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-background hover:bg-white/10"
              data-testid="lightbox-prev"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          ) : null}
          {/*
            Image transform: translate + scale anchored on the image center,
            so anchor math in applyZoom matches what the browser renders.
            Wrapped in a <button> so click-to-zoom is intrinsically
            interactive (no jsx-a11y disable needed) and keyboard users can
            Enter to zoom-toggle the focused image.
          */}
          <button
            type="button"
            onClick={onImageClick}
            data-testid="lightbox-image-button"
            aria-label={`${current.alt} — click to ${zoom < CLICK_ZOOM_TARGET ? 'zoom in' : 'reset zoom'}`}
            className="block max-h-full max-w-full border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              transform,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 100ms ease-out',
            }}
          >
            <img
              ref={imgRef}
              src={current.src}
              alt={current.alt}
              draggable={false}
              data-testid="lightbox-image"
              className="pointer-events-none max-h-full max-w-full select-none object-contain"
            />
          </button>
          {hasNext ? (
            <IconButton
              variant="ghost"
              size="md"
              aria-label="Next image"
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-background hover:bg-white/10"
              data-testid="lightbox-next"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          ) : null}
        </div>

        {/* Caption */}
        {current.caption !== undefined ? (
          <p
            id={captionId}
            className="border-t border-white/10 px-4 py-2 text-center text-sm text-background/80"
          >
            {current.caption}
          </p>
        ) : null}

        {/* Thumbnail strip */}
        {showThumbnails && total > 1 ? (
          <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-white/10 px-4 py-3">
            {images.map((img, i) => {
              const isCurrent = i === safeIndex;
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${img.alt}`}
                  aria-current={isCurrent ? 'true' : undefined}
                  data-testid={`lightbox-thumb-${i}`}
                  className={cn(
                    'h-14 w-20 shrink-0 overflow-hidden rounded border-2 transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-foreground',
                    isCurrent
                      ? 'border-primary opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100',
                  )}
                >
                  <img
                    src={img.thumbnail ?? img.src}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </Portal>
  );
}
