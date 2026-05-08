import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useControllableState } from '@/hooks/useControllableState';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';

/*
 * Keyboard navigation for radios uses NATIVE browser behavior — sibling
 * radios with the same `name` automatically share a single tab stop, and
 * Arrow keys move focus + selection between them. We deliberately do NOT
 * layer useRovingFocus on top, because:
 *
 *   1. The native behavior is already what we want.
 *   2. Adding useRovingFocus would either duplicate the arrow handling
 *      (double-firing) or require us to e.preventDefault() and re-implement
 *      everything the browser already does correctly, including
 *      screen-reader announcements on focus change.
 *
 * useRovingFocus IS used by Menu / Tabs / DropdownMenu where there's no
 * native equivalent. Calling that out so future readers don't "fix" this
 * to match the spec.
 */

export interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  disabled: boolean;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroup(): RadioGroupContextValue | null {
  return useContext(RadioGroupContext);
}

export interface RadioGroupProps {
  name: string;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  children: ReactNode;
  className?: string;
  id?: string | undefined;
  'aria-label'?: string | undefined;
  'aria-labelledby'?: string | undefined;
  'aria-describedby'?: string | undefined;
}

export function RadioGroup({
  name,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  orientation = 'vertical',
  children,
  className,
  id,
  ...ariaProps
}: RadioGroupProps) {
  const [val, setVal] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const aria = useFieldAriaProps({
    id,
    'aria-describedby': ariaProps['aria-describedby'],
    'aria-labelledby': ariaProps['aria-labelledby'],
  });

  const ctx = useMemo<RadioGroupContextValue>(
    () => ({
      name,
      value: val,
      onValueChange: (next: string) => setVal(next),
      disabled,
    }),
    [name, val, setVal, disabled],
  );

  return (
    <RadioGroupContext.Provider value={ctx}>
      <div
        role="radiogroup"
        id={aria.id}
        aria-label={ariaProps['aria-label']}
        aria-labelledby={aria['aria-labelledby']}
        aria-describedby={aria['aria-describedby']}
        aria-disabled={disabled || undefined}
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col gap-2' : 'flex-wrap gap-x-4 gap-y-2',
          className,
        )}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
