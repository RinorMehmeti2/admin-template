import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { StagedSection } from '../StagedSection';

describe('StagedSection', () => {
  it('renders header + children', () => {
    render(
      <StagedSection eyebrow="E" title="T" description="D" headingId="t">
        <div>a</div>
        <div>b</div>
      </StagedSection>,
    );
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('a')).toBeInTheDocument();
  });

  it('passes axe', async () => {
    const { container } = render(
      <StagedSection eyebrow="E" title="T" headingId="t">
        <p>child</p>
      </StagedSection>,
    );
    await expect(runAxe(container)).resolves.toHaveNoViolations();
  });
});
