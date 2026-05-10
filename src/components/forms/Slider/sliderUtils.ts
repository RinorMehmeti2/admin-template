export type SliderOrientation = 'horizontal' | 'vertical';

export interface SliderGeometry {
  rect: DOMRect;
  min: number;
  max: number;
  step: number;
  orientation: SliderOrientation;
  invert: boolean;
}

export function clamp(n: number, lo: number, hi: number): number {
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

/**
 * Snap a continuous value to the nearest step boundary anchored at min, then
 * clamp to [min, max]. Floating-point noise is reduced by rounding to the
 * step's effective precision.
 */
export function roundToStep(value: number, step: number, min: number, max: number): number {
  if (step <= 0) return clamp(value, min, max);
  const stepped = min + Math.round((value - min) / step) * step;
  // Clean up FP drift: derive precision from step.
  const decimals = (step.toString().split('.')[1] ?? '').length;
  const factor = Math.pow(10, decimals);
  const cleaned = Math.round(stepped * factor) / factor;
  return clamp(cleaned, min, max);
}

/**
 * Map a pointer position (clientX/clientY) to a slider value, honoring the
 * orientation, invert flag, min/max, and step.
 */
export function valueFromPointer(args: {
  clientX: number;
  clientY: number;
  geometry: SliderGeometry;
}): number {
  const { clientX, clientY, geometry } = args;
  const { rect, min, max, step, orientation, invert } = geometry;
  const range = max - min;
  if (range <= 0) return min;

  let ratio: number;
  if (orientation === 'horizontal') {
    ratio = (clientX - rect.left) / rect.width;
    if (invert) ratio = 1 - ratio;
  } else {
    // Vertical: top = max by default (so increasing values go up).
    ratio = (rect.bottom - clientY) / rect.height;
    if (invert) ratio = 1 - ratio;
  }

  ratio = clamp(ratio, 0, 1);
  return roundToStep(min + ratio * range, step, min, max);
}

/**
 * Inverse of valueFromPointer — what fraction (0..1) along the *visible* axis
 * does this value sit at, after honoring `invert`?
 */
export function ratioFromValue(value: number, min: number, max: number, invert: boolean): number {
  const range = max - min;
  if (range <= 0) return 0;
  const r = clamp((value - min) / range, 0, 1);
  return invert ? 1 - r : r;
}
