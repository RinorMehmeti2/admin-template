import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseControllableStateOptions<T> {
  value?: T | undefined;
  defaultValue?: T | undefined;
  onChange?: ((value: T) => void) | undefined;
}

export type SetControllableState<T> = (next: T | ((prev: T | undefined) => T)) => void;

export function useControllableState<T>(
  options: UseControllableStateOptions<T>,
): [T | undefined, SetControllableState<T>] {
  const { value, defaultValue, onChange } = options;
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<T | undefined>(defaultValue);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const state = isControlled ? value : uncontrolled;

  const setState = useCallback<SetControllableState<T>>(
    (next) => {
      const resolve = (prev: T | undefined): T =>
        typeof next === 'function' ? (next as (p: T | undefined) => T)(prev) : next;

      if (isControlled) {
        const resolved = resolve(value);
        onChangeRef.current?.(resolved);
      } else {
        setUncontrolled((prev) => {
          const resolved = resolve(prev);
          onChangeRef.current?.(resolved);
          return resolved;
        });
      }
    },
    [isControlled, value],
  );

  return [state, setState];
}
