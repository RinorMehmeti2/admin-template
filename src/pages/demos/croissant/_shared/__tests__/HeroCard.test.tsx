import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { HeroCard } from '../HeroCard';

describe('HeroCard', () => {
  it('renders eyebrow, title, description, action and illustration slots', () => {
    render(
      <HeroCard
        eyebrow="E"
        title="Hello"
        description="World"
        action={<button>Go</button>}
        illustration={<span data-testid="ill">i</span>}
      />,
    );
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hello' })).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
    expect(screen.getByTestId('ill')).toBeInTheDocument();
  });

  it('passes axe', async () => {
    const { container } = render(<HeroCard title="t" description="d" />);
    await expect(runAxe(container)).resolves.toHaveNoViolations();
  });
});
