import { useMemo, type Ref, type RefCallback } from 'react';

type AnyRef<T> = Ref<T> | undefined | null;

function assign<T>(ref: AnyRef<T>, value: T | null): void {
  if (ref === null || ref === undefined) return;
  if (typeof ref === 'function') {
    ref(value);
    return;
  }
  // RefObject<T>.current is mutable at runtime by design; the readonly flag in
  // some type defs is a TS-only concern.
  (ref as { current: T | null }).current = value;
}

export function useMergedRefs<T>(...refs: Array<AnyRef<T>>): RefCallback<T> {
  // Memoize against each individual ref so the callback identity changes only
  // when the ref set changes. useMemo accepts a dynamic dep array; useCallback
  // does not (per react-hooks/use-memo).
  return useMemo<RefCallback<T>>(
    () => (value: T | null) => {
      for (const ref of refs) assign(ref, value);
    },
    // eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
    refs,
  );
}
