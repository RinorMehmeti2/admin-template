import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { useSwipe } from '@/hooks/useSwipe';
import type { ToastItem } from '@/context/ToastProvider';

const iconByType = {
  success: { Icon: CheckCircle2, color: 'text-success' },
  error: { Icon: XCircle, color: 'text-danger' },
  warning: { Icon: AlertTriangle, color: 'text-warning' },
  info: { Icon: Info, color: 'text-info' },
  neutral: { Icon: Info, color: 'text-foreground-muted' },
} as const;

export interface ToastProps {
  toast: ToastItem;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);
  const startTime = useRef<number>(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep onDismiss in a ref so the timer effect doesn't re-fire on parent re-render.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (toast.duration === 0 || !Number.isFinite(toast.duration)) return; // sticky
    if (paused) return;

    timer.current = setTimeout(() => onDismissRef.current(), remaining.current);
    startTime.current = Date.now();
    return () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
        remaining.current = Math.max(0, remaining.current - (Date.now() - startTime.current));
      }
    };
  }, [paused, toast.duration]);

  const { Icon, color } = iconByType[toast.type];
  const role = toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status';

  // Touch-only swipe-right to dismiss. Tracks live drag offset for visual
  // feedback; fires onDismiss past threshold (or on a high-velocity flick).
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const swipe = useSwipe({
    axis: 'x',
    touchOnly: true,
    dismissThreshold: 80,
    onSwipeStart: () => setIsDragging(true),
    onSwipeMove: ({ dx }) => setDragX(Math.max(0, dx)),
    onSwipe: (direction) => {
      if (direction === 'right') onDismiss();
    },
    onSwipeEnd: () => {
      setIsDragging(false);
      setDragX(0);
    },
  });

  return (
    <div
      role={role}
      data-testid="toast"
      data-print="hide"
      onPointerDown={swipe.onPointerDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{
        transform: isDragging ? `translateX(${dragX}px)` : undefined,
        opacity: isDragging ? Math.max(0.4, 1 - dragX / 200) : undefined,
        transition: isDragging
          ? 'none'
          : 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms',
      }}
      className={cn(
        'pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg',
        'motion-safe:animate-toast-in touch-pan-y',
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', color)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {toast.title !== undefined ? (
          <p className="text-sm font-medium text-foreground">{toast.title}</p>
        ) : null}
        {toast.description !== undefined ? (
          <p className={cn('text-sm text-foreground-muted', toast.title !== undefined && 'mt-0.5')}>
            {toast.description}
          </p>
        ) : null}
        {toast.action !== undefined ? (
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              toast.action?.onClick();
              onDismiss();
            }}
            className="mt-1"
          >
            {toast.action.label}
          </Button>
        ) : null}
      </div>
      <IconButton
        aria-label="Dismiss notification"
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        className="-mr-1 -mt-1"
      >
        <X className="h-4 w-4" />
      </IconButton>
    </div>
  );
}
