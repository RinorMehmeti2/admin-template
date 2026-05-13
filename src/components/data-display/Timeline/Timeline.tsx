import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  type HTMLAttributes,
  type LiHTMLAttributes,
  type OlHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { formatDate, isSameDay, isToday, startOfDay } from '@/lib/date';

/* -------------------------------------------------------------------------- */
/*  Root context                                                              */
/* -------------------------------------------------------------------------- */

export type TimelineOrientation = 'vertical' | 'horizontal';

interface TimelineContextValue {
  orientation: TimelineOrientation;
  formatTimestamp: (date: Date) => string;
}

const TimelineContext = createContext<TimelineContextValue | null>(null);

function useTimeline(part: string): TimelineContextValue {
  const ctx = useContext(TimelineContext);
  if (ctx === null) throw new Error(`<${part}> must be rendered inside <Timeline>`);
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Date helpers                                                              */
/* -------------------------------------------------------------------------- */

function toDate(input: Date | string | number): Date {
  if (input instanceof Date) return input;
  return new Date(input);
}

function defaultFormatTimestamp(d: Date): string {
  return isToday(d) ? formatDate(d, 'h:mm a') : formatDate(d, 'MMM d, yyyy h:mm a');
}

function formatDayHeader(d: Date): string {
  const today = startOfDay(new Date());
  const day = startOfDay(d);
  const diff = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return formatDate(d, 'EEEE, MMM d, yyyy');
}

/* -------------------------------------------------------------------------- */
/*  Timeline (root)                                                           */
/* -------------------------------------------------------------------------- */

const timelineStyles = cva('relative', {
  variants: {
    orientation: {
      vertical: 'flex flex-col',
      horizontal: 'flex flex-row items-start gap-6 overflow-x-auto',
    },
  },
  defaultVariants: { orientation: 'vertical' },
});

export interface TimelineProps extends Omit<OlHTMLAttributes<HTMLOListElement>, 'children'> {
  ref?: Ref<HTMLOListElement>;
  orientation?: TimelineOrientation;
  /** Insert a sticky day header above each cluster of items sharing the same date. */
  groupBy?: 'day' | undefined;
  /** Override how each item's timestamp is rendered as text. */
  formatTimestamp?: ((date: Date) => string) | undefined;
  children: ReactNode;
}

export function Timeline({
  ref,
  className,
  orientation = 'vertical',
  groupBy,
  formatTimestamp,
  children,
  ...rest
}: TimelineProps) {
  const ctx = useMemo<TimelineContextValue>(
    () => ({
      orientation,
      formatTimestamp: formatTimestamp ?? defaultFormatTimestamp,
    }),
    [orientation, formatTimestamp],
  );

  const rendered = useMemo<ReactNode>(() => {
    if (groupBy !== 'day' || orientation !== 'vertical') return children;

    const childArray = Children.toArray(children);
    type Group = { key: string; date: Date; items: ReactElement<TimelineItemProps>[] };
    const groups: Group[] = [];

    for (const node of childArray) {
      if (!isTimelineItemElement(node)) continue;
      const date = toDate(node.props.timestamp);
      const last = groups[groups.length - 1];
      if (last && isSameDay(last.date, date)) {
        last.items.push(node);
      } else {
        groups.push({ key: formatDate(startOfDay(date), 'yyyy-MM-dd'), date, items: [node] });
      }
    }

    return groups.map((g) => (
      <TimelineGroup key={g.key} date={g.date}>
        {g.items}
      </TimelineGroup>
    ));
  }, [children, groupBy, orientation]);

  return (
    <TimelineContext.Provider value={ctx}>
      <ol
        ref={ref}
        data-orientation={orientation}
        className={cn(timelineStyles({ orientation }), className)}
        {...rest}
      >
        {rendered}
      </ol>
    </TimelineContext.Provider>
  );
}

function isTimelineItemElement(node: ReactNode): node is ReactElement<TimelineItemProps> {
  return isValidElement(node) && node.type === TimelineItem;
}

/* -------------------------------------------------------------------------- */
/*  Day group (vertical, groupBy='day')                                       */
/* -------------------------------------------------------------------------- */

interface TimelineGroupProps {
  date: Date;
  children: ReactNode;
}

function TimelineGroup({ date, children }: TimelineGroupProps) {
  const label = formatDayHeader(date);
  return (
    <>
      <li
        className={cn(
          'relative pl-9 py-2',
          // Continue the axis line through day-header rows so the timeline
          // reads as one column. Trim the top half if this is the very first
          // row in the <ol> (no marker exists above it).
          "before:pointer-events-none before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-border before:-translate-x-1/2 before:content-['']",
          'first:before:top-4',
        )}
      >
        <h3 className="sticky top-0 z-10 inline-flex bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          <time dateTime={date.toISOString()}>{label}</time>
        </h3>
      </li>
      {children}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  TimelineItem                                                              */
/* -------------------------------------------------------------------------- */

export type TimelineVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted';

const dotStyles = cva('inline-block rounded-full ring-2 ring-surface', {
  variants: {
    variant: {
      default: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      info: 'bg-info',
      muted: 'bg-foreground-muted',
    },
  },
  defaultVariants: { variant: 'default' },
});

const iconBoxStyles = cva(
  'inline-flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-surface',
  {
    variants: {
      variant: {
        default:
          'bg-[color-mix(in_srgb,var(--color-primary)_15%,var(--color-surface))] text-primary',
        success:
          'bg-[color-mix(in_srgb,var(--color-success)_15%,var(--color-surface))] text-success',
        warning:
          'bg-[color-mix(in_srgb,var(--color-warning)_15%,var(--color-surface))] text-warning',
        danger:
          'bg-[color-mix(in_srgb,var(--color-danger)_15%,var(--color-surface))] text-danger',
        info: 'bg-[color-mix(in_srgb,var(--color-info)_15%,var(--color-surface))] text-info',
        muted: 'bg-surface-muted text-foreground-muted',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

/* Per-item axis connector — drawn as a ::before pseudo so its position is
 * tied to the marker (not the <ol>'s padding-box). Marker center sits at
 * 16px from the li's leading edge (vertical: x=16, horizontal: y=16) because
 * the marker is a 32px-square first child of the li with no padding.
 * `first:` trims the line to start at the first marker's center; `last:`
 * trims it to end at the last marker's center. */
const itemStyles = cva(
  'relative ' +
    "before:pointer-events-none before:absolute before:bg-border before:content-['']",
  {
    variants: {
      orientation: {
        vertical:
          'flex gap-4 pb-6 last:pb-0 ' +
          'before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:-translate-x-1/2 ' +
          'first:before:top-4 last:before:bottom-auto last:before:h-4',
        horizontal:
          'flex flex-col items-center gap-2 min-w-[10rem] ' +
          // Extend the line by half the parent `gap-6` (12px = -mx-3) so the
          // axis bridges the inter-item gutter; first/last collapse to the
          // marker center to avoid overhang at the ends.
          'before:top-4 before:-left-3 before:-right-3 before:h-0.5 before:-translate-y-1/2 ' +
          'first:before:left-1/2 last:before:right-1/2',
      },
    },
    defaultVariants: { orientation: 'vertical' },
  },
);

export interface TimelineItemProps
  extends Omit<LiHTMLAttributes<HTMLLIElement>, 'title' | 'children'>,
    VariantProps<typeof dotStyles> {
  ref?: Ref<HTMLLIElement>;
  timestamp: Date | string | number;
  /** Custom icon. When omitted, a colored dot is rendered. */
  icon?: ReactNode | undefined;
  /** Either pass `title`, or pass `actor` + `action` for the common shorthand. */
  title?: ReactNode | undefined;
  actor?: ReactNode | undefined;
  action?: ReactNode | undefined;
  description?: ReactNode | undefined;
  /** Rich content slot (Card, Diff, etc.). */
  children?: ReactNode | undefined;
  /** Suppress the visible timestamp text (still renders an accessible `<time>`). */
  hideTimestamp?: boolean | undefined;
}

export function TimelineItem({
  ref,
  className,
  timestamp,
  icon,
  variant = 'default',
  title,
  actor,
  action,
  description,
  children,
  hideTimestamp,
  ...rest
}: TimelineItemProps) {
  const { orientation, formatTimestamp } = useTimeline('TimelineItem');
  const date = toDate(timestamp);
  const iso = isNaN(date.getTime()) ? '' : date.toISOString();
  const label = isNaN(date.getTime()) ? '' : formatTimestamp(date);

  const heading =
    title !== undefined ? (
      <span className="text-sm font-medium text-foreground">{title}</span>
    ) : actor !== undefined || action !== undefined ? (
      <span className="text-sm text-foreground">
        {actor !== undefined ? (
          <span className="font-medium text-foreground">{actor}</span>
        ) : null}
        {actor !== undefined && action !== undefined ? ' ' : null}
        {action !== undefined ? <span className="text-foreground-muted">{action}</span> : null}
      </span>
    ) : null;

  return (
    <li
      ref={ref}
      data-variant={variant ?? 'default'}
      className={cn(itemStyles({ orientation }), className)}
      {...rest}
    >
      <TimelineMarker variant={variant ?? 'default'}>{icon}</TimelineMarker>
      <TimelineContent>
        {heading}
        {description !== undefined ? (
          <p className="mt-0.5 text-sm text-foreground-muted">{description}</p>
        ) : null}
        {children !== undefined ? <div className="mt-2">{children}</div> : null}
        {hideTimestamp === true ? (
          iso !== '' ? (
            <time dateTime={iso} className="sr-only">
              {label}
            </time>
          ) : null
        ) : (
          <time
            dateTime={iso}
            className="mt-1 block text-xs tabular-nums text-foreground-subtle"
          >
            {label}
          </time>
        )}
      </TimelineContent>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Marker + Content + Connector (exposed for advanced composition)           */
/* -------------------------------------------------------------------------- */

export interface TimelineMarkerProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
  variant?: TimelineVariant;
  /** When provided, marker renders an icon box; otherwise a colored dot. */
  children?: ReactNode | undefined;
}

export function TimelineMarker({
  ref,
  className,
  variant = 'default',
  children,
  ...rest
}: TimelineMarkerProps) {
  const { orientation } = useTimeline('TimelineMarker');
  const isIcon = children !== undefined && children !== null && children !== false;
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        'relative z-[1] flex shrink-0 items-center justify-center',
        orientation === 'vertical' ? 'h-8 w-8' : 'h-8 w-8',
        className,
      )}
      {...rest}
    >
      {isIcon ? (
        <span className={iconBoxStyles({ variant })}>{children}</span>
      ) : (
        <span className={cn(dotStyles({ variant }), 'h-3 w-3')} />
      )}
    </span>
  );
}

export interface TimelineContentProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export function TimelineContent({ ref, className, ...rest }: TimelineContentProps) {
  const { orientation } = useTimeline('TimelineContent');
  return (
    <div
      ref={ref}
      className={cn(
        'min-w-0',
        orientation === 'vertical' ? 'flex-1' : 'text-center',
        className,
      )}
      {...rest}
    />
  );
}

/**
 * Manual connector — exposed for advanced layouts where the auto-drawn axis
 * line in <Timeline> isn't enough (e.g. branched/forked timelines). Most
 * consumers should not need to render this directly.
 */
export interface TimelineConnectorProps extends HTMLAttributes<HTMLSpanElement> {
  ref?: Ref<HTMLSpanElement>;
}

export function TimelineConnector({ ref, className, ...rest }: TimelineConnectorProps) {
  const { orientation } = useTimeline('TimelineConnector');
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        orientation === 'vertical' ? 'block w-px flex-1 bg-border' : 'block h-px flex-1 bg-border',
        className,
      )}
      {...rest}
    />
  );
}
