// react-hooks/refs flags every ref read during render, including reads of
// non-current properties on objects that *contain* a ref. Our refs (tagsRef,
// chipRefs, popoverRef, etc.) are written either inside ref callbacks or
// effects; the genuine "read .current during render" path is intentionally
// avoided. Disable file-wide to silence the false positives — same pattern as
// src/components/forms/Combobox/Combobox.tsx.
/* eslint-disable react-hooks/refs */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent as ReactClipboardEvent,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type LabelHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { Loader2, X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { useControllableState } from '@/hooks/useControllableState';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { useListbox } from '@/hooks/useListbox';
import { usePosition } from '@/hooks/usePosition';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';
import { Portal } from '@/components/overlays/Portal';

const shellStyles = cva(
  'flex w-full min-h-10 cursor-text flex-wrap items-center gap-1 rounded-md border bg-surface px-2 py-1 text-sm transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-background',
  {
    variants: {
      variant: {
        default: 'border-border focus-within:ring-ring',
        error: 'border-danger focus-within:ring-danger',
      },
      inputSize: {
        sm: 'min-h-8 text-xs',
        md: 'min-h-10 text-sm',
        lg: 'min-h-12 text-base',
      },
    },
    defaultVariants: { variant: 'default', inputSize: 'md' },
  },
);

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const DEFAULT_SEPARATORS: ReadonlyArray<string> = [',', 'Enter', 'Tab'];

const defaultFilterSuggestions = <T,>(
  item: T,
  query: string,
  getLabel: (i: T) => string,
): boolean => {
  if (query === '') return true;
  return getLabel(item).toLowerCase().includes(query.toLowerCase());
};

export interface TagInputProps<T = string>
  extends Omit<
      LabelHTMLAttributes<HTMLLabelElement>,
      'defaultValue' | 'onChange' | 'children' | 'onInvalid' | 'htmlFor'
    >,
    VariantProps<typeof shellStyles> {
  ref?: Ref<HTMLLabelElement>;

  value?: ReadonlyArray<T>;
  defaultValue?: ReadonlyArray<T>;
  onValueChange?: (value: T[]) => void;

  validate?: (raw: string) => T | null;
  parseOnPaste?: (text: string) => T[];
  separators?: ReadonlyArray<string>;

  maxTags?: number;
  allowDuplicates?: boolean;

  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;

  getTagLabel?: (tag: T) => string;
  getTagKey?: (tag: T) => string;
  renderTag?: (
    tag: T,
    props: { onRemove: () => void; isFocused: boolean; index: number; disabled: boolean },
  ) => ReactNode;

  suggestions?: ReadonlyArray<T>;
  filterSuggestions?: (item: T, query: string) => boolean;
  suggestionsLoading?: boolean;
  renderSuggestion?: (item: T) => ReactNode;
  suggestionsEmptyMessage?: ReactNode;

  inputId?: string;
  inputName?: string;

  onInputBlur?: (e: ReactFocusEvent<HTMLInputElement>) => void;
  onInputFocus?: (e: ReactFocusEvent<HTMLInputElement>) => void;

  /** Callback for keyboard or paste-time validation rejections (shake trigger). */
  onInvalid?: (raw: string) => void;

  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export function TagInput<T = string>({
  ref,
  className,
  variant,
  inputSize,
  value,
  defaultValue,
  onValueChange,
  validate,
  parseOnPaste,
  separators = DEFAULT_SEPARATORS,
  maxTags,
  allowDuplicates = false,
  placeholder,
  disabled = false,
  readOnly = false,
  getTagLabel,
  getTagKey,
  renderTag,
  suggestions,
  filterSuggestions,
  suggestionsLoading = false,
  renderSuggestion,
  suggestionsEmptyMessage = 'No matches',
  inputId,
  inputName,
  onInputBlur,
  onInputFocus,
  onInvalid,
  id,
  ...rest
}: TagInputProps<T>) {
  const labelFor = useCallback<(t: T) => string>(
    (t) => (getTagLabel !== undefined ? getTagLabel(t) : String(t as unknown)),
    [getTagLabel],
  );
  const keyFor = useCallback<(t: T) => string>(
    (t) => (getTagKey !== undefined ? getTagKey(t) : labelFor(t)),
    [getTagKey, labelFor],
  );

  const [tags, setTags] = useControllableState<ReadonlyArray<T>>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: (next) => onValueChange?.(Array.from(next)),
  });
  const tagsArr = useMemo(() => tags ?? [], [tags]);
  // Mirror tagsArr in a ref so synchronous burst commits (paste, multi-comma)
  // see the latest accumulator instead of the stale closure value. The ref is
  // synced after render via useLayoutEffect; commitTag/removeTagAt also patch
  // it in place so a burst of commits in one event handler stays consistent.
  const tagsRef = useRef<ReadonlyArray<T>>(tagsArr);
  useLayoutEffect(() => {
    tagsRef.current = tagsArr;
  }, [tagsArr]);

  const aria = useFieldAriaProps(
    {
      id: id ?? inputId,
      'aria-describedby': rest['aria-describedby'],
      'aria-labelledby': rest['aria-labelledby'],
    },
    variant === 'error',
  );
  const effectiveVariant = variant ?? (aria.hasError ? 'error' : 'default');

  const [query, setQuery] = useState('');
  const [focusedChip, setFocusedChip] = useState<number | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const triggerShake = useCallback((raw?: string) => {
    setShakeKey((k) => k + 1);
    if (raw !== undefined) onInvalid?.(raw);
  }, [onInvalid]);

  const containerRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const mergedContainerRef = useMergedRefs(containerRef, ref);

  const focusInput = useCallback(() => {
    setFocusedChip(null);
    inputRef.current?.focus();
  }, []);

  const focusChip = useCallback((index: number) => {
    setFocusedChip(index);
  }, []);

  // Apply DOM focus when focusedChip changes.
  useLayoutEffect(() => {
    if (focusedChip === null) return;
    const tag = tagsArr[focusedChip];
    if (tag === undefined) return;
    const el = chipRefs.current.get(keyFor(tag));
    el?.focus();
  }, [focusedChip, tagsArr, keyFor]);

  // Imperatively replay the shake animation on each invalidation. We don't
  // remount the container — that would unmount the input and lose focus.
  useEffect(() => {
    if (shakeKey === 0) return;
    const el = containerRef.current;
    if (el === null) return;
    const motionOk =
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function' ||
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!motionOk) return;
    el.classList.remove('animate-shake');
    void el.offsetWidth;
    el.classList.add('animate-shake');
    const id = window.setTimeout(() => {
      el.classList.remove('animate-shake');
    }, 320);
    return () => window.clearTimeout(id);
  }, [shakeKey]);

  const hasSuggestions = suggestions !== undefined;

  const filteredSuggestions = useMemo<ReadonlyArray<T>>(() => {
    if (suggestions === undefined) return [];
    const filterFn =
      filterSuggestions ??
      ((item: T, q: string) => defaultFilterSuggestions(item, q, labelFor));
    let list = query === '' ? suggestions : suggestions.filter((it) => filterFn(it, query));
    if (!allowDuplicates) {
      const seen = new Set(tagsArr.map(keyFor));
      list = list.filter((it) => !seen.has(keyFor(it)));
    }
    return list;
  }, [suggestions, filterSuggestions, query, labelFor, allowDuplicates, tagsArr, keyFor]);

  const popover = useDisclosure(false);

  const commitTag = useCallback(
    (tag: T): boolean => {
      const cur = tagsRef.current;
      if (!allowDuplicates && cur.some((t) => keyFor(t) === keyFor(tag))) {
        triggerShake();
        return false;
      }
      if (maxTags !== undefined && cur.length >= maxTags) {
        triggerShake();
        return false;
      }
      const next = [...cur, tag];
      tagsRef.current = next;
      setTags(next);
      setQuery('');
      return true;
    },
    [allowDuplicates, keyFor, maxTags, setTags, triggerShake],
  );

  const commitToken = useCallback(
    (raw: string): boolean => {
      const result = validate !== undefined ? validate(raw) : ((): T | null => {
        const trimmed = raw.trim();
        return trimmed === '' ? null : (trimmed as unknown as T);
      })();
      if (result === null) {
        triggerShake(raw);
        return false;
      }
      return commitTag(result);
    },
    [validate, commitTag, triggerShake],
  );

  const removeTagAt = useCallback(
    (index: number) => {
      const next = tagsRef.current.filter((_, i) => i !== index);
      tagsRef.current = next;
      setTags(next);
    },
    [setTags],
  );

  // Listbox over filtered suggestions.
  const listbox = useListbox<T>({
    items: filteredSuggestions,
    getItemValue: keyFor,
    onSelect: (item) => {
      commitTag(item);
      popover.close();
      inputRef.current?.focus();
    },
  });

  useEscapeKey(
    () => {
      popover.close();
      inputRef.current?.focus();
    },
    { enabled: popover.isOpen },
  );

  useClickOutside(
    containerRef,
    () => {
      popover.close();
    },
    { enabled: popover.isOpen },
  );

  const charSeparators = useMemo(
    () => separators.filter((s) => s.length === 1),
    [separators],
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.currentTarget.value;
    if (charSeparators.length === 0) {
      setQuery(text);
      if (hasSuggestions && !popover.isOpen && text !== '') popover.open();
      return;
    }
    const splitRe = new RegExp(`[${charSeparators.map(escapeRegExp).join('')}]`, 'g');
    if (!splitRe.test(text)) {
      setQuery(text);
      if (hasSuggestions && !popover.isOpen && text !== '') popover.open();
      return;
    }
    const parts = text.split(new RegExp(`[${charSeparators.map(escapeRegExp).join('')}]+`));
    const last = parts.pop() ?? '';
    for (const raw of parts) {
      const trimmed = raw.trim();
      if (trimmed === '') continue;
      commitToken(trimmed);
    }
    setQuery(last);
  };

  const cursorAtStart = (el: HTMLInputElement): boolean =>
    el.selectionStart === 0 && el.selectionEnd === 0;

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;
    const target = e.currentTarget;

    if (e.key === 'Backspace' && query === '' && tagsArr.length > 0) {
      e.preventDefault();
      removeTagAt(tagsArr.length - 1);
      return;
    }

    if (
      e.key === 'ArrowLeft' &&
      query === '' &&
      cursorAtStart(target) &&
      tagsArr.length > 0
    ) {
      e.preventDefault();
      focusChip(tagsArr.length - 1);
      return;
    }

    if (hasSuggestions && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      if (!popover.isOpen) {
        e.preventDefault();
        popover.open();
        return;
      }
      listbox.onKeyDown(e);
      return;
    }

    if (separators.includes(e.key)) {
      // Tab with empty query and no active suggestion: leave for normal Tab nav.
      if (e.key === 'Tab') {
        if (
          query.trim() === '' &&
          (!hasSuggestions || !popover.isOpen || listbox.activeIndex < 0)
        ) {
          return;
        }
      }
      e.preventDefault();
      if (
        hasSuggestions &&
        popover.isOpen &&
        listbox.activeIndex >= 0 &&
        filteredSuggestions[listbox.activeIndex] !== undefined
      ) {
        const item = filteredSuggestions[listbox.activeIndex] as T;
        commitTag(item);
        popover.close();
      } else if (query.trim() !== '') {
        commitToken(query);
        popover.close();
      }
      return;
    }
  };

  const onChipKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    if (disabled || readOnly) return;
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      removeTagAt(index);
      focusInput();
      return;
    }
    if (e.key === 'ArrowLeft') {
      if (index > 0) {
        e.preventDefault();
        focusChip(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < tagsArr.length - 1) {
        focusChip(index + 1);
      } else {
        focusInput();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      focusInput();
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      focusChip(0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      focusChip(tagsArr.length - 1);
    }
  };

  const onPaste = (e: ReactClipboardEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;
    const text = e.clipboardData.getData('text');
    if (text === '') return;

    if (parseOnPaste !== undefined) {
      const candidates = parseOnPaste(text);
      if (candidates.length === 0) return;
      e.preventDefault();
      for (const c of candidates) commitTag(c);
      return;
    }

    const splitChars = [...charSeparators, '\n'];
    const splitRe = new RegExp(`[${splitChars.map(escapeRegExp).join('')}]+`);
    const parts = text
      .split(splitRe)
      .map((s) => s.trim())
      .filter((s) => s !== '');
    if (parts.length <= 1) return;
    e.preventDefault();
    for (const raw of parts) commitToken(raw);
  };

  const handleInputFocus = (e: ReactFocusEvent<HTMLInputElement>) => {
    setFocusedChip(null);
    onInputFocus?.(e);
  };

  const handleInputBlur = (e: ReactFocusEvent<HTMLInputElement>) => {
    onInputBlur?.(e);
  };

  const lb = listbox.getListboxProps();
  const showPopover = hasSuggestions && popover.isOpen;

  const triggerWrapRef = containerRef as unknown as React.RefObject<HTMLElement | null>;
  const popoverRef = useRef<HTMLDivElement>(null);
  const pos = usePosition(triggerWrapRef, popoverRef, {
    placement: 'bottom-start',
    offset: 4,
    enabled: showPopover,
  });

  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    if (!showPopover) return;
    const measure = () => {
      const el = containerRef.current;
      if (el !== null) setPopoverWidth(el.offsetWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [showPopover]);

  const inputDescribedBy = aria['aria-describedby'];
  const inputAriaInvalid = aria['aria-invalid'];

  return (
    <label
      ref={mergedContainerRef}
      htmlFor={aria.id}
      data-disabled={disabled || undefined}
      className={cn(
        shellStyles({ variant: effectiveVariant, inputSize }),
        disabled && 'cursor-not-allowed opacity-50',
        readOnly && 'bg-surface-muted',
        className,
      )}
      {...rest}
    >
      {tagsArr.map((tag, i) => {
        const label = labelFor(tag);
        const onRemove = () => {
          removeTagAt(i);
          focusInput();
        };
        if (renderTag !== undefined) {
          return (
            <span key={keyFor(tag)}>
              {renderTag(tag, {
                onRemove,
                isFocused: focusedChip === i,
                index: i,
                disabled: disabled || readOnly,
              })}
            </span>
          );
        }
        return (
          <button
            key={keyFor(tag)}
            ref={(el) => {
              const k = keyFor(tag);
              if (el === null) chipRefs.current.delete(k);
              else chipRefs.current.set(k, el);
            }}
            type="button"
            tabIndex={focusedChip === i ? 0 : -1}
            disabled={disabled}
            aria-label={readOnly || disabled ? label : `${label}, press Backspace to remove`}
            data-focused={focusedChip === i ? '' : undefined}
            onKeyDown={(e) => onChipKeyDown(e, i)}
            onClick={(e) => {
              e.stopPropagation();
              if (readOnly || disabled) return;
              focusChip(i);
            }}
            className={cn(
              'inline-flex max-w-full items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
              'data-[focused]:ring-2 data-[focused]:ring-ring',
              !readOnly && !disabled && 'cursor-pointer hover:bg-primary/25',
            )}
          >
            <span className="truncate">{label}</span>
            {!readOnly && !disabled ? (
              <X className="h-3 w-3 shrink-0" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}

      <input
        ref={inputRef}
        id={aria.id}
        name={inputName}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        role={hasSuggestions ? 'combobox' : undefined}
        aria-expanded={hasSuggestions ? showPopover : undefined}
        aria-controls={hasSuggestions ? lb.id : undefined}
        aria-haspopup={hasSuggestions ? 'listbox' : undefined}
        aria-autocomplete={hasSuggestions ? 'list' : undefined}
        aria-activedescendant={
          hasSuggestions && showPopover ? lb['aria-activedescendant'] : undefined
        }
        aria-label={rest['aria-label']}
        aria-labelledby={aria['aria-labelledby']}
        aria-describedby={inputDescribedBy}
        aria-invalid={inputAriaInvalid}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={tagsArr.length === 0 ? placeholder : undefined}
        value={query}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        onPaste={onPaste}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="min-w-[6rem] flex-1 bg-transparent text-foreground placeholder:text-foreground-subtle focus:outline-none disabled:cursor-not-allowed"
      />

      {showPopover ? (
        <Portal>
          <div
            ref={popoverRef}
            {...lb}
            data-side={pos.placement}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              minWidth: popoverWidth,
            }}
            className="z-[60] overflow-hidden rounded-md border border-border bg-surface shadow-lg motion-safe:animate-dialog-in"
          >
            <div className="max-h-72 overflow-y-auto p-1">
              {suggestionsLoading ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-foreground-subtle"
                >
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Loading…
                </div>
              ) : filteredSuggestions.length === 0 ? (
                <div role="status" className="px-3 py-6 text-center text-sm text-foreground-subtle">
                  {suggestionsEmptyMessage}
                </div>
              ) : (
                filteredSuggestions.map((item, i) => {
                  const itemProps = listbox.getItemProps(i);
                  return (
                    // role="option" comes via {...itemProps}; lint can't see
                    // attributes through spread.
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions
                    <div
                      key={keyFor(item)}
                      {...itemProps}
                      onMouseMove={() => {
                        if (listbox.activeIndex !== i) listbox.setActiveIndex(i);
                      }}
                      onClick={() => {
                        commitTag(item);
                        popover.close();
                        inputRef.current?.focus();
                      }}
                      className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground data-[active=true]:bg-surface-muted"
                    >
                      <span className="min-w-0 flex-1 truncate">
                        {renderSuggestion !== undefined ? renderSuggestion(item) : labelFor(item)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Portal>
      ) : null}
    </label>
  );
}
