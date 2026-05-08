import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useId } from '@/hooks/useId';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useFocusReturn } from '@/hooks/useFocusReturn';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useClickOutside } from '@/hooks/useClickOutside';
import { Portal } from '@/components/overlays/Portal';
import { Kbd } from '@/components/primitives/Kbd';
import { useCommandRegistry, type Command } from './CommandRegistry';
import { scoreCommand } from './fuzzyMatch';

interface FlatItem {
  type: 'group' | 'command';
  /** Group label, only set on type === 'group'. */
  group?: string;
  /** Command, only set on type === 'command'. */
  command?: Command;
  /** Index within the flat list of *commands only* (excludes group headers). */
  cmdIndex?: number;
}

function flattenGroups(filtered: ReadonlyArray<Command>): {
  flat: FlatItem[];
  commandCount: number;
} {
  const groupMap = new Map<string, Command[]>();
  for (const cmd of filtered) {
    const key = cmd.group ?? 'General';
    const arr = groupMap.get(key) ?? [];
    arr.push(cmd);
    groupMap.set(key, arr);
  }
  const flat: FlatItem[] = [];
  let cmdIndex = 0;
  for (const [group, items] of groupMap) {
    flat.push({ type: 'group', group });
    for (const c of items) {
      flat.push({ type: 'command', command: c, cmdIndex });
      cmdIndex += 1;
    }
  }
  return { flat, commandCount: cmdIndex };
}

export interface CommandPaletteProps {
  /** Optional placeholder for the search input. */
  placeholder?: string;
  /** Optional className applied to the panel. */
  className?: string;
}

export function CommandPalette({
  placeholder = 'Type a command or search…',
  className,
}: CommandPaletteProps) {
  const { open, closePalette, commands } = useCommandRegistry();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const listboxId = useId('cmd-listbox');
  const inputId = useId('cmd-input');

  useFocusTrap(panelRef, { active: open, initialFocus: 'first' });
  useFocusReturn(open);
  useScrollLock(open);
  useEscapeKey(() => closePalette(), { enabled: open });
  useClickOutside(panelRef, () => closePalette(), { enabled: open });

  // Reset on open.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const filtered = useMemo<ReadonlyArray<Command>>(() => {
    const enabled = commands.filter((c) => c.disabled !== true);
    if (query.trim() === '') {
      // Stable order: by group, then registration order.
      return enabled.slice().sort((a, b) => {
        const ag = a.group ?? 'General';
        const bg = b.group ?? 'General';
        return ag.localeCompare(bg);
      });
    }
    const ranked = enabled
      .map((cmd) => ({ cmd, result: scoreCommand(query, cmd) }))
      .filter((x) => x.result.matched)
      .sort((a, b) => b.result.score - a.result.score);
    return ranked.map((x) => x.cmd);
  }, [commands, query]);

  const { flat, commandCount } = useMemo(() => flattenGroups(filtered), [filtered]);

  const safeActive = commandCount === 0 ? -1 : Math.min(Math.max(activeIndex, 0), commandCount - 1);

  // Scroll active option into view.
  useEffect(() => {
    if (safeActive < 0) return;
    const el = listboxRef.current?.querySelector<HTMLElement>(
      `[data-cmd-index="${safeActive}"]`,
    );
    if (el !== null && el !== undefined && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [safeActive]);

  const performAt = (idx: number) => {
    const cmd = filtered[idx];
    if (cmd === undefined) return;
    closePalette();
    // Defer so close can settle before nav side effects.
    queueMicrotask(() => {
      void cmd.perform();
    });
  };

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (commandCount === 0 && e.key !== 'Escape') return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1 >= commandCount ? 0 : i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 < 0 ? commandCount - 1 : i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(commandCount - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      performAt(safeActive);
    }
  };

  if (!open) return null;

  const activeOptionId = safeActive >= 0 ? `${listboxId}-${safeActive}` : undefined;

  return (
    <Portal>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm motion-safe:animate-overlay-in"
      />
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className={cn(
            'flex w-full max-w-xl flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-lg',
            'motion-safe:animate-dialog-in',
            className,
          )}
        >
          <label htmlFor={inputId} className="sr-only">
            Search commands
          </label>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 shrink-0 text-foreground-subtle" aria-hidden="true" />
            <input
              ref={inputRef}
              id={inputId}
              role="combobox"
              aria-expanded
              aria-controls={listboxId}
              aria-activedescendant={activeOptionId}
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onInputKeyDown}
              placeholder={placeholder}
              className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
            />
            <Kbd className="hidden sm:inline-flex" aria-hidden="true">
              Esc
            </Kbd>
          </div>

          <div
            ref={listboxRef}
            role="listbox"
            id={listboxId}
            className="max-h-80 overflow-y-auto p-1"
          >
            {commandCount === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-foreground-subtle">
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              flat.map((item, i) => {
                if (item.type === 'group') {
                  return (
                    <div
                      key={`g-${item.group}-${i}`}
                      className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-foreground-subtle first:pt-1"
                    >
                      {item.group}
                    </div>
                  );
                }
                const cmd = item.command!;
                const idx = item.cmdIndex!;
                const isActive = idx === safeActive;
                return (
                  <div
                    key={cmd.id}
                    role="option"
                    id={`${listboxId}-${idx}`}
                    data-cmd-index={idx}
                    aria-selected={isActive}
                    onMouseMove={() => {
                      if (idx !== activeIndex) setActiveIndex(idx);
                    }}
                    onClick={() => performAt(idx)}
                    className={cn(
                      'flex cursor-default select-none items-center gap-3 rounded-md px-2 py-2 text-sm',
                      isActive ? 'bg-surface-muted text-foreground' : 'text-foreground',
                    )}
                  >
                    {cmd.icon !== undefined ? (
                      <span
                        className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-foreground-muted"
                        aria-hidden="true"
                      >
                        {cmd.icon}
                      </span>
                    ) : (
                      <span className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1 truncate">{cmd.label}</span>
                    {cmd.description !== undefined ? (
                      <span className="hidden text-xs text-foreground-subtle sm:inline">
                        {cmd.description}
                      </span>
                    ) : null}
                    {cmd.shortcut !== undefined && cmd.shortcut.length > 0 ? (
                      <span className="ml-auto flex shrink-0 items-center gap-1">
                        {cmd.shortcut.map((k, ki) => (
                          <Kbd key={ki}>{k}</Kbd>
                        ))}
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border bg-surface-muted/40 px-3 py-2 text-[0.7rem] text-foreground-subtle">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd>Esc</Kbd>
              <span>close</span>
            </span>
          </div>
        </div>
      </div>
    </Portal>
  );
}
