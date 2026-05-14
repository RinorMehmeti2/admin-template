import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { EmptyHero } from '../EmptyHero';

describe('EmptyHero', () => {
  it('renders title, description, icon and actions', () => {
    render(
      <EmptyHero
        icon={<svg data-testid="ico" />}
        title="Nothing here"
        description="Try again"
        primaryAction={<button>Reset</button>}
        secondaryAction={<button>Learn more</button>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Learn more' })).toBeInTheDocument();
  });

  it('passes axe', async () => {
    const { container } = render(<EmptyHero title="t" description="d" />);
    await expect(runAxe(container)).resolves.toHaveNoViolations();
  });
});
