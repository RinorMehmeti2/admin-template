import { type ReactNode, type Ref } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useScrollLock } from '@/hooks/useScrollLock';
import { IconButton } from '@/components/primitives/IconButton';

export interface FocusModeProps {
  ref?: Ref<HTMLDivElement>;
  title: ReactNode;
  /** Called by Escape key, the close button, and (if showBack) the back button. */
  onExit: () => void;
  children: ReactNode;
  /** Show a leading back-arrow button alongside the close button. Default true. */
  showBack?: boolean;
  /** Optional content slot in the bar (right of title, left of close). */
  toolbar?: ReactNode;
  className?: string;
  /** Default true. Set false to opt out of body scroll lock. */
  lockScroll?: boolean;
  /** Disable the Escape-to-exit handler if your inner UI handles Escape itself. */
  closeOnEscape?: boolean;
}

/**
 * Distraction-free chrome: a thin top bar (back / title / toolbar / close) and
 * a scrollable body. Sidebar / Topbar are not rendered because FocusMode
 * paints over the viewport. Mount as a sibling of (or inside, but covering)
 * the AppLayout — it's `fixed inset-0`.
 */
export function FocusMode({
  ref,
  title,
  onExit,
  children,
  showBack = true,
  toolbar,
  className,
  lockScroll = true,
  closeOnEscape = true,
}: FocusModeProps) {
  useEscapeKey(onExit, { enabled: closeOnEscape });
  useScrollLock(lockScroll);

  return (
    <div
      ref={ref}
      role="region"
      aria-label={typeof title === 'string' ? title : 'Focus mode'}
      className={cn(
        'fixed inset-0 z-40 flex flex-col bg-background text-foreground',
        'motion-safe:animate-overlay-in',
        className,
      )}
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-surface px-3">
        {showBack ? (
          <IconButton
            aria-label="Back"
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </IconButton>
        ) : null}
        <h1 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {toolbar !== undefined ? (
          <div className="flex shrink-0 items-center gap-2">{toolbar}</div>
        ) : null}
        <IconButton
          aria-label="Exit focus mode"
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </IconButton>
      </header>
      <main className="min-h-0 flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
}
