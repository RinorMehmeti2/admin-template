import type { CSSProperties } from 'react';
import type { StyleOverlayValues } from './types';

/*
 * Translates StyleOverlayValues → { style, className }.
 *
 * Box-shadow uses Tailwind utility classes (so the value tracks the active
 * theme tokens). Everything else maps to plain inline CSSProperties.
 */

const SHADOW_CLASS: Record<NonNullable<StyleOverlayValues['boxShadow']>, string> = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
};

export interface ResolvedOverlay {
  style: CSSProperties;
  className: string;
}

export function resolveOverlay(values: StyleOverlayValues | undefined): ResolvedOverlay {
  if (values === undefined) return { style: {}, className: '' };
  const style: CSSProperties = {};
  const classes: string[] = [];

  if (values.paddingTop !== undefined) style.paddingTop = values.paddingTop;
  if (values.paddingRight !== undefined) style.paddingRight = values.paddingRight;
  if (values.paddingBottom !== undefined) style.paddingBottom = values.paddingBottom;
  if (values.paddingLeft !== undefined) style.paddingLeft = values.paddingLeft;

  if (values.marginTop !== undefined) style.marginTop = values.marginTop;
  if (values.marginRight !== undefined) style.marginRight = values.marginRight;
  if (values.marginBottom !== undefined) style.marginBottom = values.marginBottom;
  if (values.marginLeft !== undefined) style.marginLeft = values.marginLeft;

  const hasBorderWidth = values.borderWidth !== undefined && values.borderWidth > 0;
  if (hasBorderWidth) style.borderWidth = values.borderWidth;
  if (values.borderStyle !== undefined) style.borderStyle = values.borderStyle;
  if (values.borderColor !== undefined) style.borderColor = values.borderColor;
  if (values.borderRadius !== undefined) style.borderRadius = values.borderRadius;

  if (values.backgroundColor !== undefined) style.backgroundColor = values.backgroundColor;
  if (values.color !== undefined) style.color = values.color;
  if (values.opacity !== undefined) style.opacity = values.opacity;

  if (values.width !== undefined) style.width = values.width;
  if (values.height !== undefined) style.height = values.height;
  if (values.minWidth !== undefined) style.minWidth = values.minWidth;
  if (values.maxWidth !== undefined) style.maxWidth = values.maxWidth;

  if (values.fontSize !== undefined) style.fontSize = values.fontSize;
  if (values.fontWeight !== undefined) style.fontWeight = Number(values.fontWeight);
  if (values.letterSpacing !== undefined) style.letterSpacing = values.letterSpacing;

  if (values.boxShadow !== undefined) classes.push(SHADOW_CLASS[values.boxShadow]);
  if (values.className !== undefined && values.className.trim() !== '') {
    classes.push(values.className.trim());
  }

  return { style, className: classes.join(' ') };
}

/**
 * Render the overlay as a JSX `style={{...}}` attribute string for codegen.
 * Returns null when nothing to emit.
 */
export function overlayToStyleAttr(values: StyleOverlayValues | undefined): string | null {
  const { style } = resolveOverlay(values);
  const entries = Object.entries(style);
  if (entries.length === 0) return null;
  const inner = entries
    .map(([k, v]) => {
      if (typeof v === 'number') return `${k}: ${v}`;
      return `${k}: ${JSON.stringify(v)}`;
    })
    .join(', ');
  return `style={{ ${inner} }}`;
}

/**
 * Render the overlay as a JSX `className="..."` attribute string for codegen.
 * Includes shadow class + custom className. Returns null when empty.
 */
export function overlayToClassAttr(values: StyleOverlayValues | undefined): string | null {
  const { className } = resolveOverlay(values);
  if (className === '') return null;
  return `className=${JSON.stringify(className)}`;
}
