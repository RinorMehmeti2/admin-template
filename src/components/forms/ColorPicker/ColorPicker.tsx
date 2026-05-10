import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Portal } from '@/components/overlays/Portal';
import { Input } from '@/components/forms/Input';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useDrag } from '@/hooks/useDrag';
import { useId } from '@/hooks/useId';
import { usePosition } from '@/hooks/usePosition';
import { useControllableState } from '@/hooks/useControllableState';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';
import {
  BLACK,
  clampHsva,
  formatColor,
  hsvToRgb,
  hsvaToRgba,
  parseColor,
  withinHueRange,
  type ColorFormat,
  type HSVA,
} from './colorUtils';

export interface ColorPickerProps {
  ref?: Ref<HTMLDivElement>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  format?: ColorFormat;
  withAlpha?: boolean;
  disabled?: boolean;
  presets?: ReadonlyArray<string>;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

function rgbString(c: HSVA): string {
  const { r, g, b } = hsvToRgb(c.h, c.s, c.v);
  return `rgb(${r}, ${g}, ${b})`;
}
function rgbaString(c: HSVA): string {
  const { r, g, b } = hsvToRgb(c.h, c.s, c.v);
  return `rgba(${r}, ${g}, ${b}, ${c.a})`;
}
function hueString(h: number): string {
  const { r, g, b } = hsvToRgb(h, 1, 1);
  return `rgb(${r}, ${g}, ${b})`;
}

export function ColorPicker({
  ref,
  value,
  defaultValue,
  onValueChange,
  format: formatProp = 'hex',
  withAlpha = false,
  disabled = false,
  presets,
  placeholder,
  className,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: ColorPickerProps) {
  const generatedId = useId('color');
  const fieldId = id ?? generatedId;
  const aria = useFieldAriaProps({
    id: fieldId,
    'aria-describedby': ariaDescribedBy,
    'aria-labelledby': ariaLabelledBy,
  });

  // Internal canonical state lives as HSVA. External API is a formatted string.
  const initialHsva = useMemo<HSVA>(() => {
    const seed = value ?? defaultValue;
    if (seed === undefined) return BLACK;
    return parseColor(seed) ?? BLACK;
  }, []); // mount only

  const [stored, setStored] = useControllableState<HSVA>({
    defaultValue: initialHsva,
    // We bridge controlled mode manually below to support string input.
  });
  const externalHsva = value !== undefined ? parseColor(value) : null;
  const color = clampHsva(externalHsva ?? stored ?? BLACK);

  const [format, setFormat] = useState<ColorFormat>(formatProp);

  const emit = useCallback(
    (next: HSVA, fmt: ColorFormat) => {
      const out = formatColor(next, fmt, withAlpha);
      onValueChange?.(out);
    },
    [onValueChange, withAlpha],
  );

  const setColor = useCallback(
    (next: HSVA) => {
      const clamped = clampHsva(next);
      if (value === undefined) setStored(clamped);
      emit(clamped, format);
    },
    [setStored, value, emit, format],
  );

  const changeFormat = useCallback(
    (next: ColorFormat) => {
      setFormat(next);
      emit(color, next);
    },
    [emit, color],
  );

  /* ---------- popover ---------- */

  const { isOpen, open, close } = useDisclosure(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEscapeKey(
    () => {
      if (isOpen) {
        close();
        buttonRef.current?.focus();
      }
    },
    { enabled: isOpen },
  );

  useClickOutside(
    [triggerRef, contentRef],
    () => {
      if (isOpen) close();
    },
    { enabled: isOpen },
  );

  const pos = usePosition(triggerRef, contentRef, {
    placement: 'bottom-start',
    offset: 6,
    enabled: isOpen,
  });

  /* ---------- text input ---------- */

  const targetText = useMemo(
    () => formatColor(color, format, withAlpha),
    [color, format, withAlpha],
  );
  const [text, setText] = useState<string>(targetText);
  const [lastSync, setLastSync] = useState<string>(targetText);
  const [focused, setFocused] = useState(false);
  const [shaking, setShaking] = useState(false);
  if (!focused && targetText !== lastSync) {
    setLastSync(targetText);
    setText(targetText);
  }

  const commitText = (raw: string) => {
    const parsed = parseColor(raw);
    if (parsed === null) {
      setShaking(true);
      window.setTimeout(() => setShaking(false), 320);
      setText(targetText);
      return;
    }
    setColor(parsed);
  };

  /* ---------- merged ref ---------- */

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      triggerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref !== null && ref !== undefined) ref.current = node;
    },
    [ref],
  );

