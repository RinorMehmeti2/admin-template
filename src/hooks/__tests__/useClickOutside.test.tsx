import { describe, it, expect, vi } from 'vitest';
import { useRef } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useClickOutside } from '@/hooks/useClickOutside';

function Demo({
  handler,
  enabled = true,
}: {
  handler: (e: PointerEvent) => void;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, handler, { enabled });
  return (
    <div>
      <div ref={ref}>
        <button>inner</button>
      </div>
      <button>outside</button>
    </div>
  );
}

describe('useClickOutside', () => {
  it('fires for click outside the ref', async () => {
    const handler = vi.fn();
    const { getByText } = render(<Demo handler={handler} />);
    await userEvent.click(getByText('outside'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire for click inside the ref', async () => {
    const handler = vi.fn();
    const { getByText } = render(<Demo handler={handler} />);
    await userEvent.click(getByText('inner'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('respects enabled=false', async () => {
    const handler = vi.fn();
    const { getByText } = render(<Demo handler={handler} enabled={false} />);
    await userEvent.click(getByText('outside'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('treats click inside any of multiple refs as inside', async () => {
    function MultiDemo({ handler }: { handler: () => void }) {
      const a = useRef<HTMLDivElement>(null);
      const b = useRef<HTMLDivElement>(null);
      useClickOutside([a, b], handler);
      return (
        <div>
          <div ref={a}>
            <button>a-inside</button>
          </div>
          <div ref={b}>
            <button>b-inside</button>
          </div>
          <button>outside</button>
        </div>
      );
    }
    const handler = vi.fn();
    const { getByText } = render(<MultiDemo handler={handler} />);
    await userEvent.click(getByText('a-inside'));
    await userEvent.click(getByText('b-inside'));
    expect(handler).not.toHaveBeenCalled();
    await userEvent.click(getByText('outside'));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
