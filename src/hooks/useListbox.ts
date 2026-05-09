import { useCallback, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useId } from '@/hooks/useId';

export interface UseListboxOptions<T> {
  items: ReadonlyArray<T>;
  getItemValue: (item: T) => string;
  selectedValue?: string | ReadonlyArray<string> | undefined;
  onSelect: (item: T) => void;
  multiple?: boolean | undefined;
  /** Generate a stable id for option N. Defaults to `${listboxId}-option-${index}`. */
  getItemId?: ((index: number) => string) | undefined;
}

export interface ListboxItemProps {
  id: string;
  role: 'option';
  'aria-selected': boolean;
  'data-active': boolean;
}

export interface ListboxRootProps {
  role: 'listbox';
  id: string;
  'aria-activedescendant': string | undefined;
}

export interface UseListboxReturn<T> {
  listboxId: string;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  isSelected: (item: T) => boolean;
  toggleSelected: (item: T) => void;
  getItemProps: (index: number) => ListboxItemProps;
  getListboxProps: () => ListboxRootProps;
  onKeyDown: (e: ReactKeyboardEvent) => void;
}

/**
 * Listbox state for the combobox pattern (focus stays on the input;
 * the active option is communicated via aria-activedescendant).
 *
 * Active index can be -1 when there are no items; clamping into the
 * current items range happens lazily on read so callers can shrink/grow
 * `items` without resetting state.
 */
export function useListbox<T>({
  items,
  getItemValue,
  selectedValue,
  onSelect,
  multiple = false,
  getItemId,
}: UseListboxOptions<T>): UseListboxReturn<T> {
  const listboxId = useId('listbox');
  const [rawActive, setRawActive] = useState(0);

  const activeIndex = items.length === 0 ? -1 : Math.min(Math.max(rawActive, 0), items.length - 1);

  const setActiveIndex = useCallback((i: number) => setRawActive(i), []);

  const isSelected = useCallback(
    (item: T) => {
      const value = getItemValue(item);
      if (multiple) {
        if (!Array.isArray(selectedValue)) return false;
        return selectedValue.includes(value);
      }
      return value === selectedValue;
    },
    [getItemValue, multiple, selectedValue],
  );

  const toggleSelected = useCallback(
    (item: T) => {
      onSelect(item);
    },
    [onSelect],
  );

  const idForIndex = useCallback(
    (index: number) =>
      getItemId !== undefined ? getItemId(index) : `${listboxId}-option-${index}`,
    [getItemId, listboxId],
  );

  const getItemProps = useCallback(
    (index: number): ListboxItemProps => {
      const item = items[index];
      const selected = item !== undefined ? isSelected(item) : false;
      return {
        id: idForIndex(index),
        role: 'option',
        'aria-selected': selected,
        'data-active': index === activeIndex,
      };
    },
    [items, isSelected, idForIndex, activeIndex],
  );

  const getListboxProps = useCallback(
    (): ListboxRootProps => ({
      role: 'listbox',
      id: listboxId,
      'aria-activedescendant': activeIndex >= 0 ? idForIndex(activeIndex) : undefined,
    }),
    [listboxId, activeIndex, idForIndex],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (items.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setRawActive((i) => {
          const next = i + 1;
          return next >= items.length ? 0 : next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setRawActive((i) => {
          const next = i - 1;
          return next < 0 ? items.length - 1 : next;
        });
      } else if (e.key === 'Home') {
        e.preventDefault();
        setRawActive(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setRawActive(items.length - 1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        const item = items[activeIndex];
        if (item === undefined) return;
        e.preventDefault();
        toggleSelected(item);
      }
    },
    [items, activeIndex, toggleSelected],
  );

  return {
    listboxId,
    activeIndex,
    setActiveIndex,
    isSelected,
    toggleSelected,
    getItemProps,
    getListboxProps,
    onKeyDown,
  };
}
