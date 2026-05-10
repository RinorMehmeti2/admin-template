import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';

describe('runAxe smoke', () => {
  it('passes for accessible markup', async () => {
    const { container } = render(
      <button type="button" aria-label="test">
        ok
      </button>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('flags violations for inaccessible markup', async () => {
    // Deliberately missing alt — that's the violation we expect axe to catch.
    // eslint-disable-next-line jsx-a11y/alt-text
    const { container } = render(<img src="x.png" />);
    const result = await runAxe(container);
    expect(result.violations.length).toBeGreaterThan(0);
  });
});
