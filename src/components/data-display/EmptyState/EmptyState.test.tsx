import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
