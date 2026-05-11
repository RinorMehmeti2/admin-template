import type { ComponentType, ReactNode } from 'react';

/*
 * PropSchema — declarative description of one prop for the playground UI.
 *
 * `kind` decides which control renders. `default` seeds the initial prop value
 * (and the value the "reset" button restores). `options` is required for
 * `enum` and optional for `string` (free text vs. fixed list).
 *
 * `jsx` props don't get a real editor — they're rendered as a textarea of
 * the literal source string and re-emitted unchanged into the generated code.
 * Use `jsxPreview` to substitute a real ReactNode at render time without
 * eval-ing arbitrary JSX in the browser.
 */

export type PropKind = 'string' | 'number' | 'boolean' | 'enum' | 'color' | 'jsx';

export interface BasePropSchema<T> {
  kind: PropKind;
  /** Initial value for the control. Undefined means "no prop emitted". */
  default?: T;
  /** Help text rendered under the control label. */
  description?: string;
}

export interface StringPropSchema extends BasePropSchema<string> {
  kind: 'string';
  /** Render as Textarea instead of single-line Input. */
  multiline?: boolean;
  placeholder?: string;
}

export interface NumberPropSchema extends BasePropSchema<number> {
  kind: 'number';
  min?: number;
  max?: number;
  step?: number;
}

export interface BooleanPropSchema extends BasePropSchema<boolean> {
  kind: 'boolean';
}

export interface EnumPropSchema<V extends string = string> extends BasePropSchema<V> {
  kind: 'enum';
  options: ReadonlyArray<V>;
}

export interface ColorPropSchema extends BasePropSchema<string> {
  kind: 'color';
}

/**
 * Free-form JSX literal. The string is stored as-is and copied into the
 * generated code unchanged; for the live preview, `jsxPreview` (a real
 * ReactNode keyed on the string value) is substituted instead.
 */
export interface JsxPropSchema extends BasePropSchema<string> {
  kind: 'jsx';
  /** Map literal string → ReactNode for the live preview. */
  presets?: ReadonlyArray<{ label: string; value: string; node: ReactNode }>;
}

export type PropSchema =
  | StringPropSchema
  | NumberPropSchema
  | BooleanPropSchema
  | EnumPropSchema
  | ColorPropSchema
  | JsxPropSchema;

export type PropValues = Record<string, unknown>;

export interface PlaygroundEntry {
  /** Display name shown in the list. */
  name: string;
  /** Category bucket (matches the directory). */
  category:
    | 'primitives'
    | 'forms'
    | 'feedback'
    | 'navigation'
    | 'data-display'
    | 'layout'
    | 'overlays';
  /** The component constructor itself. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry is heterogeneous by design; per-entry types are erased.
  component: ComponentType<any>;
  /** Per-prop schema. Order is preserved when rendering controls. */
  propSchemas: Record<string, PropSchema>;
  /** Children rendered inside the component, if it expects any. */
  children?: ReactNode;
  /** Literal `children` source used by the code generator. */
  childrenCode?: string;
  /** Free-text keywords surfaced by the searchable list. */
  keywords?: ReadonlyArray<string>;
}

export type PlaygroundRegistry = ReadonlyArray<PlaygroundEntry>;
