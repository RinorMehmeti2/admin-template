import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByRole('heading', { name: 'Nothing here', level: 3 })).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<EmptyState title="x" description="No data yet" />);
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('renders icon and action slot', () => {
    render(
      <EmptyState
        title="x"
        icon={<span data-testid="ico">i</span>}
        action={<button data-testid="act">Add</button>}
      />,
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(screen.getByTestId('act')).toBeInTheDocument();
  });

  it('supports two action buttons', () => {
    render(
      <EmptyState
        title="x"
        action={
          <>
            <button>Cancel</button>
            <button>Confirm</button>
          </>
        }
      />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <EmptyState
        title="No projects yet"
        description="Get started by creating one."
        action={<button type="button">Create</button>}
      />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
