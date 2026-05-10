import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SplitLayout } from './SplitLayout';

function renderSplit(props?: Partial<Parameters<typeof SplitLayout>[0]>) {
  return render(
    <SplitLayout
      left={<div data-testid="left-content">Left</div>}
      right={<div data-testid="right-content">Right</div>}
      {...props}
    />,
  );
}

describe('SplitLayout', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders both panes with the default left width', () => {
    renderSplit();
    expect(screen.getByTestId('left-content')).toBeInTheDocument();
    expect(screen.getByTestId('right-content')).toBeInTheDocument();
    const separator = screen.getByRole('separator');
    expect(separator).toHaveAttribute('aria-valuenow', '320');
    expect(separator).toHaveAttribute('aria-valuemin', '200');
    expect(separator).toHaveAttribute('aria-valuemax', '600');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('keyboard ArrowLeft / ArrowRight resize the left pane in 8px steps', async () => {
    renderSplit();
    const sep = screen.getByRole('separator');
    sep.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(sep).toHaveAttribute('aria-valuenow', '328');
    await userEvent.keyboard('{ArrowLeft>3}');
    expect(sep).toHaveAttribute('aria-valuenow', '304');
  });

  it('Shift+Arrow uses a larger step (32px)', async () => {
    renderSplit();
    const sep = screen.getByRole('separator');
    sep.focus();
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(sep).toHaveAttribute('aria-valuenow', '352');
  });

  it('clamps to min when ArrowLeft would underflow', async () => {
    renderSplit({ defaultLeftWidth: 210, minLeftWidth: 200 });
    const sep = screen.getByRole('separator');
    sep.focus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(sep).toHaveAttribute('aria-valuenow', '200');
  });

  it('Home / End jump to min / max', async () => {
    renderSplit();
    const sep = screen.getByRole('separator');
    sep.focus();
    await userEvent.keyboard('{End}');
    expect(sep).toHaveAttribute('aria-valuenow', '600');
    await userEvent.keyboard('{Home}');
    expect(sep).toHaveAttribute('aria-valuenow', '200');
  });

  it('Enter / Space toggle collapse via the separator', async () => {
    renderSplit();
    const sep = screen.getByRole('separator');
    sep.focus();
    expect(screen.getByRole('button', { name: 'Collapse left pane' })).toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Expand left pane' })).toBeInTheDocument();
    // Left content is removed when fully collapsed.
    expect(screen.queryByTestId('left-content')).toBeNull();
    await userEvent.keyboard(' ');
    expect(screen.getByTestId('left-content')).toBeInTheDocument();
  });

  it('clicking the chevron toggle collapses / expands', async () => {
    renderSplit();
    const collapseBtn = screen.getByRole('button', { name: 'Collapse left pane' });
    await userEvent.click(collapseBtn);
    expect(screen.queryByTestId('left-content')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Expand left pane' }));
    expect(screen.getByTestId('left-content')).toBeInTheDocument();
  });

  it('persists width + collapsed to localStorage when persistKey is set', async () => {
    const KEY = 'split-test-1';
    const { unmount } = renderSplit({ persistKey: KEY });
    const sep = screen.getByRole('separator');
    sep.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await userEvent.click(screen.getByRole('button', { name: 'Collapse left pane' }));

    const saved = window.localStorage.getItem(KEY);
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved ?? '{}') as { width: number; collapsed: boolean };
    expect(parsed.width).toBe(336);
    expect(parsed.collapsed).toBe(true);

    // Re-mount with the same key — should hydrate from storage.
    unmount();
    render(
      <SplitLayout
        persistKey={KEY}
        left={<div data-testid="left-content">L</div>}
        right={<div data-testid="right-content">R</div>}
      />,
    );
    // Collapsed → no left content visible.
    expect(screen.queryByTestId('left-content')).toBeNull();
    expect(screen.getByRole('button', { name: 'Expand left pane' })).toBeInTheDocument();
  });

  it('respects controlled collapsed prop', async () => {
    const { rerender } = render(
      <SplitLayout
        left={<div data-testid="left-content">L</div>}
        right={<div data-testid="right-content">R</div>}
        collapsed
      />,
    );
    expect(screen.queryByTestId('left-content')).toBeNull();
    rerender(
      <SplitLayout
        left={<div data-testid="left-content">L</div>}
        right={<div data-testid="right-content">R</div>}
        collapsed={false}
      />,
    );
    expect(screen.getByTestId('left-content')).toBeInTheDocument();
  });

  it('hides the divider when both resizable and collapsible are false', () => {
    renderSplit({ resizable: false, collapsible: false });
    expect(screen.queryByRole('separator')).toBeNull();
  });

  it('survives malformed persisted JSON (clamps + ignores)', () => {
    const KEY = 'split-malformed';
    window.localStorage.setItem(KEY, '{not json');
    act(() => {
      renderSplit({ persistKey: KEY });
    });
    // Falls back to default width.
    expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '320');
  });
});