  /* ---------- render ---------- */

  const swatchStyle: CSSProperties = {
    backgroundColor: rgbaString(color),
  };

  return (
    <div
      ref={mergedRef}
      className={cn('relative inline-block', className)}
      data-component="color-picker"
    >
      <button
        ref={buttonRef}
        type="button"
        id={aria.id}
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel ?? 'Pick a color'}
        aria-labelledby={aria['aria-labelledby']}
        aria-describedby={aria['aria-describedby']}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1.5 text-sm transition-colors',
          'hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <span
          aria-hidden="true"
          className="inline-block h-5 w-5 rounded border border-border bg-[image:linear-gradient(45deg,_var(--color-surface-muted)_25%,_transparent_25%),linear-gradient(-45deg,_var(--color-surface-muted)_25%,_transparent_25%),linear-gradient(45deg,_transparent_75%,_var(--color-surface-muted)_75%),linear-gradient(-45deg,_transparent_75%,_var(--color-surface-muted)_75%)] bg-[length:8px_8px] bg-[position:0_0,_0_4px,_4px_-4px,_-4px_0]"
        >
          <span className="block h-full w-full rounded-sm" style={swatchStyle} />
        </span>
        <span className="font-mono text-xs text-foreground-muted">
          {placeholder !== undefined && targetText === '' ? placeholder : targetText}
        </span>
      </button>

      {name !== undefined ? (
        <input type="hidden" name={name} value={targetText} readOnly />
      ) : null}

      {isOpen ? (
        <Portal>
          <div
            ref={contentRef}
            role="dialog"
            aria-label="Color picker"
            data-print="hide"
            data-side={pos.placement}
            style={{ position: 'absolute', left: pos.x, top: pos.y }}
            className={cn(
              'z-[60] w-[240px] rounded-md border border-border bg-surface p-3 shadow-lg motion-safe:animate-dialog-in',
              shaking && 'motion-safe:animate-shake',
            )}
          >
            <SVCanvas color={color} disabled={disabled} onChange={setColor} />
            <HueSlider color={color} disabled={disabled} onChange={setColor} />
            {withAlpha ? (
              <AlphaSlider color={color} disabled={disabled} onChange={setColor} />
            ) : null}
            <FormatToggle format={format} onChange={changeFormat} disabled={disabled} />
            <Input
              type="text"
              value={text}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.currentTarget.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                commitText(text);
              }}
              onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitText(text);
                }
              }}
              disabled={disabled}
              aria-label={`Color value (${format})`}
              className="mt-2 font-mono text-xs"
            />
            {presets !== undefined && presets.length > 0 ? (
              <PresetSwatches presets={presets} current={color} onSelect={setColor} />
            ) : null}
          </div>
        </Portal>
      ) : null}
    </div>
  );
}

/* ============================================================== */
/* SV (saturation × value/brightness) canvas                      */
/* ============================================================== */

interface CanvasProps {
  color: HSVA;
  disabled: boolean;
  onChange: (next: HSVA) => void;
}

