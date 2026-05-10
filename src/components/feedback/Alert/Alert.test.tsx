import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders title and description', () => {
    render(<Alert title="Heads up" description="Important note." />);
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('Important note.')).toBeInTheDocument();
  });

  it.each([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'alert'],
    ['danger', 'alert'],
    ['neutral', 'status'],
  ] as const)('variant=%s uses role=%s', (variant, role) => {
    render(<Alert variant={variant} title="x" />);
    expect(screen.getByRole(role)).toBeInTheDocument();
  });

  it('uses default icon per variant', () => {
    const { container } = render(<Alert variant="success" title="x" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('supports custom icon override', () => {
    render(<Alert title="x" icon={<span data-testid="custom-icon">!</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('hides icon when icon={false}', () => {
    const { container } = render(<Alert title="x" icon={false} />);
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders dismiss button when onClose provided and fires it', async () => {
    const onClose = vi.fn();
    render(<Alert title="x" onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders actions slot', () => {
    render(<Alert title="x" actions={<button>Retry</button>} />);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Alert ref={ref} title="x" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges className', () => {
    render(<Alert title="x" className="custom" />);
    expect(screen.getByRole('status')).toHaveClass('custom');
  });

  it('has no a11y violations (variants + dismissible + actions)', async () => {
    const { container } = render(
      <div>
        <Alert variant="info" title="Heads up" description="Important note." />
        <Alert variant="danger" title="Failed" onClose={() => undefined} />
        <Alert title="With actions" actions={<button type="button">Retry</button>} />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
