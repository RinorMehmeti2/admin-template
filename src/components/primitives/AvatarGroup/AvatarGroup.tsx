import {
  Fragment,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { Avatar, type AvatarProps } from '@/components/primitives/Avatar';

type AvatarSize = NonNullable<AvatarProps['size']>;
export type AvatarGroupSpacing = 'tight' | 'normal' | 'loose';

const groupStyles = cva('isolate inline-flex items-center', {
  variants: {
    direction: {
      forward: 'flex-row',
      reverse: 'flex-row-reverse',
    },
  },
  defaultVariants: { direction: 'forward' },
});

/*
 * Per-item negative margin. The first rendered child resets to ml-0 below.
 * Overlap scales with size so larger avatars still overlap proportionally.
 */
const overlapStyles = cva('relative rounded-full ring-2 ring-background', {
  variants: {
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      xl: '',
    },
    spacing: {
      tight: '',
      normal: '',
      loose: '',
    },
  },
  compoundVariants: [
    { size: 'xs', spacing: 'tight', class: '-ml-2.5' },
    { size: 'xs', spacing: 'normal', class: '-ml-2' },
    { size: 'xs', spacing: 'loose', class: '-ml-1' },
    { size: 'sm', spacing: 'tight', class: '-ml-3' },
    { size: 'sm', spacing: 'normal', class: '-ml-2' },
    { size: 'sm', spacing: 'loose', class: '-ml-1' },
    { size: 'md', spacing: 'tight', class: '-ml-4' },
    { size: 'md', spacing: 'normal', class: '-ml-3' },
    { size: 'md', spacing: 'loose', class: '-ml-1.5' },
    { size: 'lg', spacing: 'tight', class: '-ml-5' },
    { size: 'lg', spacing: 'normal', class: '-ml-4' },
    { size: 'lg', spacing: 'loose', class: '-ml-2' },
    { size: 'xl', spacing: 'tight', class: '-ml-6' },
    { size: 'xl', spacing: 'normal', class: '-ml-5' },
    { size: 'xl', spacing: 'loose', class: '-ml-3' },
  ],
  defaultVariants: { size: 'md', spacing: 'normal' },
});

const overflowChipSizeStyles = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full bg-surface-muted font-medium text-foreground select-none',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[0.625rem]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
      },
      interactive: {
        true: 'cursor-pointer transition-colors hover:bg-surface-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        false: '',
      },
    },
    defaultVariants: { size: 'md', interactive: false },
  },
);

export interface AvatarGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof groupStyles> {
  ref?: Ref<HTMLDivElement>;
  /** Avatar prop bags. Rendered left-to-right (or right-to-left when `reverseOrder`). */
  items: AvatarProps[];
  /** Maximum visible avatars before collapsing into a "+N" chip. */
  max?: number;
  /** Inherited to every child avatar and the overflow chip. */
  size?: AvatarSize;
  /** Overlap amount between siblings. */
  spacing?: AvatarGroupSpacing;
  /**
   * If true, the rightmost avatar is on top instead of the leftmost.
   * Visual order is unchanged — only z-stacking flips.
   */
  reverseOrder?: boolean;
  /** Click handler for the overflow chip. Renders the chip as a `<button>`. */
  onOverflowClick?: ((e: ReactMouseEvent<HTMLButtonElement>) => void) | undefined;
  /** Customise the overflow chip label (default: `+N`). */
  overflowLabel?: ((hiddenCount: number) => ReactNode) | undefined;
  /**
   * Wrap each visible avatar (e.g. with a `<TooltipTrigger>` to show names on
   * hover). The Avatar element is provided pre-built and already keyed —
   * wrap it but do not add layout containers around it, since the overlap
   * margins live on the Avatar itself.
   */
  renderItem?:
    | ((
        /*
         * The element produced by `<Avatar />`. We widen the props type to
         * `any` so consumers can pass it directly into helpers like
         * `<TooltipTrigger>` whose child constraint expects a generic
         * element with HTML event handlers (avatar's handlers are typed for
         * HTMLSpanElement, which is structurally narrower).
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        avatar: ReactElement<any>,
        item: AvatarProps,
        index: number,
      ) => ReactNode)
    | undefined;
  /** Group accessible label (e.g. "Assigned to"). */
  'aria-label'?: string;
}

export function AvatarGroup({
  ref,
  className,
  items,
  max = 5,
  size = 'md',
  spacing = 'normal',
  reverseOrder = false,
  onOverflowClick,
  overflowLabel,
  renderItem,
  ...rest
}: AvatarGroupProps) {
  const total = items.length;
  const visible = total > max ? items.slice(0, max) : items;
  const hidden = total - visible.length;
  const hasOverflow = hidden > 0;

  // Children in DOM order — visible avatars first, then overflow chip last.
  // Z-stack is "earlier child is on top" by default; reverseOrder flips it.
  const slotCount = visible.length + (hasOverflow ? 1 : 0);
  const topZ = slotCount;

  return (
    <div
      ref={ref}
      role="group"
      className={cn(groupStyles({ direction: reverseOrder ? 'reverse' : 'forward' }), className)}
      {...rest}
    >
      {visible.map((item, i) => {
        const { className: itemClass, style: itemStyle, ...itemRest } = item;
        const isFirstInDom = i === 0;
        const z = reverseOrder ? i + 1 : topZ - i;
        const key = keyFor(item, i);
        const avatar = (
          <Avatar
            size={size}
            className={cn(overlapStyles({ size, spacing }), isFirstInDom && 'ml-0', itemClass)}
            style={{ zIndex: z, ...(itemStyle ?? {}) }}
            {...itemRest}
          />
        );
        if (renderItem) {
          return <Fragment key={key}>{renderItem(avatar, item, i)}</Fragment>;
        }
        return <Fragment key={key}>{avatar}</Fragment>;
      })}
      {hasOverflow ? (
        <OverflowChip
          size={size}
          spacing={spacing}
          isFirstInDom={visible.length === 0}
          zIndex={reverseOrder ? visible.length + 1 : 1}
          onClick={onOverflowClick}
          hidden={hidden}
          label={overflowLabel}
        />
      ) : null}
    </div>
  );
}

function keyFor(item: AvatarProps, i: number): string {
  if (typeof item.src === 'string' && item.src.length > 0) return `src:${item.src}`;
  if (typeof item.name === 'string' && item.name.length > 0) return `name:${item.name}:${i}`;
  return `i:${i}`;
}

interface OverflowChipProps {
  size: AvatarSize;
  spacing: AvatarGroupSpacing;
  isFirstInDom: boolean;
  zIndex: number;
  hidden: number;
  onClick?: ((e: ReactMouseEvent<HTMLButtonElement>) => void) | undefined;
  label?: ((hiddenCount: number) => ReactNode) | undefined;
}

function OverflowChip({
  size,
  spacing,
  isFirstInDom,
  zIndex,
  hidden,
  onClick,
  label,
}: OverflowChipProps) {
  const content = label ? label(hidden) : `+${hidden}`;
  const ariaLabel = `${hidden} more`;
  const interactive = onClick !== undefined;
  const overlap = overlapStyles({ size, spacing });
  const chip = overflowChipSizeStyles({ size, interactive });
  const className = cn(overlap, chip, isFirstInDom && 'ml-0');
  const style = { zIndex };

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={className}
        style={style}
      >
        <span aria-hidden="true">{content}</span>
      </button>
    );
  }
  return (
    <span role="img" aria-label={ariaLabel} className={className} style={style}>
      <span aria-hidden="true">{content}</span>
    </span>
  );
}