function SVCanvas({ color, disabled, onChange }: CanvasProps) {
  const ref = useRef<HTMLDivElement>(null);

  const apply = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      if (el === null) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const s = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const v = Math.min(1, Math.max(0, 1 - (clientY - rect.top) / rect.height));
      onChange({ ...color, s, v });
    },
    [color, onChange],
  );

  const drag = useDrag({
    enabled: !disabled,
    onMove: (delta) => apply(delta.x, delta.y),
  });

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.button !== undefined && e.button !== 0) return;
    apply(e.clientX, e.clientY);
    drag.onPointerDown(e);
  };

  const arrowFor = (axis: 's' | 'v') => (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const big = e.shiftKey ? 0.1 : 0.01;
    let next: HSVA = color;
    if (axis === 's') {
      if (e.key === 'ArrowRight') next = { ...color, s: color.s + big };
      else if (e.key === 'ArrowLeft') next = { ...color, s: color.s - big };
      else if (e.key === 'Home') next = { ...color, s: 0 };
      else if (e.key === 'End') next = { ...color, s: 1 };
      else return;
    } else {
      if (e.key === 'ArrowUp') next = { ...color, v: color.v + big };
      else if (e.key === 'ArrowDown') next = { ...color, v: color.v - big };
      else if (e.key === 'PageUp') next = { ...color, v: 1 };
      else if (e.key === 'PageDown') next = { ...color, v: 0 };
      else return;
    }
    e.preventDefault();
    onChange(next);
  };

  const hueBg = hueString(color.h);
  const xPct = color.s * 100;
  const yPct = (1 - color.v) * 100;

  return (
    <div
      role="group"
      aria-label="Saturation and brightness"
      className="relative h-[120px] w-full select-none touch-none rounded-md"
      style={{ backgroundColor: hueBg }}
    >
      <div
        ref={ref}
        onPointerDown={onPointerDown}
        className="absolute inset-0 rounded-md"
        style={{
          backgroundImage:
            'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)), linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))',
        }}
      />
      {/* keyboard sliders — visually invisible, focusable */}
      <div
        role="slider"
        aria-label="Saturation"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(color.s * 100)}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled ? true : undefined}
        onKeyDown={arrowFor('s')}
        className="pointer-events-none absolute inset-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
      />
      <div
        role="slider"
        aria-label="Brightness"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(color.v * 100)}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled ? true : undefined}
        onKeyDown={arrowFor('v')}
        className="pointer-events-none absolute inset-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
      />
      {/* visible thumb (decorative) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
        style={{ left: `${xPct}%`, top: `${yPct}%`, backgroundColor: rgbString(color) }}
      />
    </div>
  );
}

/* ============================================================== */
/* Hue slider                                                     */
/* ============================================================== */

function HueSlider({ color, disabled, onChange }: CanvasProps) {
  const ref = useRef<HTMLDivElement>(null);

  const apply = useCallback(
    (clientX: number) => {
      const el = ref.current;
      if (el === null) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onChange({ ...color, h: withinHueRange(ratio * 360) });
    },
    [color, onChange],
  );

  const drag = useDrag({
    enabled: !disabled,
    onMove: (delta) => apply(delta.x),
  });

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.button !== undefined && e.button !== 0) return;
    apply(e.clientX);
    drag.onPointerDown(e);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const big = e.shiftKey ? 10 : 1;
    let h: number | null = null;
    if (e.key === 'ArrowRight') h = color.h + big;
    else if (e.key === 'ArrowLeft') h = color.h - big;
    else if (e.key === 'Home') h = 0;
    else if (e.key === 'End') h = 360;
    else return;
    e.preventDefault();
    onChange({ ...color, h: withinHueRange(h) });
  };

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      role="slider"
      aria-label="Hue"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(color.h)}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled ? true : undefined}
      className="relative mt-3 h-3 w-full select-none touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
      style={{
        backgroundImage:
          'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))',
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
        style={{ left: `${(color.h / 360) * 100}%`, backgroundColor: hueString(color.h) }}
      />
    </div>
  );
}

/* ============================================================== */
/* Alpha slider                                                   */
/* ============================================================== */

