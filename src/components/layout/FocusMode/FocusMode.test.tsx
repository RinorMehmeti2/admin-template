import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FocusMode } from './FocusMode';

describe('FocusMode', () => {
  it('renders the title and the body content', () => {
    render(
      <FocusMode title="Edit profile" onExit={vi.fn()}>
        <p data-testid="body">body</p>
      </FocusMode>,
    );
    expect(screen.getByRole('heading')).toHaveTextContent('Edit profile');
    expect(screen.getByTestId('body')).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Edit profile');
  });

  it('Escape calls onExit', async () => {
    const onExit = vi.fn();
    render(
      <FocusMode title="x" onExit={onExit}>
        body
      </FocusMode>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('Escape can be opted out of via closeOnEscape=false', async () => {
    const onExit = vi.fn();
    render(
      <FocusMode title="x" onExit={onExit} closeOnEscape={false}>
        body
      </FocusMode>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onExit).not.toHaveBeenCalled();
  });

  it('clicking the close button calls onExit', async () => {
    const onExit = vi.fn();
    render(
      <FocusMode title="x" onExit={onExit}>
        body
      </FocusMode>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Exit focus mode' }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('clicking the back button calls onExit when showBack is true (default)', async () => {
    const onExit = vi.fn();
    render(
      <FocusMode title="x" onExit={onExit}>
        body
      </FocusMode>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('hides the back button when showBack=false', () => {
    render(
      <FocusMode title="x" onExit={vi.fn()} showBack={false}>
        body
      </FocusMode>,
    );
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
  });

  it('locks body scroll while mounted, restores on unmount', () => {
    document.body.style.overflow = '';
    const { unmount } = render(
      <FocusMode title="x" onExit={vi.fn()}>
        body
      </FocusMode>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('renders an optional toolbar slot', () => {
    render(
      <FocusMode title="x" onExit={vi.fn()} toolbar={<button type="button">Save</button>}>
        body
      </FocusMode>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
