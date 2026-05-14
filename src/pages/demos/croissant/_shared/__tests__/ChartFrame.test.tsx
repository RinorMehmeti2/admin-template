import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { ChartFrame } from '../ChartFrame';

describe('ChartFrame', () => {
  it('renders title, action, body and insight', () => {
    render(
      <ChartFrame
        eyebrow="Eb"
        title="Chart"
        description="d"
        action={<button>act</button>}
        insight="ins"
      >
        <div data-testid="body">body</div>
      </ChartFrame>,
    );
    expect(screen.getByRole('heading', { name: 'Chart' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'act' })).toBeInTheDocument();
    expect(screen.getByTestId('body')).toBeInTheDocument();
    expect(screen.getByText('ins')).toBeInTheDocument();
  });

  it('renders skeleton when loading', () => {
    render(
      <ChartFrame title="t" loading>
        <div data-testid="body">body</div>
      </ChartFrame>,
    );
    expect(screen.queryByTestId('body')).toBeNull();
  });

  it('passes axe', async () => {
    const { container } = render(
      <ChartFrame title="t">
        <div>body</div>
      </ChartFrame>,
    );
    await expect(runAxe(container)).resolves.toHaveNoViolations();
  });
});
