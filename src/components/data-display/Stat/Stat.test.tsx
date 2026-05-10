import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { Stat } from './Stat';

describe('Stat', () => {
  it('renders label and value', () => {
    render(<Stat label="Revenue" value="$12,400" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$12,400')).toBeInTheDocument();
  });

  it('positive number delta shows + prefix and success tone', () => {
    render(<Stat label="Users" value="1,200" delta={12.5} />);
    const node = screen.getByText('+12.5');
    expect(node.parentElement).toHaveClass('text-success');
  });

  it('negative number delta shows - and danger tone', () => {
    render(<Stat label="Bounce" value="42%" delta={-3.2} />);
    const node = screen.getByText('-3.2');
    expect(node.parentElement).toHaveClass('text-danger');
  });

  it('zero number delta uses flat tone', () => {
    render(<Stat label="Sessions" value="100" delta={0} />);
    const node = screen.getByText('0');
    expect(node.parentElement).toHaveClass('text-foreground-muted');
  });

  it('string delta with explicit sign preserved', () => {
    render(<Stat label="x" value="1" delta="-5%" />);
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('renders deltaLabel', () => {
    render(<Stat label="x" value="1" delta={1} deltaLabel="vs last week" />);
    expect(screen.getByText('vs last week')).toBeInTheDocument();
  });

  it('compact variant changes layout', () => {
    render(
      <Stat
        variant="compact"
        label="x"
        value="1"
        data-testid="stat"
        icon={<span data-testid="ico">i</span>}
      />,
    );
    const root = screen.getByTestId('stat');
    expect(root).toHaveClass('flex-row');
    expect(screen.getByTestId('ico')).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Stat label="Revenue" value="$12,400" delta={12.5} deltaLabel="vs last week" />
        <Stat variant="compact" label="Users" value="1,200" />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
