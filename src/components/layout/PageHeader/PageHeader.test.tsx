import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders title as h1', () => {
    render(<PageHeader title="Dashboard" />);
    const h = screen.getByRole('heading', { level: 1 });
    expect(h).toHaveTextContent('Dashboard');
  });

  it('renders description below title', () => {
    render(<PageHeader title="x" description="hello" />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders breadcrumbs slot', () => {
    render(<PageHeader title="x" breadcrumbs={<nav data-testid="bc" />} />);
    expect(screen.getByTestId('bc')).toBeInTheDocument();
  });

  it('renders actions slot', () => {
    render(<PageHeader title="x" actions={<button>Save</button>} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <PageHeader
        title="Dashboard"
        description="Overview of your account"
        actions={<button type="button">New</button>}
      />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
