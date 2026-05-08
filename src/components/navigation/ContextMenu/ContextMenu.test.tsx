import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ContextMenu';

function Demo({ onSelect }: { onSelect?: (v: string) => void }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div data-testid="target" className="h-32 w-64 bg-surface-muted">
          Right-click me
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => onSelect?.('copy')}>Copy</ContextMenuItem>
        <ContextMenuItem onSelect={() => onSelect?.('paste')}>Paste</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

describe('ContextMenu', () => {
  it('opens on contextmenu event', () => {
    render(<Demo />);
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.contextMenu(screen.getByTestId('target'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('positions at the cursor coordinates', () => {
    render(<Demo />);
    fireEvent.contextMenu(screen.getByTestId('target'), { clientX: 120, clientY: 80 });
    const menu = screen.getByRole('menu');
    expect(menu.style.left).toBe('120px');
    expect(menu.style.top).toBe('80px');
  });

  it('Escape closes', async () => {
    render(<Demo />);
    fireEvent.contextMenu(screen.getByTestId('target'));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('clicking an item closes and fires onSelect', async () => {
    const onSelect = vi.fn();
    render(<Demo onSelect={onSelect} />);
    fireEvent.contextMenu(screen.getByTestId('target'));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Copy' }));
    expect(onSelect).toHaveBeenCalledWith('copy');
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
