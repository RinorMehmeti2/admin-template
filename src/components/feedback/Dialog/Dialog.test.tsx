import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogBody,
} from './Dialog';
import { Button } from '@/components/primitives/Button';
import { runAxe } from '@/test-utils/a11y';

function Demo({
  onOpenChange,
  defaultOpen = false,
}: {
  onOpenChange?: (o: boolean) => void;
  defaultOpen?: boolean;
}) {
  return (
    <Dialog defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogTrigger>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm</DialogTitle>
          <DialogDescription>This is a description.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <input data-testid="inside" placeholder="x" />
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('opens via the trigger', async () => {
    render(<Demo />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('aria-modal=true and aria-labelledby/aria-describedby wired to title/description', async () => {
    render(<Demo defaultOpen />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const titleId = screen.getByText('Confirm').getAttribute('id');
    const descId = screen.getByText('This is a description.').getAttribute('id');
    expect(dialog.getAttribute('aria-labelledby')).toBe(titleId);
    expect(dialog.getAttribute('aria-describedby')).toBe(descId);
  });

  it('Escape closes', async () => {
    const onOpenChange = vi.fn();
    render(<Demo defaultOpen onOpenChange={onOpenChange} />);
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('overlay click closes (clicking outside content)', async () => {
    const onOpenChange = vi.fn();
    render(<Demo defaultOpen onOpenChange={onOpenChange} />);
    await userEvent.click(document.body);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('clicking inside content does NOT close', async () => {
    const onOpenChange = vi.fn();
    render(<Demo defaultOpen onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByTestId('inside'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('DialogClose closes on click', async () => {
    const onOpenChange = vi.fn();
    render(<Demo defaultOpen onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('locks body scroll while open', () => {
    document.body.style.overflow = '';
    render(<Demo defaultOpen />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll on unmount', () => {
    document.body.style.overflow = '';
    const { unmount } = render(<Demo defaultOpen />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('focus trap moves focus inside content on open', async () => {
    render(<Demo defaultOpen />);
    // first focusable inside the dialog should receive focus
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it('trigger gets aria-expanded + aria-haspopup', async () => {
    render(<Demo />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('controlled open', () => {
    const noop = vi.fn();
    render(
      <Dialog open onOpenChange={noop}>
        <DialogContent>
          <DialogTitle>Controlled</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has no a11y violations (closed + open)', async () => {
    const { container } = render(<Demo />);
    expect(await runAxe(container)).toHaveNoViolations();
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});
