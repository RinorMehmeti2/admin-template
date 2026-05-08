import { useCallback, type Ref, type RefCallback } from 'react';

type AnyRef<T> = Ref<T> | undefined | null;

export function useMergedRefs<T>(...refs: Array<AnyRef<T>>): RefCallback<T> {
  return useCallback(
    (value: T | null) => {
      for (const ref of refs) {
        if (ref === null || ref === undefined) continue;
        if (typeof ref === 'function') {
          ref(value);
        } else {
          (ref as { current: T | null }).current = value;
        }
      }
    },
    // refs identity may change every render; merge each call
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}
