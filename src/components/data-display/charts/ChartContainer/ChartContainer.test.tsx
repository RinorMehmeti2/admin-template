import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartContainer } from './ChartContainer';
import { useChartContext } from '../shared/ChartContext';
import { runAxe } from '@/test-utils/a11y';

function ContextProbe() {
  const ctx = useChartContext();
  return <div data-testid="probe">{ctx === null ? 'no-context' : 'has-context'}</div>;
}

describe('ChartContainer', () => {
  it('renders children inside the provider', () => {
    render(
      <ChartContainer>
        <ContextProbe />
      </ChartContainer>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('has-context');
  });

  it('exposes context only inside the container', () => {
    render(<ContextProbe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('no-context');
  });

  it('forwards className', () => {
    const { container } = render(<ChartContainer className="my-chart-frame">x</ChartContainer>);
    expect(container.querySelector('.my-chart-frame')).not.toBeNull();
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <ChartContainer>
        <div>chart body</div>
      </ChartContainer>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
