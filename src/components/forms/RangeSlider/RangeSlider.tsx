import {
  useCallback,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from 'react';
import { cn } from '@/lib/cn';
import { useControllableState } from '@/hooks/useControllableState';
import { useDrag } from '@/hooks/useDrag';
import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  type SliderMark,
} from '@/components/forms/Slider';
import {
  clamp,
  ratioFromValue,
  roundToStep,
  valueFromPointer,
  type SliderOrientation,
} from '@/components/forms/Slider/sliderUtils';

export type RangeSliderValue = readonly [number, number];

export interface RangeSliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  ref?: Ref<HTMLDivElement>;
  value?: RangeSliderValue;
  defaultValue?: RangeSliderValue;
  onValueChange?: (value: [number, number]) => void;
  onValueCommit?: (value: [number, number]) => void;

  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: SliderOrientation;
  invert?: boolean;
  /** Minimum gap kept between the two thumbs. Defaults to `step`. */
  minDistance?: number;

  marks?: ReadonlyArray<SliderMark>;
  formatValue?: (value: number) => string;

  /** Per-thumb labels: [minThumb, maxThumb]. */
  thumbAriaLabels?: readonly [string, string];
  thumbAriaLabelledby?: readonly [string, string];
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

type ThumbIndex = 0 | 1;

