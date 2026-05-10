import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import {
  CommandPalette,
  CommandRegistryProvider,
  useCommandRegistry,
  useRegisterCommands,
  type Command,
} from './';
import { fuzzyMatch, scoreCommand } from './fuzzyMatch';
import { runAxe } from '@/test-utils/a11y';

function Opener() {
  const { openPalette } = useCommandRegistry();
  return <button onClick={openPalette}>Open palette</button>;
}

function Registrar({ commands }: { commands: ReadonlyArray<Command> }) {
  useRegisterCommands(commands, [commands]);
  return null;
}

function AutoOpener() {
  const { openPalette } = useCommandRegistry();
  useEffect(() => {
    openPalette();
  }, [openPalette]);
  return null;
}

function Harness({
  commands,
  autoOpen,
}: {
  commands: ReadonlyArray<Command>;
  autoOpen?: boolean;
}) {
  return (
    <CommandRegistryProvider>
      <Opener />
      <Registrar commands={commands} />
      {autoOpen === true ? <AutoOpener /> : null}
      <CommandPalette />
    </CommandRegistryProvider>
  );
}

describe('fuzzyMatch', () => {
  it('matches subsequence', () => {
    expect(fuzzyMatch('abc', 'apple banana cherry').matched).toBe(true);
  });
  it('rejects when not subsequence', () => {
    expect(fuzzyMatch('xyz', 'apple').matched).toBe(false);
  });
  it('boosts prefix matches over scattered matches', () => {
    const a = fuzzyMatch('set', 'settings');
    const b = fuzzyMatch('set', 'reset switch effect');
    expect(a.score).toBeGreaterThan(b.score);
  });
  it('empty query matches everything with score 0', () => {
    const r = fuzzyMatch('', 'whatever');
    expect(r.matched).toBe(true);
    expect(r.score).toBe(0);
  });
  it('scoreCommand uses keywords', () => {
    const cmd = { label: 'Toggle theme', keywords: ['dark', 'mode'] };
    expect(scoreCommand('dark', cmd).matched).toBe(true);
  });
});

describe('CommandPalette', () => {
  const baseCommands: Command[] = [
    {
      id: 'go-home',
      label: 'Go to Home',
      group: 'Navigation',
      keywords: ['nav', 'home'],
      perform: vi.fn(),
    },
    {
      id: 'toggle-theme',
      label: 'Toggle theme',
      group: 'Settings',
      keywords: ['dark', 'light'],
      perform: vi.fn(),
    },
    {
      id: 'create-thing',
      label: 'Create new thing',
      group: 'Actions',
      perform: vi.fn(),
    },
  ];

  it('renders nothing when closed', () => {
    render(<Harness commands={baseCommands} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens via context, shows registered commands grouped', async () => {
    render(<Harness commands={baseCommands} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open palette' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Go to Home/ })).toBeInTheDocument();
  });

  it('filters by query (fuzzy)', async () => {
    render(<Harness commands={baseCommands} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open palette' }));
    const input = await screen.findByRole('combobox');
    await userEvent.type(input, 'theme');
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: /Go to Home/ })).toBeNull();
    });
    expect(screen.getByRole('option', { name: /Toggle theme/ })).toBeInTheDocument();
  });

  it('arrow down moves active option, Enter performs', async () => {
    const perform = vi.fn();
    const cmds: Command[] = [
      { id: 'a', label: 'Alpha', perform: vi.fn() },
      { id: 'b', label: 'Bravo', perform },
    ];
    render(<Harness commands={cmds} autoOpen />);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    expect(perform).toHaveBeenCalledTimes(1);
  });

  it('Escape closes', async () => {
    render(<Harness commands={baseCommands} autoOpen />);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('shows empty state when no matches', async () => {
    render(<Harness commands={baseCommands} autoOpen />);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'zzzzzzz');
    expect(screen.getByText(/No results/)).toBeInTheDocument();
  });

  it('clicking an option performs the command and closes', async () => {
    const perform = vi.fn();
    const cmds: Command[] = [{ id: 'x', label: 'Run X', perform }];
    render(<Harness commands={cmds} autoOpen />);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('option', { name: /Run X/ }));
    await waitFor(() => expect(perform).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('has no a11y violations (open with grouped commands)', async () => {
    render(<Harness commands={baseCommands} autoOpen />);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    expect(await runAxe(document.body)).toHaveNoViolations();
  });

  it('useRegisterCommands cleans up on unmount', async () => {
    function Box({ on }: { on: boolean }) {
      return (
        <CommandRegistryProvider>
          {on ? <Registrar commands={baseCommands} /> : null}
          <AutoOpener />
          <CommandPalette />
        </CommandRegistryProvider>
      );
    }
    const { rerender } = render(<Box on />);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    expect(screen.getByRole('option', { name: /Go to Home/ })).toBeInTheDocument();
    await act(async () => {
      rerender(<Box on={false} />);
    });
    await waitFor(() => expect(screen.queryAllByRole('option').length).toBe(0));
  });
});
