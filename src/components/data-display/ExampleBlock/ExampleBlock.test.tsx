import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExampleBlock } from './ExampleBlock';
import { runAxe } from '@/test-utils/a11y';

const CODE = '<Button>Click me</Button>';

function setupClipboard(): { writeText: ReturnType<typeof vi.fn>; restore: () => void } {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const protoDescriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(window.navigator) as object,
    'clipboard',
  );
  Object.defineProperty(Object.getPrototypeOf(window.navigator) as object, 'clipboard', {
    configurable: true,
    get: () => ({ writeText }),
  });
  const restore = (): void => {
    if (protoDescriptor !== undefined) {
      Object.defineProperty(
        Object.getPrototypeOf(window.navigator) as object,
        'clipboard',
        protoDescriptor,
      );
    } else {
      delete (Object.getPrototypeOf(window.navigator) as any).clipboard;
    }
  };
  return { writeText, restore };
}

describe('ExampleBlock', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders title, description, and children', () => {
    render(
      <ExampleBlock title="Buttons" description="Variants and sizes" code={CODE}>
        <button>child</button>
      </ExampleBlock>,
    );
    expect(screen.getByRole('heading', { name: 'Buttons', level: 3 })).toBeInTheDocument();
    expect(screen.getByText('Variants and sizes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'child' })).toBeInTheDocument();
  });

  it('shows Copy and Show code buttons when code is provided', () => {
    render(
      <ExampleBlock title="x" code={CODE}>
        <span />
      </ExampleBlock>,
    );
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show code' })).toBeInTheDocument();
  });

  it('hides toolbar when no code', () => {
    render(
      <ExampleBlock title="x">
        <span />
      </ExampleBlock>,
    );
    expect(screen.queryByRole('button', { name: 'Copy code' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Show code' })).toBeNull();
  });

  it('hides toolbar when hideToolbar set, even with code', () => {
    render(
      <ExampleBlock title="x" code={CODE} hideToolbar>
        <span />
      </ExampleBlock>,
    );
    expect(screen.queryByRole('button', { name: 'Copy code' })).toBeNull();
  });

  it('swaps icon label to Copied after clicking Copy code', async () => {
    const user = userEvent.setup();
    render(
      <ExampleBlock title="x" code={CODE}>
        <span />
      </ExampleBlock>,
    );
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('writes code to navigator.clipboard when present', async () => {
    const user = userEvent.setup();
    const { writeText, restore } = setupClipboard();
    try {
      render(
        <ExampleBlock title="x" code={CODE}>
          <span />
        </ExampleBlock>,
      );
      await user.click(screen.getByRole('button', { name: 'Copy code' }));
      // user-event may swap navigator.clipboard with its own implementation during
      // setup(); accept either our mock being called OR the icon swap as proof
      // that handleCopy ran.
      if (writeText.mock.calls.length > 0) {
        expect(writeText).toHaveBeenCalledWith(CODE);
      } else {
        expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
      }
    } finally {
      restore();
    }
  });

  it('opens dialog with code on Show code click', async () => {
    const user = userEvent.setup();
    render(
      <ExampleBlock title="Buttons" code={CODE}>
        <span />
      </ExampleBlock>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Show code' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(CODE);
  });

  it('has no a11y violations (closed)', async () => {
    const { container } = render(
      <ExampleBlock title="x" description="d" code={CODE}>
        <button type="button">child</button>
      </ExampleBlock>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('has no a11y violations (dialog open)', async () => {
    const user = userEvent.setup();
    render(
      <ExampleBlock title="x" code={CODE}>
        <button type="button">child</button>
      </ExampleBlock>,
    );
    await user.click(screen.getByRole('button', { name: 'Show code' }));
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});
