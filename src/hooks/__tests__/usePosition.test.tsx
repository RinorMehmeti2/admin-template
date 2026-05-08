import { describe, it, expect } from 'vitest';
import { useRef } from 'react';
import { render } from '@testing-library/react';
import { usePosition, type Placement } from '@/hooks/usePosition';

function Demo({ placement }: { placement: Placement }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const pos = usePosition(trigger, content, { placement, offset: 4 });
  return (
    <div>
      <button ref={trigger}>trigger</button>
      <div ref={content} data-testid="content" data-ready={pos.ready}>
        x={pos.x},y={pos.y}
      </div>
    </div>
  );
}

describe('usePosition', () => {
  it('flips ready=true after first measurement', async () => {
    const { findByTestId } = render(<Demo placement="bottom-start" />);
    const el = await findByTestId('content');
    // wait for the rAF tick
    await new Promise((r) => setTimeout(r, 50));
    expect(el.getAttribute('data-ready')).toBe('true');
  });

  it('returns numeric x and y for every supported placement', async () => {
    const placements: Placement[] = [
      'bottom-start',
      'bottom-end',
      'bottom',
      'top-start',
      'top-end',
      'top',
      'left',
      'right',
    ];
    for (const p of placements) {
      const { unmount, findByTestId } = render(<Demo placement={p} />);
      const el = await findByTestId('content');
      await new Promise((r) => setTimeout(r, 50));
      expect(el.textContent).toMatch(/x=-?\d+.*y=-?\d+/);
      unmount();
    }
  });
});
