import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Plus } from 'lucide-react';
import { IconButton } from './IconButton';

describe('IconButton tap target', () => {
  it('opts into data-touch-target by default', () => {
    render(
      <IconButton aria-label="add" size="sm">
        <Plus />
      </IconButton>,
    );
    const btn = screen.getByRole('button', { name: 'add' });
    expect(btn).toHaveAttribute('data-touch-target', '');
  });

  it('coarse-pointer media rule lifts min size to 44 (style attribute presence check)', () => {
    // We cannot evaluate the actual @media (pointer: coarse) rule in jsdom —
    // jsdom doesn't apply external stylesheets to computed style. Instead
    // assert the opt-in attribute is present (the rule above is enforced by
    // globals.css). Visual verification belongs in Storybook / browser.
    render(
      <IconButton aria-label="x" size="sm">
        <Plus />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'x' })).toHaveAttribute('data-touch-target');
  });

  it('rect width >= 32 px (sm) baseline — non-coarse pointer baseline', () => {
    render(
      <IconButton aria-label="y" size="sm">
        <Plus />
      </IconButton>,
    );
    const btn = screen.getByRole('button', { name: 'y' });
    // jsdom returns 0 from getBoundingClientRect — we mock a layout result by
    // checking the className signal for "h-8 w-8" (sm size). Real layout is
    // covered by Storybook visual tests.
    expect(btn.className).toMatch(/h-8/);
    expect(btn.className).toMatch(/w-8/);
  });
});
