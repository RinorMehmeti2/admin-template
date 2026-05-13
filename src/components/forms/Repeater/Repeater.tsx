import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useId } from 'react';
import { cn } from '@/lib/cn';
import { useControllableState } from '@/hooks/useControllableState';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import type { RepeaterProps, RepeaterRenderArgs } from './Repeater.types';

export function Repeater<T>({
  ref,
  items,
  defaultItems,
  onChange,
  createItem,
  keyFor,
  renderItem,
  label,
  description,
  error,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  addLabel = 'Add row',
  reorderable = true,
  removable = true,
  addable = true,
  emptyState,
  variant = 'separated',
  className,
  ...rest
}: RepeaterProps<T>) {
  const [value, setValue] = useControllableState<T[]>({
    value: items,
    defaultValue: defaultItems ?? [],
    onChange,
  });
  const list = value ?? [];

  /*
   * Stable per-row keys via index. `updateAt` mutates row at a specific index
   * with `{ ...current, ...patch }` — the item reference changes but the
   * index stays. Index-as-key means React reuses the same <li> across
   * keystrokes, so the focused Input is not unmounted and focus is preserved.
   *
   * Tradeoff: removing or reordering rows shifts the content within rows
   * (since keys 0..N now point to different items), but rows stay mounted —
   * focus is preserved across those operations too. Callers that need
   * identity-stable keys through reorder can pass `keyFor` explicitly.
   */
  const getKey = useCallback(
    (item: T, index: number): string => {
      if (keyFor !== undefined) return keyFor(item, index);
      return `i-${index}`;
    },
    [keyFor],
  );

  // Backfill to min on mount + when min increases.
  useEffect(() => {
    if (list.length < min) {
      const fillers = Array.from({ length: min - list.length }, () => createItem());
      setValue([...list, ...fillers]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min]);

  const add = useCallback(() => {
    setValue((prev) => {
      const arr = prev ?? [];
      if (arr.length >= max) return arr;
      return [...arr, createItem()];
    });
  }, [createItem, max, setValue]);

  const removeAt = useCallback(
    (index: number) => {
      setValue((prev) => {
        const arr = prev ?? [];
        if (arr.length <= min) return arr;
        return arr.filter((_, i) => i !== index);
      });
    },
    [min, setValue],
  );

  const moveBy = useCallback(
    (index: number, delta: number) => {
      setValue((prev) => {
        const arr = (prev ?? []).slice();
        const target = index + delta;
        if (target < 0 || target >= arr.length) return arr;
        const [removed] = arr.splice(index, 1);
        if (removed === undefined) return arr;
        arr.splice(target, 0, removed);
        return arr;
      });
    },
    [setValue],
  );

  const updateAt = useCallback(
    (index: number, patch: Partial<T> | T) => {
      setValue((prev) => {
        const arr = (prev ?? []).slice();
        const current = arr[index];
        if (current === undefined) return arr;
        if (current !== null && typeof current === 'object' && !Array.isArray(current)) {
          arr[index] = { ...(current as object), ...(patch as object) } as T;
        } else {
          arr[index] = patch as T;
        }
        return arr;
      });
    },
    [setValue],
  );

  const generatedId = useId();
  const labelId = label !== undefined ? `repeater-${generatedId}` : undefined;

  const isAtMax = list.length >= max;

  return (
    <div ref={ref} className={cn(className)} {...rest}>
      {label !== undefined ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p id={labelId} className="text-sm font-medium text-foreground">
              {label}
            </p>
            {description !== undefined ? (
              <p className="text-xs text-foreground-muted">{description}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <ul
        aria-labelledby={labelId}
        className={cn(
          'm-0 list-none p-0',
          variant === 'separated' && 'space-y-2',
          variant === 'stacked' &&
            'rounded-lg border border-border divide-y divide-border bg-surface',
        )}
      >
        {list.length === 0 && emptyState !== undefined ? (
          <li className="m-0 p-0">{emptyState}</li>
        ) : null}
        {list.map((item, index) => {
          const args: RepeaterRenderArgs<T> = {
            item,
            index,
            remove: () => removeAt(index),
            move: (delta) => moveBy(index, delta),
            update: (patch) => updateAt(index, patch),
            isOnly: list.length === 1,
            isFirst: index === 0,
            isLast: index === list.length - 1,
          };
          const k = getKey(item, index);
          return (
            <li
              key={k}
              className={cn(
                'flex items-start gap-2',
                variant === 'separated' && 'rounded-md border border-border bg-surface p-3',
                variant === 'stacked' && 'p-3',
              )}
            >
              <div className="min-w-0 flex-1">{renderItem(args)}</div>
              <div className="flex shrink-0 items-center gap-1 pt-1">
                {reorderable ? (
                  <>
                    <IconButton
                      type="button"
                      aria-label={`Move row ${index + 1} up`}
                      variant="ghost"
                      size="sm"
                      onClick={() => moveBy(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      type="button"
                      aria-label={`Move row ${index + 1} down`}
                      variant="ghost"
                      size="sm"
                      onClick={() => moveBy(index, 1)}
                      disabled={index === list.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </IconButton>
                  </>
                ) : null}
                {removable ? (
                  <IconButton
                    type="button"
                    aria-label={`Remove row ${index + 1}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAt(index)}
                    disabled={list.length <= min}
                    className="text-foreground-muted hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {addable ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          disabled={isAtMax}
          leftIcon={<Plus className="h-4 w-4" />}
          className="mt-5"
        >
          {addLabel}
        </Button>
      ) : null}

      {error !== undefined && error !== null && error !== false ? (
        <p role="alert" className="mt-3 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
