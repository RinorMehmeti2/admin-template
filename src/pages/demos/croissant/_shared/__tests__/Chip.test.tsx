import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { Chip } from '../Chip';

describe('Chip', () => {
  it('renders children', () => {
    render(<Chip tone="success">hello</Chip>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders icon and dot prefix when provided', () => {
    const { container } = render(
      <Chip tone="warning" icon={<svg data-testid="ico" />} dot>
        with icon
      </Chip>,
    );
    expect(screen.getByTestId('ico')).toBeInTheDocument();
    expect(container.querySelector('.rounded-full')).not.toBeNull();
  });

  it('passes axe', async () => {
    const { container } = render(<Chip tone="primary">x</Chip>);
    await expect(runAxe(container)).resolves.toHaveNoViolations();
  });
});
