import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

function Demo({
  onConfirm,
  variant,
  isLoading,
}: {
  onConfirm: () => void;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title="Delete account?"
      description="This action cannot be undone."
      onConfirm={onConfirm}
      {...(variant !== undefined ? { variant } : {})}
      {...(isLoading === true ? { isLoading: true } : {})}
    />
  );
}

describe('ConfirmDialog', () => {
  it('renders title and description', () => {
    render(<Demo onConfirm={() => undefined} />);
    expect(screen.getByText('Delete account?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('confirm button fires onConfirm', async () => {
    const onConfirm = vi.fn();
    render(<Demo onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancel button closes the dialog', async () => {
    render(<Demo onConfirm={() => undefined} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('danger variant uses the danger button', () => {
    render(<Demo onConfirm={() => undefined} variant="danger" />);
    const confirm = screen.getByRole('button', { name: 'Confirm' });
    expect(confirm).toHaveClass('bg-danger');
  });

  it('isLoading disables both buttons and shows spinner', () => {
    render(<Demo onConfirm={() => undefined} isLoading />);
    const confirm = screen.getByRole('button', { name: /Confirm/i });
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    expect(confirm).toBeDisabled();
    expect(cancel).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
  });
});
