import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { SceneHeader } from '../SceneHeader';

describe('SceneHeader', () => {
  it('renders eyebrow, title, description and meta', () => {
    render(
      <SceneHeader
        eyebrow="Morning rush"
        title="Bakery dashboard"
        description="Live orders"
        meta={<span data-testid="meta-chip">live</span>}
      />,
    );
    expect(screen.getByText('Morning rush')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Bakery dashboard/ })).toBeInTheDocument();
    expect(screen.getByText('Live orders')).toBeInTheDocument();
    expect(screen.getByTestId('meta-chip')).toBeInTheDocument();
  });

  it('hides decorative pattern from print', () => {
    const { container } = render(
      <SceneHeader eyebrow="x" title="y" pattern="dots" description="d" />,
    );
    expect(container.querySelector('[data-print="hide"]')).not.toBeNull();
  });

  it('passes axe', async () => {
    const { container } = render(<SceneHeader eyebrow="x" title="Y" description="d" />);
    await expect(runAxe(container)).resolves.toHaveNoViolations();
  });
});