function AlphaSlider({ color, disabled, onChange }: CanvasProps) {
  const ref = useRef<HTMLDivElement>(null);

  const apply = useCallback(
    (clientX: number) => {
      const el = ref.current;
      if (el === null) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      const a = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onChange({ ...color, a });
    },
    [color, onChange],
  );

  const drag = useDrag({
    enabled: !disabled,
    onMove: (delta) => apply(delta.x),
  });

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.button !== undefined && e.button !== 0) return;
    apply(e.clientX);
    drag.onPointerDown(e);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const big = e.shiftKey ? 0.1 : 0.01;
    let a: number | null = null;
    if (e.key === 'ArrowRight') a = color.a + big;
    else if (e.key === 'ArrowLeft') a = color.a - big;
    else if (e.key === 'Home') a = 0;
    else if (e.key === 'End') a = 1;
    else return;
    e.preventDefault();
    onChange({ ...color, a: Math.min(1, Math.max(0, a)) });
  };

  const { r, g, b } = hsvaToRgba(color);
  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      role="slider"
      aria-label="Alpha"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(color.a * 100)}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled ? true : undefined}
      className="relative mt-2 h-3 w-full select-none touch-none rounded-full outline-none bg-[image:linear-gradient(45deg,_var(--color-surface-muted)_25%,_transparent_25%),linear-gradient(-45deg,_var(--color-surface-muted)_25%,_transparent_25%),linear-gradient(45deg,_transparent_75%,_var(--color-surface-muted)_75%),linear-gradient(-45deg,_transparent_75%,_var(--color-surface-muted)_75%)] bg-[length:8px_8px] bg-[position:0_0,_0_4px,_4px_-4px,_-4px_0] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0), rgba(${r}, ${g}, ${b}, 1))`,
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
        style={{
          left: `${color.a * 100}%`,
          backgroundColor: `rgba(${r}, ${g}, ${b}, ${color.a})`,
        }}
      />
    </div>
  );
}

/* ============================================================== */
/* Format toggle                                                  */
/* ============================================================== */

interface FormatToggleProps {
  format: ColorFormat;
  onChange: (next: ColorFormat) => void;
  disabled: boolean;
}

function FormatToggle({ format, onChange, disabled }: FormatToggleProps) {
  const formats: ReadonlyArray<ColorFormat> = ['hex', 'rgb', 'hsl'];
  return (
    <div
      role="radiogroup"
      aria-label="Color format"
      className="mt-3 inline-flex rounded-md border border-border bg-surface p-0.5"
    >
      {formats.map((f) => {
        const isActive = format === f;
        return (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(f)}
            className={cn(
              'min-w-[44px] rounded px-2 py-0.5 text-xs font-medium uppercase transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground-muted hover:bg-surface-muted',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================== */
/* Presets                                                        */
/* ============================================================== */

interface PresetSwatchesProps {
  presets: ReadonlyArray<string>;
  current: HSVA;
  onSelect: (next: HSVA) => void;
}

function PresetSwatches({ presets, current, onSelect }: PresetSwatchesProps) {
  const parsed = useMemo(
    () =>
      presets
        .map((raw) => ({ raw, color: parseColor(raw) }))
        .filter((p): p is { raw: string; color: HSVA } => p.color !== null),
    [presets],
  );

  const currentRgb = hsvaToRgba(current);

  return (
    <div className="mt-3 grid grid-cols-8 gap-1.5" aria-label="Color presets">
      {parsed.map(({ raw, color }) => {
        const rgb = hsvaToRgba(color);
        const isCurrent =
          rgb.r === currentRgb.r &&
          rgb.g === currentRgb.g &&
          rgb.b === currentRgb.b &&
          Math.abs(rgb.a - currentRgb.a) < 0.005;
        return (
          <button
            key={raw}
            type="button"
            onClick={() => onSelect(color)}
            aria-label={`Use color ${raw}`}
            aria-current={isCurrent ? 'true' : undefined}
            className="relative h-5 w-5 rounded border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            style={{ backgroundColor: raw }}
          >
            {isCurrent ? (
              <Check
                aria-hidden="true"
                className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
