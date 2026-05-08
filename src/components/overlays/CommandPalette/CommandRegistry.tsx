import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface Command {
  id: string;
  label: string;
  group?: string;
  keywords?: ReadonlyArray<string>;
  shortcut?: ReadonlyArray<string>;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  perform: () => void | Promise<void>;
}

interface CommandRegistryContextValue {
  commands: ReadonlyArray<Command>;
  registerCommand: (cmd: Command) => () => void;
  unregisterCommand: (id: string) => void;
  open: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
}

const CommandRegistryContext = createContext<CommandRegistryContextValue | null>(null);

export interface CommandRegistryProviderProps {
  children: ReactNode;
}

export function CommandRegistryProvider({ children }: CommandRegistryProviderProps) {
  const [commands, setCommands] = useState<ReadonlyArray<Command>>([]);
  const [open, setOpen] = useState(false);

  const registerCommand = useCallback((cmd: Command) => {
    setCommands((prev) => {
      const without = prev.filter((c) => c.id !== cmd.id);
      return [...without, cmd];
    });
    return () => {
      setCommands((prev) => prev.filter((c) => c.id !== cmd.id));
    };
  }, []);

  const unregisterCommand = useCallback((id: string) => {
    setCommands((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen((o) => !o), []);

  const value = useMemo<CommandRegistryContextValue>(
    () => ({
      commands,
      registerCommand,
      unregisterCommand,
      open,
      openPalette,
      closePalette,
      togglePalette,
    }),
    [commands, registerCommand, unregisterCommand, open, openPalette, closePalette, togglePalette],
  );

  return (
    <CommandRegistryContext.Provider value={value}>{children}</CommandRegistryContext.Provider>
  );
}

export function useCommandRegistry(): CommandRegistryContextValue {
  const ctx = useContext(CommandRegistryContext);
  if (ctx === null) {
    throw new Error('useCommandRegistry must be used inside <CommandRegistryProvider>');
  }
  return ctx;
}

/**
 * Declaratively register one or more commands. Re-runs (and cleans up) when
 * the supplied `deps` array changes — pass values referenced by the command's
 * `perform` so closures stay current.
 */
export function useRegisterCommands(commands: ReadonlyArray<Command>, deps: ReadonlyArray<unknown>) {
  const { registerCommand } = useCommandRegistry();
  useEffect(() => {
    const cleanups = commands.map((c) => registerCommand(c));
    return () => {
      for (const fn of cleanups) fn();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
