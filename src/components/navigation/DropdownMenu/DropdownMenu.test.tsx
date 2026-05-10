import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './DropdownMenu';
import { Button } from '@/components/primitives/Button';
import { runAxe } from '@/test-utils/a11y';

function Demo({ onSelect }: { onSelect?: (v: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button>Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => onSelect?.('profile')}>
          Profile
          <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelect?.('billing')}>Billing</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onSelect?.('logout')}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  it('opens via the trigger', async () => {
    render(<Demo />);
    expect(screen.queryByRole('menu')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('trigger sets aria-haspopup + aria-expanded', async () => {
    render(<Demo />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('first item gets focus on open', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: /Profile/i }));
    });
  });

  it('Escape closes', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('clicking outside closes', async () => {
    render(
      <div>
        <Demo />
        <button>outside</button>
      </div>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('clicking an item fires onSelect and closes the menu', async () => {
    const onSelect = vi.fn();
    render(<Demo onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Billing' }));
    expect(onSelect).toHaveBeenCalledWith('billing');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('arrow down moves focus to next item', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: /Profile/i }));
    });
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Billing' }));
  });

  it('typeahead jumps to item starting with the typed letter', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: /Profile/i }));
    });
    await userEvent.keyboard('l');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Log out' }));
  });

  it('CheckboxItem toggles checked state and stays open', async () => {
    function Demo2() {
      const [checked, setChecked] = useState(false);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button>Open</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
              Show grid
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    render(<Demo2 />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const item = screen.getByRole('menuitemcheckbox');
    expect(item).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(item);
    expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('has no a11y violations (closed + open)', async () => {
    const { container } = render(<Demo />);
    expect(await runAxe(container)).toHaveNoViolations();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(await runAxe(document.body)).toHaveNoViolations();
  });

  it('RadioGroup updates value on item activation', async () => {
    function Demo3() {
      const [v, setV] = useState('a');
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button>Open</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={v} onValueChange={setV}>
              <DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="b">B</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    render(<Demo3 />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menuitemradio', { name: 'A' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'B' }));
    expect(screen.getByRole('menuitemradio', { name: 'B' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: 'A' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });
});
