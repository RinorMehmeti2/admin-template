import {
  useCallback,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '@/lib/cn';
import { useControllableState } from '@/hooks/useControllableState';
import { useDrag } from '@/hooks/useDrag';
import {
  clamp,
  ratioFromValue,
  roundToStep,
  valueFromPointer,
  type SliderOrientation,
} from './sliderUtils';

export interface SliderMark {
  value: number;
  label?: ReactNode;
}

export interface SliderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  ref?: Ref<HTMLDivElement>;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Fires on the final value when interaction ends (pointer up / blur). */
  onValueCommit?: (value: number) => void;

  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: SliderOrientation;
  invert?: boolean;

  marks?: ReadonlyArray<SliderMark>;
  /** Override the aria-valuetext for screen readers. Useful for currency, %, etc. */
  formatValue?: (value: number) => string;

  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function Slider({
  ref,
  className,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  orientation = 'horizontal',
  invert = false,
  marks,
  formatValue,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...rest
}: SliderProps) {
  const [internal, setInternal] = useControllableState<number>({
    value,
    defaultValue: defaultValue ?? min,
    onChange: onValueChange,
  });
  const current = roundToStep(internal ?? min, step, min, max);

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const setValue = useCallback(
    (next: number) => {
      const clamped = roundToStep(next, step, min, max);
      setInternal(clamped);
    },
    [setInternal, step, min, max],
  );

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const track = trackRef.current;
      if (track === null) return;
      const next = valueFromPointer({
        clientX,
        clientY,
        geometry: {
          rect: track.getBoundingClientRect(),
          min,
          max,
          step,
          orientation,
          invert,
        },
      });
      setValue(next);
    },
    [setValue, min, max, step, orientation, invert],
  );

  const drag = useDrag({
    enabled: !disabled,
    onMove: (delta) => {
      updateFromPointer(delta.x, delta.y);
    },
    onEnd: () => {
      onValueCommit?.(roundToStep(current, step, min, max));
    },
  });

  const onTrackPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.button !== undefined && e.button !== 0) return;
    // Jump-to-pointer immediately, then start dragging the thumb.
    updateFromPointer(e.clientX, e.clientY);
    thumbRef.current?.focus();
    drag.onPointerDown(e);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const big = step * 10;
    const dir = invert ? -1 : 1;
    let next: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
        next = current + (orientation === 'horizontal' ? dir : 1) * (e.shiftKey ? big : step);
        break;
      case 'ArrowLeft':
        next = current - (orientation === 'horizontal' ? dir : 1) * (e.shiftKey ? big : step);
        break;
      case 'ArrowUp':
        next = current + (orientation === 'vertical' ? dir : 1) * (e.shiftKey ? big : step);
        break;
      case 'ArrowDown':
        next = current - (orientation === 'vertical' ? dir : 1) * (e.shiftKey ? big : step);
        break;
      case 'PageUp':
        next = current + big;
        break;
      case 'PageDown':
        next = current - big;
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }

    e.preventDefault();
    setValue(clamp(next, min, max));
  };

  const onBlur = () => {
    if (!drag.isDragging) {
      onValueCommit?.(current);
    }
  };

  const filledRatio = ratioFromValue(current, min, max, invert);
  const isHorizontal = orientation === 'horizontal';

  const filledStyle: CSSProperties = isHorizontal
    ? invert
      ? { left: `${(1 - filledRatio) * 100}%`, right: 0 }
      : { left: 0, right: `${(1 - filledRatio) * 100}%` }
    : invert
      ? { top: 0, bottom: `${(1 - filledRatio) * 100}%` }
      : { top: `${(1 - filledRatio) * 100}%`, bottom: 0 };

  const thumbStyle: CSSProperties = isHorizontal
    ? { left: `${filledRatio * 100}%` }
    : { top: `${(1 - filledRatio) * 100}%` };

  const valueText = formatValue !== undefined ? formatValue(current) : undefined;

  return (
    <SliderRoot
      ref={ref}
      className={className}
      orientation={orientation}
      disabled={disabled}
      {...rest}
    >
      <SliderTrack
        ref={trackRef}
        orientation={orientation}
        disabled={disabled}
        onPointerDown={onTrackPointerDown}
      >
        <SliderRange orientation={orientation} style={filledStyle} />
        {marks !== undefined ? (
          <SliderMarks
            marks={marks}
            min={min}
            max={max}
            invert={invert}
            orientation={orientation}
          />
        ) : null}
        <SliderThumb
          ref={thumbRef}
          orientation={orientation}
          disabled={disabled}
          style={thumbStyle}
          onPointerDown={(e) => {
            if (disabled) return;
            if (e.button !== undefined && e.button !== 0) return;
            e.stopPropagation();
            thumbRef.current?.focus();
            drag.onPointerDown(e);
          }}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-orientation={orientation}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={valueText}
          aria-disabled={disabled ? true : undefined}
        />
      </SliderTrack>
      {marks !== undefined ? (
        <SliderMarkLabels
          marks={marks}
          min={min}
          max={max}
          invert={invert}
          orientation={orientation}
        />
      ) : null}
    </SliderRoot>
  );
}

