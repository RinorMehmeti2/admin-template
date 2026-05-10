import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Star, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useControllableState } from '@/hooks/useControllableState';
import { useId } from '@/hooks/useId';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';

export type RatingIcon = ComponentType<LucideProps>;

const iconStyles = cva('shrink-0 transition-colors', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-7 w-7',
    },
  },
  defaultVariants: { size: 'md' },
});

const rootStyles = cva(
  'inline-flex items-center gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      size: {
        sm: 'p-0.5',
        md: 'p-0.5',
        lg: 'p-1',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
      readOnly: {
        true: 'cursor-default',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: { size: 'md', disabled: false, readOnly: false },
  },
);

export interface RatingProps
  extends Pick<VariantProps<typeof iconStyles>, 'size'> {
  ref?: Ref<HTMLDivElement>;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  max?: number;
  /** When true, half-star values are allowed (0.5 increments). */
  allowHalf?: boolean;
  /** When true, clicking the currently selected value clears it to 0. */
  allowClear?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  icon?: RatingIcon;
  emptyIcon?: RatingIcon;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

function clampValue(v: number, max: number, step: number): number {
  if (!Number.isFinite(v)) return 0;
  const lo = 0;
  const hi = max;
  const clamped = Math.min(Math.max(v, lo), hi);
  const snapped = Math.round(clamped / step) * step;
  return Math.min(Math.max(snapped, lo), hi);
}

export function Rating({
  ref,
  value,
  defaultValue,
  onValueChange,
  max = 5,
  allowHalf = false,
  allowClear = true,
  readOnly = false,
  disabled = false,
  icon: Icon = Star,
  emptyIcon: EmptyIcon,
  size = 'md',
  className,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: RatingProps) {
  const step = allowHalf ? 0.5 : 1;
  const generatedId = useId('rating');
  const fieldId = id ?? generatedId;

  const aria = useFieldAriaProps({
    id: fieldId,
    'aria-describedby': ariaDescribedBy,
    'aria-labelledby': ariaLabelledBy,
  });

  const [stored, setStored] = useControllableState<number>({
    value,
    defaultValue: defaultValue ?? 0,
    onChange: onValueChange,
  });
  const current = clampValue(stored ?? 0, max, step);

  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? current;

  const interactive = !disabled && !readOnly;

  const rowRef = useRef<HTMLDivElement>(null);
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      rowRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref !== null && ref !== undefined) ref.current = node;
    },
    [ref],
  );

  const setValue = useCallback(
    (next: number) => {
      const clamped = clampValue(next, max, step);
      setStored(clamped);
    },
    [setStored, max, step],
  );

  /**
   * For half-star support, returns 0.5 or 1.0 based on pointer x within the icon's bounding rect.
   * Returns 1.0 (full) when allowHalf is false.
   */
  const positionWithin = useCallback(
    (e: ReactPointerEvent<HTMLSpanElement>): number => {
      if (!allowHalf) return 1;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      return ratio <= 0.5 ? 0.5 : 1;
    },
    [allowHalf],
  );

  const handleIconPointerMove = (index: number) => (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (!interactive) return;
    const portion = positionWithin(e);
    setHover(index + portion);
  };

  const handleRowPointerLeave = () => {
    if (!interactive) return;
    setHover(null);
  };

  const handleIconClick = (index: number) => (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (!interactive) return;
    const portion = positionWithin(e);
    const next = index + portion;
    if (allowClear && current === next) {
      setValue(0);
    } else {
      setValue(next);
    }
    setHover(null);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    let next: number | null = null;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = current + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = current - step;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = max;
        break;
      case 'Delete':
      case 'Backspace':
        if (allowClear) next = 0;
        break;
      default:
        // Numeric keys 0..9 set directly when in range.
        if (/^[0-9]$/.test(e.key)) {
          const n = Number(e.key);
          if (n >= 0 && n <= max) next = n;
        }
    }
    if (next === null) return;
    e.preventDefault();
    setValue(next);
  };

  const valueText = useMemo(
    () => (current === 0 ? '0' : `${current} of ${max}`),
    [current, max],
  );

  return (
    <div
      ref={mergedRef}
      id={aria.id}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={current}
      aria-valuetext={valueText}
      aria-orientation="horizontal"
      aria-disabled={disabled ? true : undefined}
      aria-readonly={readOnly ? true : undefined}
      aria-label={ariaLabel}
      aria-labelledby={aria['aria-labelledby']}
      aria-describedby={aria['aria-describedby']}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      onKeyDown={onKeyDown}
      onPointerLeave={handleRowPointerLeave}
      className={cn(rootStyles({ size, disabled, readOnly }), className)}
    >
      {name !== undefined ? (
        <input type="hidden" name={name} value={current} readOnly />
      ) : null}
      {Array.from({ length: max }, (_, i) => {
        const filled = Math.max(0, Math.min(1, display - i));
        return (
          <IconCell
            key={i}
            index={i}
            filled={filled}
            size={size ?? 'md'}
            interactive={interactive}
            Icon={Icon}
            EmptyIcon={EmptyIcon}
            onPointerMove={handleIconPointerMove(i)}
            onClick={handleIconClick(i)}
          />
        );
      })}
    </div>
  );
}

interface IconCellProps {
  index: number;
  filled: number;
  size: NonNullable<VariantProps<typeof iconStyles>['size']>;
  interactive: boolean;
  Icon: RatingIcon;
  EmptyIcon?: RatingIcon | undefined;
  onPointerMove: (e: ReactPointerEvent<HTMLSpanElement>) => void;
  onClick: (e: ReactPointerEvent<HTMLSpanElement>) => void;
}

function IconCell({
  index,
  filled,
  size,
  interactive,
  Icon,
  EmptyIcon,
  onPointerMove,
  onClick,
}: IconCellProps) {
  const halfId = `rating-half-${index}`;
  const Empty = EmptyIcon ?? Icon;
  return (
    <span
      role="presentation"
      data-index={index}
      data-filled={filled}
      onPointerMove={interactive ? onPointerMove : undefined}
      onClick={interactive ? onClick : undefined}
      className={cn(
        'relative inline-flex',
        interactive ? 'cursor-pointer' : 'cursor-inherit',
      )}
    >
      {/* Empty (outline) layer */}
      <Empty
        aria-hidden="true"
        strokeWidth={1.75}
        className={cn(iconStyles({ size }), 'text-foreground-subtle/60')}
        fill="none"
      />
      {/* Filled layer, clipped to `filled` ratio */}
      {filled > 0 ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={
            filled >= 1
              ? undefined
              : { clipPath: `inset(0 ${(1 - filled) * 100}% 0 0)` }
          }
        >
          <Icon
            aria-hidden="true"
            strokeWidth={1.75}
            className={cn(iconStyles({ size }), 'text-warning')}
            fill="currentColor"
          />
        </span>
      ) : null}
      <span id={halfId} className="sr-only">
        {filled >= 1 ? 'filled' : filled >= 0.5 ? 'half' : 'empty'}
      </span>
    </span>
  );
}
