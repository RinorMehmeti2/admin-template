import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { Topbar } from './Topbar';

describe('Topbar', () => {
  it('renders left, center, and right slots', () => {
    render(
      <Topbar
        left={<div data-testid="L" />}
        center={<div data-testid="C" />}
        right={<div data-testid="R" />}
      />,
    );
    expect(screen.getByTestId('L')).toBeInTheDocument();
    expect(screen.getByTestId('C')).toBeInTheDocument();
    expect(screen.getByTestId('R')).toBeInTheDocument();
  });

  it('renders without crashing when slots omitted', () => {
    const { container } = render(<Topbar />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <Topbar left={<span>Brand</span>} right={<button type="button">Account</button>} />,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
