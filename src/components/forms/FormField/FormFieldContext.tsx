import { createContext, useContext } from 'react';

/*
 * FormField wires aria attrs onto the wrapped control via React Context
 * (not cloneElement). Trade-off:
 *
 *   - cloneElement is "automatic" but breaks across intermediate wrappers
 *     (e.g. <Controller render={...}>) — cloneElement only patches the
 *     direct child, so the inner Input never receives the injected props.
 *
 *   - Context requires each form primitive to opt in (via useFieldAriaProps),
 *     but it works through ANY nesting: FormField -> Controller -> Input,
 *     FormField -> any custom wrapper -> Input, etc.
 *
 * We picked context. Every primitive in src/components/forms/ calls
 * useFieldAriaProps to merge user-provided id/aria-* with the surrounding
 * FormField's generated ids.
 */

export interface FormFieldContextValue {
  fieldId: string;
  labelId: string | undefined;
  descriptionId: string | undefined;
  errorId: string | undefined;
  hasError: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export function useFormField(): FormFieldContextValue | null {
  return useContext(FormFieldContext);
}

// React's HTMLAttributes types `aria-invalid` as
// `boolean | "true" | "false" | "grammar" | "spelling"`. We accept all of
// those when reading from rest props.
type AriaInvalid = boolean | 'true' | 'false' | 'grammar' | 'spelling';

export interface FieldAriaOverrides {
  id?: string | undefined;
  'aria-describedby'?: string | undefined;
  'aria-invalid'?: AriaInvalid | undefined;
  'aria-labelledby'?: string | undefined;
}

export interface FieldAriaProps {
  id: string | undefined;
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
  'aria-labelledby': string | undefined;
  hasError: boolean;
}

/**
 * Merge consumer-provided aria/id with the surrounding FormField context.
 * - `id`: consumer wins; otherwise the field's generated id.
 * - `aria-describedby`: union of consumer + description + error ids.
 * - `aria-invalid`: true if consumer set it OR `invalidFromVariant` is true
 *    OR the field context says hasError; otherwise undefined (omit attribute).
 * - `hasError`: convenience flag for the caller to also flip styling.
 */
export function useFieldAriaProps(
  overrides: FieldAriaOverrides,
  invalidFromVariant = false,
): FieldAriaProps {
  const ctx = useFormField();

  const id = overrides.id ?? ctx?.fieldId;

  const describedByParts = [
    overrides['aria-describedby'],
    ctx?.descriptionId,
    ctx?.errorId,
  ].filter((s): s is string => typeof s === 'string' && s.length > 0);
  const ariaDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  const explicitInvalid = overrides['aria-invalid'];
  const explicitTrue = explicitInvalid === true || explicitInvalid === 'true';
  const invalid =
    explicitTrue || invalidFromVariant || ctx?.hasError === true ? true : undefined;

  const ariaLabelledBy = overrides['aria-labelledby'] ?? ctx?.labelId;

  return {
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': invalid,
    'aria-labelledby': ariaLabelledBy,
    hasError: ctx?.hasError === true,
  };
}
