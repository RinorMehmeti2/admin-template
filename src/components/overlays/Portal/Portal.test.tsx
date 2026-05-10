import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { runAxe } from '@/test-utils/a11y';
import { Portal } from './Portal';

describe('Portal', () => {
  it('renders children into document.body by default', () => {
    const { container } = render(
      <Portal>
        <div data-testid="portaled">hi</div>
      </Portal>,
    );
    // not in the original render container
    expect(container.querySelector('[data-testid="portaled"]')).toBeNull();
    // present in document.body
    expect(document.body.querySelector('[data-testid="portaled"]')).not.toBeNull();
  });

  it('renders into a custom Element container', () => {
    const target = document.createElement('div');
    target.id = 'custom-target';
    document.body.appendChild(target);
    render(
      <Portal container={target}>
        <span data-testid="x">x</span>
      </Portal>,
    );
    expect(target.querySelector('[data-testid="x"]')).not.toBeNull();
    target.remove();
  });

  it('calls a function container at render time', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const getter = vi.fn(() => target);
    render(
      <Portal container={getter}>
        <span data-testid="y">y</span>
      </Portal>,
    );
    expect(getter).toHaveBeenCalled();
    expect(target.querySelector('[data-testid="y"]')).not.toBeNull();
    target.remove();
  });

  it('removes children from container on unmount', () => {
    const { unmount } = render(
      <Portal>
        <div data-testid="z">z</div>
      </Portal>,
    );
    expect(document.body.querySelector('[data-testid="z"]')).not.toBeNull();
    unmount();
    expect(document.body.querySelector('[data-testid="z"]')).toBeNull();
  });

  it('has no a11y violations (portaled content)', async () => {
    render(
      <Portal>
        <button type="button" aria-label="Portaled">ok</button>
      </Portal>,
    );
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});