/* ----- internal building blocks (also used by RangeSlider) ----- */

interface SliderRootProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement> | undefined;
  orientation: SliderOrientation;
  disabled: boolean;
}

export function SliderRoot({
  ref,
  orientation,
  disabled,
  className,
  children,
  ...rest
}: SliderRootProps) {
  return (
    <div
      ref={ref}
      data-orientation={orientation}
      data-disabled={disabled ? '' : undefined}
      className={cn(
        'relative touch-none select-none',
        orientation === 'horizontal' ? 'flex w-full flex-col' : 'inline-flex h-full flex-row',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface SliderTrackProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  orientation: SliderOrientation;
  disabled: boolean;
}

export function SliderTrack({
  ref,
  orientation,
  disabled,
  className,
  children,
  ...rest
}: SliderTrackProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'relative rounded-full bg-surface-muted',
        orientation === 'horizontal' ? 'my-2 h-1.5 w-full' : 'mx-2 h-full w-1.5',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface SliderRangeProps extends HTMLAttributes<HTMLDivElement> {
  orientation: SliderOrientation;
}

export function SliderRange({ orientation, className, style, ...rest }: SliderRangeProps) {
  return (
    <div
      className={cn(
        'absolute rounded-full bg-primary',
        orientation === 'horizontal' ? 'top-0 bottom-0' : 'left-0 right-0',
        className,
      )}
      style={style}
      {...rest}
    />
  );
}

interface SliderThumbProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  orientation: SliderOrientation;
  disabled: boolean;
}

export function SliderThumb({
  ref,
  orientation,
  disabled,
  className,
  style,
  ...rest
}: SliderThumbProps) {
  const offsetTransform =
    orientation === 'horizontal'
      ? '-translate-x-1/2 -translate-y-1/2 top-1/2'
      : '-translate-x-1/2 -translate-y-1/2 left-1/2';
  return (
    <div
      ref={ref}
      className={cn(
        'absolute h-4 w-4 rounded-full border-2 border-primary bg-surface shadow-sm',
        offsetTransform,
        'transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        disabled && 'pointer-events-none',
        className,
      )}
      style={style}
      {...rest}
    />
  );
}

interface SliderMarksProps {
  marks: ReadonlyArray<SliderMark>;
  min: number;
  max: number;
  invert: boolean;
  orientation: SliderOrientation;
}

function SliderMarks({ marks, min, max, invert, orientation }: SliderMarksProps) {
  return (
    <>
      {marks.map((m) => {
        const r = ratioFromValue(m.value, min, max, invert);
        const style: CSSProperties =
          orientation === 'horizontal'
            ? { left: `${r * 100}%`, top: '50%' }
            : { top: `${(1 - r) * 100}%`, left: '50%' };
        return (
          <span
            key={m.value}
            aria-hidden="true"
            className="pointer-events-none absolute h-2 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground-subtle/40"
            style={style}
          />
        );
      })}
    </>
  );
}

function SliderMarkLabels({ marks, min, max, invert, orientation }: SliderMarksProps) {
  // Skip if no labels at all.
  if (marks.every((m) => m.label === undefined)) return null;
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none relative text-xs text-foreground-muted',
        orientation === 'horizontal' ? 'mt-1 h-4 w-full' : 'ml-2 h-full min-w-8',
      )}
    >
      {marks.map((m) =>
        m.label === undefined ? null : (
          <span
            key={m.value}
            className={cn(
              'absolute -translate-x-1/2',
              orientation === 'vertical' && '-translate-y-1/2',
            )}
            style={
              orientation === 'horizontal'
                ? { left: `${ratioFromValue(m.value, min, max, invert) * 100}%` }
                : { top: `${(1 - ratioFromValue(m.value, min, max, invert)) * 100}%` }
            }
          >
            {m.label}
          </span>
        ),
      )}
    </div>
  );
}

/* ----- internal hook reused by both components ----- */

export interface UseSliderEngineOptions {
  min: number;
  max: number;
  step: number;
  orientation: SliderOrientation;
  invert: boolean;
  disabled: boolean;
}

export function useSliderEngine(opts: UseSliderEngineOptions) {
  const { min, max, step, orientation, invert, disabled } = opts;
  const trackRef = useRef<HTMLDivElement>(null);

  const valueFromEvent = useCallback(
    (clientX: number, clientY: number): number | null => {
      const track = trackRef.current;
      if (track === null) return null;
      return valueFromPointer({
        clientX,
        clientY,
        geometry: {
          rect: track.getBoundingClientRect(),
          min,
          max,
          step,
          orientation,
          invert,
        },
      });
    },
    [min, max, step, orientation, invert],
  );

  return { trackRef, valueFromEvent, disabled };
}
