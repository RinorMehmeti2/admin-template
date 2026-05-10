import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders with role=switch', () => {
    render(<Switch aria-label="notifications" />);
    expect(screen.getByRole('switch', { name: 'notifications' })).toBeInTheDocument();
  });

  it('controlled checked', () => {
    render(<Switch aria-label="x" checked readOnly />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('user click toggles', async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="x" onChange={onChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalled();
  });

  it('keyboard space toggles', async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="x" onChange={onChange} />);
    const sw = screen.getByRole('switch') as HTMLInputElement;
    sw.focus();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenCalled();
  });

  it('disabled blocks interaction', async () => {
    const onChange = vi.fn();
    render(<Switch aria-label="x" disabled onChange={onChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch aria-label="x" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('has no a11y violations (off + on + disabled)', async () => {
    const { container } = render(
      <div>
        <Switch aria-label="notifications" />
        <Switch aria-label="newsletter" checked readOnly />
        <Switch aria-label="off" disabled />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
