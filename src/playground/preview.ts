import type { ReactNode } from 'react';
import type { PlaygroundEntry, PropValues } from './types';

/*
 * Translates raw playground values into props ready to spread onto the
 * component. For most kinds this is a passthrough, but two cases need work:
 *
 *  - kind === 'jsx': the value is a literal source string. We can't eval JSX
 *    safely in-browser, so we look the string up in `presets` and substitute
 *    the matching `node`. If the user typed something custom, the prop is
 *    omitted from the preview (the literal still shows in "Copy code").
 *
 *  - kind === 'string' + name === 'children': React renders strings as text
 *    nodes natively, so no transform — but if the value is empty we drop it
 *    so the component's own default renders (Spinner label, etc.).
 *
 * Also drops props whose value equals the schema default — keeps spread
 * clean and lets the component apply its own defaults.
 */

export function resolvePreviewProps(
  entry: PlaygroundEntry,
  values: PropValues,
): {
  props: Record<string, unknown>;
  childrenNode: ReactNode | undefined;
} {
  const props: Record<string, unknown> = {};
  let childrenNode: ReactNode | undefined;

  for (const [name, schema] of Object.entries(entry.propSchemas)) {
    const value = values[name];
    if (value === undefined) continue;
    // Empty strings + defaults: skip so the component's defaultProps kick in.
    if (schema.kind === 'string' && value === '' && schema.default !== '') continue;

    if (schema.kind === 'jsx' && typeof value === 'string') {
      const preset = schema.presets?.find((p) => p.value === value);
      if (preset === undefined) {
        // Free-text JSX can't be safely evaluated. Show nothing live; the
        // literal source is still in the generated code.
        if (name === 'children') childrenNode = undefined;
        continue;
      }
      if (name === 'children') {
        childrenNode = preset.node;
      } else {
        props[name] = preset.node;
      }
      continue;
    }

    if (name === 'children' && schema.kind === 'string' && typeof value === 'string') {
      childrenNode = value;
      continue;
    }

    props[name] = value;
  }

  if (childrenNode === undefined && entry.children !== undefined) {
    childrenNode = entry.children;
  }

  return { props, childrenNode };
}

export function defaultValuesFor(entry: PlaygroundEntry): PropValues {
  const out: PropValues = {};
  for (const [name, schema] of Object.entries(entry.propSchemas)) {
    if (schema.default !== undefined) out[name] = schema.default;
  }
  return out;
}
