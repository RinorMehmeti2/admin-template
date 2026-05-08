import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