export function RangeSlider({
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
  minDistance,
  marks,
  formatValue,
  thumbAriaLabels,
  thumbAriaLabelledby,
  'aria-label': groupAriaLabel,
  'aria-labelledby': groupAriaLabelledby,
  ...rest
}: RangeSliderProps) {
  const gap = minDistance ?? step;

  const [internal, setInternal] = useControllableState<RangeSliderValue>({
    value,
    defaultValue: defaultValue ?? [min, max],
    onChange: (next) => onValueChange?.([next[0], next[1]]),
  });
  const raw = internal ?? [min, max];
  const a = roundToStep(raw[0], step, min, max);
  const b = roundToStep(raw[1], step, min, max);
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const current: RangeSliderValue = [lo, hi];

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([null, null]);
  const activeIndexRef = useRef<ThumbIndex>(0);

  const setIndex = useCallback(
    (index: ThumbIndex, next: number) => {
      const stepped = roundToStep(next, step, min, max);
      setInternal((prev) => {
        const cur = prev ?? [min, max];
        const other = cur[index === 0 ? 1 : 0];
        let constrained: number;
        if (index === 0) {
          constrained = clamp(stepped, min, other - gap);
        } else {
          constrained = clamp(stepped, other + gap, max);
        }
        return index === 0 ? [constrained, other] : [other, constrained];
      });
    },
    [setInternal, step, min, max, gap],
  );

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

  const drag = useDrag({
    enabled: !disabled,
    onMove: (delta) => {
      const next = valueFromEvent(delta.x, delta.y);
      if (next === null) return;
      setIndex(activeIndexRef.current, next);
    },
    onEnd: () => {
      onValueCommit?.([lo, hi]);
    },
  });

  const closestIndex = (target: number): ThumbIndex => {
    const dLo = Math.abs(target - lo);
    const dHi = Math.abs(target - hi);
    if (dLo === dHi) {
      // Bias toward the upper thumb when ties occur on the right half.
      return target > (lo + hi) / 2 ? 1 : 0;
    }
    return dLo < dHi ? 0 : 1;
  };

  const onTrackPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.button !== undefined && e.button !== 0) return;
    const next = valueFromEvent(e.clientX, e.clientY);
    if (next === null) return;
    const index = closestIndex(next);
    activeIndexRef.current = index;
    setIndex(index, next);
    thumbRefs.current[index]?.focus();
    drag.onPointerDown(e);
  };

  const handleThumbKey = (index: ThumbIndex) => (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const big = step * 10;
    const dir = invert ? -1 : 1;
    const cur = current[index];
    let next: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
        next = cur + (orientation === 'horizontal' ? dir : 1) * (e.shiftKey ? big : step);
        break;
      case 'ArrowLeft':
        next = cur - (orientation === 'horizontal' ? dir : 1) * (e.shiftKey ? big : step);
        break;
      case 'ArrowUp':
        next = cur + (orientation === 'vertical' ? dir : 1) * (e.shiftKey ? big : step);
        break;
      case 'ArrowDown':
        next = cur - (orientation === 'vertical' ? dir : 1) * (e.shiftKey ? big : step);
        break;
      case 'PageUp':
        next = cur + big;
        break;
      case 'PageDown':
        next = cur - big;
        break;
      case 'Home':
        next = index === 0 ? min : current[0] + gap;
        break;
      case 'End':
        next = index === 1 ? max : current[1] - gap;
        break;
      default:
        return;
    }

    e.preventDefault();
    setIndex(index, next);
  };

  const onThumbPointerDown = (index: ThumbIndex) => (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.stopPropagation();
    activeIndexRef.current = index;
    thumbRefs.current[index]?.focus();
    drag.onPointerDown(e);
  };

  const onBlur = () => {
    if (!drag.isDragging) {
      onValueCommit?.([lo, hi]);
    }
  };

  const isHorizontal = orientation === 'horizontal';
  const rLo = ratioFromValue(lo, min, max, invert);
  const rHi = ratioFromValue(hi, min, max, invert);
  const rangeStart = Math.min(rLo, rHi);
  const rangeEnd = Math.max(rLo, rHi);

  const filledStyle: CSSProperties = isHorizontal
    ? { left: `${rangeStart * 100}%`, right: `${(1 - rangeEnd) * 100}%` }
    : { top: `${(1 - rangeEnd) * 100}%`, bottom: `${rangeStart * 100}%` };

  const renderThumb = (index: ThumbIndex) => {
    const v = current[index];
    const r = ratioFromValue(v, min, max, invert);
    const style: CSSProperties = isHorizontal
      ? { left: `${r * 100}%` }
      : { top: `${(1 - r) * 100}%` };
    const thumbLabel = thumbAriaLabels?.[index];
    const thumbLabelledby = thumbAriaLabelledby?.[index];
    const valueText = formatValue !== undefined ? formatValue(v) : undefined;
    return (
      <SliderThumb
        ref={(el) => {
          thumbRefs.current[index] = el;
        }}
        orientation={orientation}
        disabled={disabled}
        style={style}
        onPointerDown={onThumbPointerDown(index)}
        onKeyDown={handleThumbKey(index)}
        onBlur={onBlur}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={thumbLabel}
        aria-labelledby={thumbLabelledby}
        aria-orientation={orientation}
        aria-valuemin={index === 0 ? min : current[0] + gap}
        aria-valuemax={index === 1 ? max : current[1] - gap}
        aria-valuenow={v}
        aria-valuetext={valueText}
        aria-disabled={disabled ? true : undefined}
      />
    );
  };

  return (
    <SliderRoot
      ref={ref}
      className={className}
      orientation={orientation}
      disabled={disabled}
      role="group"
      aria-label={groupAriaLabel}
      aria-labelledby={groupAriaLabelledby}
      aria-disabled={disabled ? true : undefined}
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
          <RangeMarks marks={marks} min={min} max={max} invert={invert} orientation={orientation} />
        ) : null}
        {renderThumb(0)}
        {renderThumb(1)}
      </SliderTrack>
      {marks !== undefined ? (
        <RangeMarkLabels marks={marks} min={min} max={max} invert={invert} orientation={orientation} />
      ) : null}
    </SliderRoot>
  );
}

interface MarksProps {
  marks: ReadonlyArray<SliderMark>;
  min: number;
  max: number;
  invert: boolean;
  orientation: SliderOrientation;
}

function RangeMarks({ marks, min, max, invert, orientation }: MarksProps) {
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

function RangeMarkLabels({ marks, min, max, invert, orientation }: MarksProps) {
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
            className={cn('absolute -translate-x-1/2', orientation === 'vertical' && '-translate-y-1/2')}
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
