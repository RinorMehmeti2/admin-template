export interface HSVA {
  h: number; // 0..360
  s: number; // 0..1
  v: number; // 0..1
  a: number; // 0..1
}

export interface RGBA {
  r: number; // 0..255
  g: number; // 0..255
  b: number; // 0..255
  a: number; // 0..1
}

export interface HSLA {
  h: number; // 0..360
  s: number; // 0..1
  l: number; // 0..1
  a: number; // 0..1
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl';

export const BLACK: HSVA = { h: 0, s: 0, v: 0, a: 1 };

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m = v - c;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r1) h = ((g1 - b1) / d + (g1 < b1 ? 6 : 0)) * 60;
    else if (max === g1) h = ((b1 - r1) / d + 2) * 60;
    else h = ((r1 - g1) / d + 4) * 60;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

export function hsvToHsl(h: number, s: number, v: number): { h: number; s: number; l: number } {
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h, s: sl, l };
}

export function hslToHsv(h: number, s: number, l: number): { h: number; s: number; v: number } {
  const v = l + s * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);
  return { h, s: sv, v };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hsv = hslToHsv(h, s, l);
  return hsvToRgb(hsv.h, hsv.s, hsv.v);
}

export function hsvaToRgba(c: HSVA): RGBA {
  const { r, g, b } = hsvToRgb(c.h, c.s, c.v);
  return { r, g, b, a: c.a };
}

export function rgbaToHsva(c: RGBA): HSVA {
  const { h, s, v } = rgbToHsv(c.r, c.g, c.b);
  return { h, s, v, a: c.a };
}

export function hsvaToHsla(c: HSVA): HSLA {
  const { h, s, l } = hsvToHsl(c.h, c.s, c.v);
  return { h, s, l, a: c.a };
}

export function hslaToHsva(c: HSLA): HSVA {
  const { h, s, v } = hslToHsv(c.h, c.s, c.l);
  return { h, s, v, a: c.a };
}

/* ---------- Formatting ---------- */

function pad2(n: number): string {
  const s = n.toString(16);
  return s.length === 1 ? '0' + s : s;
}

export function formatHex({ r, g, b, a }: RGBA, includeAlpha: boolean): string {
  const base = `#${pad2(r)}${pad2(g)}${pad2(b)}`;
  if (!includeAlpha || a >= 1) return base;
  return base + pad2(Math.round(a * 255));
}

export function formatRgb(c: RGBA, includeAlpha: boolean): string {
  if (!includeAlpha || c.a >= 1) return `rgb(${c.r}, ${c.g}, ${c.b})`;
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${roundAlpha(c.a)})`;
}

export function formatHsl(c: HSLA, includeAlpha: boolean): string {
  const h = Math.round(c.h);
  const s = Math.round(c.s * 100);
  const l = Math.round(c.l * 100);
  if (!includeAlpha || c.a >= 1) return `hsl(${h}, ${s}%, ${l}%)`;
  return `hsla(${h}, ${s}%, ${l}%, ${roundAlpha(c.a)})`;
}

function roundAlpha(a: number): string {
  return (Math.round(a * 100) / 100).toString();
}

export function formatColor(color: HSVA, format: ColorFormat, withAlpha: boolean): string {
  const rgba = hsvaToRgba(color);
  if (format === 'hex') return formatHex(rgba, withAlpha);
  if (format === 'rgb') return formatRgb(rgba, withAlpha);
  return formatHsl(hsvaToHsla(color), withAlpha);
}

/* ---------- Parsing ---------- */

const HEX_RE = /^#?([0-9a-fA-F]{3,8})$/;
const RGB_RE =
  /^rgba?\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*(?:,\s*(-?\d+(?:\.\d+)?)\s*)?\)$/i;
const HSL_RE =
  /^hsla?\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*(?:,\s*(-?\d+(?:\.\d+)?)\s*)?\)$/i;

export function parseColor(input: string): HSVA | null {
  const raw = input.trim();
  if (raw === '') return null;

  const hex = raw.match(HEX_RE);
  if (hex !== null) return parseHex(hex[1]!);

  const rgb = raw.match(RGB_RE);
  if (rgb !== null) {
    const r = clampByte(Number(rgb[1]));
    const g = clampByte(Number(rgb[2]));
    const b = clampByte(Number(rgb[3]));
    const a = rgb[4] !== undefined ? clamp01(Number(rgb[4])) : 1;
    return rgbaToHsva({ r, g, b, a });
  }

  const hsl = raw.match(HSL_RE);
  if (hsl !== null) {
    const h = ((Number(hsl[1]) % 360) + 360) % 360;
    const s = clamp01(Number(hsl[2]) / 100);
    const l = clamp01(Number(hsl[3]) / 100);
    const a = hsl[4] !== undefined ? clamp01(Number(hsl[4])) : 1;
    return hslaToHsva({ h, s, l, a });
  }

  return null;
}

function parseHex(body: string): HSVA | null {
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 1;
  if (body.length === 3) {
    r = parseInt(body[0]! + body[0]!, 16);
    g = parseInt(body[1]! + body[1]!, 16);
    b = parseInt(body[2]! + body[2]!, 16);
  } else if (body.length === 4) {
    r = parseInt(body[0]! + body[0]!, 16);
    g = parseInt(body[1]! + body[1]!, 16);
    b = parseInt(body[2]! + body[2]!, 16);
    a = parseInt(body[3]! + body[3]!, 16) / 255;
  } else if (body.length === 6) {
    r = parseInt(body.slice(0, 2), 16);
    g = parseInt(body.slice(2, 4), 16);
    b = parseInt(body.slice(4, 6), 16);
  } else if (body.length === 8) {
    r = parseInt(body.slice(0, 2), 16);
    g = parseInt(body.slice(2, 4), 16);
    b = parseInt(body.slice(4, 6), 16);
    a = parseInt(body.slice(6, 8), 16) / 255;
  } else {
    return null;
  }
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)) return null;
  return rgbaToHsva({ r, g, b, a });
}

function clampByte(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(255, Math.max(0, Math.round(n)));
}

/* ---------- Helpers ---------- */

export function withinHueRange(h: number): number {
  return ((h % 360) + 360) % 360;
}

export function clampHsva(c: HSVA): HSVA {
  return {
    h: withinHueRange(c.h),
    s: clamp01(c.s),
    v: clamp01(c.v),
    a: clamp01(c.a),
  };
}

/** Equality on the user-visible bytes; tolerant of HSV<->RGB rounding. */
export function colorsEqual(a: HSVA, b: HSVA): boolean {
  const ra = hsvaToRgba(a);
  const rb = hsvaToRgba(b);
  return ra.r === rb.r && ra.g === rb.g && ra.b === rb.b && Math.abs(ra.a - rb.a) < 0.005;
}
