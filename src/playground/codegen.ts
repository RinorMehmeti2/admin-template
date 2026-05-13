import {
  STYLE_OVERLAY_KEY,
  type PlaygroundEntry,
  type PropSchema,
  type PropValues,
  type StyleOverlayValues,
} from './types';
import { overlayToClassAttr, overlayToStyleAttr } from './styleOverlayResolve';
import { filterByProfile } from './profile';

/*
 * Code generation for the playground "Copy code" button.
 *
 * Renders props in registry order. Skips values equal to the schema default
 * to keep the output minimal — the common case is "show me only what I
 * changed". `children` (whether string text or jsx literal) is emitted as the
 * element body, not as an attribute.
 *
 * Output is plain JSX text — not formatted via prettier. Long prop lists
 * wrap onto separate lines.
 *
 * Style-overlay: `__style` values are filtered through the entry's
 * `styleProfile` so disabled sections never leak into the generated code.
 * What remains becomes a `style={{...}}` attribute and a `className="..."`
 * attribute appended after schema-driven props. Box-shadow goes through
 * Tailwind utility classes for theme-token alignment.
 */

function isDefault(schema: PropSchema, value: unknown): boolean {
  if (schema.default === undefined) return value === undefined;
  return value === schema.default;
}

function formatAttr(name: string, schema: PropSchema, value: unknown): string | null {
  if (value === undefined) return null;

  switch (schema.kind) {
    case 'string':
    case 'color': {
      if (typeof value !== 'string') return null;
      if (value === '') return null;
      return `${name}=${JSON.stringify(value)}`;
    }
    case 'enum': {
      if (typeof value !== 'string') return null;
      return `${name}=${JSON.stringify(value)}`;
    }
    case 'number': {
      if (typeof value !== 'number' || Number.isNaN(value)) return null;
      return `${name}={${value}}`;
    }
    case 'boolean': {
      if (value === true) return name;
      if (value === false) return `${name}={false}`;
      return null;
    }
    case 'jsx': {
      if (typeof value !== 'string' || value.trim() === '') return null;
      return `${name}={${value}}`;
    }
  }
}

export function generateCode(entry: PlaygroundEntry, values: PropValues): string {
  const childrenSchema = entry.propSchemas.children;
  const attrs: string[] = [];
  let childrenText: string | null = null;

  for (const [name, schema] of Object.entries(entry.propSchemas)) {
    const value = values[name];
    if (isDefault(schema, value)) continue;

    if (name === 'children') {
      if (schema.kind === 'string' && typeof value === 'string' && value !== '') {
        childrenText = value;
      } else if (schema.kind === 'jsx' && typeof value === 'string' && value.trim() !== '') {
        childrenText = value;
      }
      continue;
    }

    const attr = formatAttr(name, schema, value);
    if (attr !== null) attrs.push(attr);
  }

  // Style overlay attrs (style + className) — filtered by profile so
  // disabled sections never appear in generated JSX.
  const rawOverlay = values[STYLE_OVERLAY_KEY] as StyleOverlayValues | undefined;
  const overlayValues = filterByProfile(rawOverlay, entry.styleProfile);
  const styleAttr = overlayToStyleAttr(overlayValues);
  const classAttr = overlayToClassAttr(overlayValues);
  if (classAttr !== null) attrs.push(classAttr);
  if (styleAttr !== null) attrs.push(styleAttr);

  // If schema has no `children` entry but the registry provided a literal
  // `childrenCode` template (e.g. Card), use that — it's the only way to
  // emit composite child trees.
  if (childrenText === null && entry.childrenCode !== undefined) {
    childrenText = entry.childrenCode;
  }
  // If `children` schema exists but value is the default, still emit the
  // default as body text (otherwise <Button /> with no label looks wrong).
  if (
    childrenText === null &&
    childrenSchema !== undefined &&
    (childrenSchema.kind === 'string' || childrenSchema.kind === 'jsx')
  ) {
    const def = childrenSchema.default;
    if (typeof def === 'string' && def !== '') childrenText = def;
  }

  const open =
    attrs.length === 0
      ? `<${entry.name}`
      : attrs.length <= 2
        ? `<${entry.name} ${attrs.join(' ')}`
        : `<${entry.name}\n  ${attrs.join('\n  ')}\n`;

  if (childrenText === null) {
    return `${open} />`;
  }

  const isMultiline = childrenText.includes('\n');
  if (isMultiline) {
    return `${open}>${childrenText}</${entry.name}>`;
  }
  return `${open}>${childrenText}</${entry.name}>`;
}
