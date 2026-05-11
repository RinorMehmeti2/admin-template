import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useState } from 'react';
import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { KanbanBoard } from './Kanban';
import type { KanbanColumnDef } from './Kanban.types';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

interface Task {
  id: string;
  col: string;
  title: string;
  type?: string;
}

function pointer(
  type: string,
  pointerId: number,
  clientX: number,
  clientY: number,
  opts: Partial<PointerEventInit> = {},
): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId,
    clientX,
    clientY,
    button: 0,
    ...opts,
  });
}

function mockRect(
  el: HTMLElement,
  rect: { left: number; top: number; width: number; height: number },
): void {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left: rect.left,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    width: rect.width,
    height: rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  } as DOMRect);
}

function stubPointerCapture(el: HTMLElement): void {
  el.setPointerCapture = vi.fn();
  el.releasePointerCapture = vi.fn();
}

const COLUMNS: ReadonlyArray<KanbanColumnDef> = [
  { id: 'a', title: 'Col A' },
  { id: 'b', title: 'Col B' },
];

interface HarnessProps {
  columns?: ReadonlyArray<KanbanColumnDef>;
  initialItems?: ReadonlyArray<Task>;
  onMoveSpy?: (itemId: string, from: string, to: string, idx: number) => void;
  onAddCard?: (columnId: string) => void;
  allowReorderWithinColumn?: boolean;
  emptyMessage?: string;
}

function Harness(props: HarnessProps) {
  const [items, setItems] = useState<ReadonlyArray<Task>>(
    props.initialItems ?? [
      { id: 't1', col: 'a', title: 'Task 1' },
      { id: 't2', col: 'a', title: 'Task 2' },
      { id: 't3', col: 'b', title: 'Task 3' },
    ],
  );

  const onMove = (itemId: string, from: string, to: string, idx: number) => {
    props.onMoveSpy?.(itemId, from, to, idx);
    setItems((prev) => {
      const moving = prev.find((p) => p.id === itemId);
      if (moving === undefined) return prev;
      const without = prev.filter((p) => p.id !== itemId);
      const target = without.filter((p) => p.col === to);
      const others = without.filter((p) => p.col !== to);
      const next = [...target];
      next.splice(idx, 0, { ...moving, col: to });
      return [...others, ...next];
    });
  };

  return (
    <KanbanBoard<Task>
      columns={props.columns ?? COLUMNS}
      items={items}
      getItemId={(it) => it.id}
      getItemColumn={(it) => it.col}
      getItemType={(it) => it.type ?? 'card'}
      getCardLabel={(it) => it.title}
      renderCard={(it) => <span data-testid={`card-content-${it.id}`}>{it.title}</span>}
      onItemMove={onMove}
      {...(props.onAddCard !== undefined ? { onAddCard: props.onAddCard } : {})}
      {...(props.allowReorderWithinColumn !== undefined
        ? { allowReorderWithinColumn: props.allowReorderWithinColumn }
        : {})}
      {...(props.emptyMessage !== undefined ? { emptyColumnMessage: props.emptyMessage } : {})}
    />
  );
}

function getCardHandle(id: string): HTMLElement {
  // The KanbanCard root carries data-kanban-card-id; useDraggable wires its
  // pointerdown / keydown handlers to that element.
  const el = document.querySelector<HTMLElement>(`[data-kanban-card-id="${id}"]`);
  if (el === null) throw new Error(`card ${id} not found`);
  return el;
}

function getColumnEl(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-kanban-column-id="${id}"]`);
  if (el === null) throw new Error(`column ${id} not found`);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

/* -------------------------------------------------------------------------- */
/*  Tests                                                                     */
/* -------------------------------------------------------------------------- */

describe('KanbanBoard — rendering', () => {
  it('renders each column with its title + card count badge', () => {
    render(<Harness />);
    expect(screen.getByRole('group', { name: 'Kanban board' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Col A' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Col B' })).toBeInTheDocument();
    expect(screen.getByLabelText('2 cards')).toBeInTheDocument();
    expect(screen.getByLabelText('1 cards')).toBeInTheDocument();
  });

  it('renders cards via renderCard, one per item, in their assigned columns', () => {
    render(<Harness />);
    const colA = getColumnEl('a');
    const colB = getColumnEl('b');
    expect(within(colA).getByTestId('card-content-t1')).toBeInTheDocument();
    expect(within(colA).getByTestId('card-content-t2')).toBeInTheDocument();
    expect(within(colB).getByTestId('card-content-t3')).toBeInTheDocument();
  });

  it('uses semantic aria-roledescription on column + card', () => {
    render(<Harness />);
    expect(getColumnEl('a').getAttribute('aria-roledescription')).toBe('Kanban column');
    expect(getCardHandle('t1').getAttribute('aria-roledescription')).toBe('Draggable card');
  });

  it('renders the emptyColumnMessage when a column has no items', () => {
    render(
      <Harness
        initialItems={[{ id: 't1', col: 'a', title: 'Task 1' }]}
        emptyMessage="Nothing here yet"
      />,
    );
    const colB = getColumnEl('b');
    expect(within(colB).getByText('Nothing here yet')).toBeInTheDocument();
  });
});

describe('KanbanBoard — pointer drag', () => {
  it('fires onItemMove when a card is dragged from col A to col B', () => {
    const spy = vi.fn();
    render(<Harness onMoveSpy={spy} />);
    const card = getCardHandle('t1');
    const colA = getColumnEl('a');
    const colB = getColumnEl('b');
    mockRect(card, { left: 0, top: 0, width: 240, height: 40 });
    mockRect(colA, { left: 0, top: 0, width: 280, height: 400 });
    mockRect(colB, { left: 300, top: 0, width: 280, height: 400 });
    stubPointerCapture(card);

    act(() => card.dispatchEvent(pointer('pointerdown', 1, 100, 20)));
    act(() => window.dispatchEvent(pointer('pointermove', 1, 110, 25))); // cross threshold
    act(() => window.dispatchEvent(pointer('pointermove', 1, 420, 100))); // over col B
    act(() => window.dispatchEvent(pointer('pointerup', 1, 420, 100)));

    expect(spy).toHaveBeenCalledTimes(1);
    const args = spy.mock.calls[0]!;
    expect(args[0]).toBe('t1');
    expect(args[1]).toBe('a');
    expect(args[2]).toBe('b');
    expect(typeof args[3]).toBe('number');
  });

  it('reorder within column fires onItemMove with fromColId === toColId', () => {
    const spy = vi.fn();
    render(<Harness onMoveSpy={spy} />);
    const card = getCardHandle('t1');
    const card2 = getCardHandle('t2');
    const colA = getColumnEl('a');
    mockRect(card, { left: 0, top: 0, width: 240, height: 40 });
    mockRect(card2, { left: 0, top: 60, width: 240, height: 40 });
    mockRect(colA, { left: 0, top: 0, width: 280, height: 400 });
    stubPointerCapture(card);

    act(() => card.dispatchEvent(pointer('pointerdown', 1, 100, 20)));
    act(() => window.dispatchEvent(pointer('pointermove', 1, 110, 25))); // start
    // Move past t2's midpoint (t2 top 60, mid 80) → slot 2 (after t2)
    act(() => window.dispatchEvent(pointer('pointermove', 1, 110, 120)));
    act(() => window.dispatchEvent(pointer('pointerup', 1, 110, 120)));

    expect(spy).toHaveBeenCalledTimes(1);
    const [, from, to, idx] = spy.mock.calls[0]!;
    expect(from).toBe('a');
    expect(to).toBe('a');
    expect(idx).toBe(2);
  });

  it('renders a drop indicator inside the over column at the correct slot', () => {
    render(<Harness />);
    const card = getCardHandle('t1');
    const t3 = getCardHandle('t3');
    const colA = getColumnEl('a');
    const colB = getColumnEl('b');
    mockRect(card, { left: 0, top: 0, width: 240, height: 40 });
    mockRect(t3, { left: 300, top: 0, width: 240, height: 40 });
    mockRect(colA, { left: 0, top: 0, width: 280, height: 400 });
    mockRect(colB, { left: 300, top: 0, width: 280, height: 400 });
    stubPointerCapture(card);

    act(() => card.dispatchEvent(pointer('pointerdown', 1, 100, 20)));
    act(() => window.dispatchEvent(pointer('pointermove', 1, 110, 25)));
    // Move below t3's midpoint → slot 1 (after t3) inside col B
    act(() => window.dispatchEvent(pointer('pointermove', 1, 420, 120)));

    const indicators = colB.querySelectorAll('[data-kanban-drop-indicator]');
    expect(indicators.length).toBe(1);
    // No indicator in col A while pointer is over col B
    expect(colA.querySelectorAll('[data-kanban-drop-indicator]').length).toBe(0);

    act(() => window.dispatchEvent(pointer('pointerup', 1, 420, 120)));
  });

  it('does not fire onItemMove when the column does not accept the card type', () => {
    const spy = vi.fn();
    const cols: ReadonlyArray<KanbanColumnDef> = [
      { id: 'a', title: 'Col A' },
      { id: 'b', title: 'Col B', accept: 'bug' },
    ];
    render(
      <Harness
        columns={cols}
        initialItems={[{ id: 't1', col: 'a', title: 'Task 1', type: 'card' }]}
        onMoveSpy={spy}
      />,
    );
    const card = getCardHandle('t1');
    const colB = getColumnEl('b');
    mockRect(card, { left: 0, top: 0, width: 240, height: 40 });
    mockRect(getColumnEl('a'), { left: 0, top: 0, width: 280, height: 400 });
    mockRect(colB, { left: 300, top: 0, width: 280, height: 400 });
    stubPointerCapture(card);

    act(() => card.dispatchEvent(pointer('pointerdown', 1, 100, 20)));
    act(() => window.dispatchEvent(pointer('pointermove', 1, 110, 25)));
    act(() => window.dispatchEvent(pointer('pointermove', 1, 420, 100)));
    act(() => window.dispatchEvent(pointer('pointerup', 1, 420, 100)));

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('KanbanBoard — keyboard drag', () => {
  it('Space picks up, ArrowRight moves to next column, Enter drops', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness onMoveSpy={spy} />);
    const card = getCardHandle('t1');
    mockRect(card, { left: 0, top: 0, width: 240, height: 40 });
    mockRect(getColumnEl('a'), { left: 0, top: 0, width: 280, height: 400 });
    mockRect(getColumnEl('b'), { left: 300, top: 0, width: 280, height: 400 });

    card.focus();
    await user.keyboard(' '); // pickup; auto-enters first ordered column (col A)
    await user.keyboard('{ArrowRight}'); // → col B
    await user.keyboard('{Enter}'); // drop

    expect(spy).toHaveBeenCalledTimes(1);
    const [id, from, to] = spy.mock.calls[0]!;
    expect(id).toBe('t1');
    expect(from).toBe('a');
    expect(to).toBe('b');
  });

  it('Escape during keyboard drag cancels (no onItemMove)', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness onMoveSpy={spy} />);
    const card = getCardHandle('t1');
    mockRect(card, { left: 0, top: 0, width: 240, height: 40 });
    mockRect(getColumnEl('a'), { left: 0, top: 0, width: 280, height: 400 });
    mockRect(getColumnEl('b'), { left: 300, top: 0, width: 280, height: 400 });

    card.focus();
    await user.keyboard(' ');
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Escape}');

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('KanbanBoard — add card affordance', () => {
  it('renders an Add card button when allowAddCard + onAddCard are set; click invokes onAddCard', async () => {
    const user = userEvent.setup();
    const onAddCard = vi.fn();
    const cols: ReadonlyArray<KanbanColumnDef> = [
      { id: 'a', title: 'Col A', allowAddCard: true },
      { id: 'b', title: 'Col B' },
    ];
    render(<Harness columns={cols} onAddCard={onAddCard} />);
    const btn = screen.getByRole('button', { name: 'Add card to Col A' });
    expect(screen.queryByRole('button', { name: 'Add card to Col B' })).toBeNull();
    await user.click(btn);
    expect(onAddCard).toHaveBeenCalledWith('a');
  });

  it('omits the Add card button when allowAddCard is false', () => {
    const onAddCard = vi.fn();
    const cols: ReadonlyArray<KanbanColumnDef> = [{ id: 'a', title: 'Col A' }];
    render(<Harness columns={cols} onAddCard={onAddCard} />);
    expect(screen.queryByRole('button', { name: 'Add card to Col A' })).toBeNull();
  });
});

describe('KanbanBoard — a11y', () => {
  it('passes axe in the idle state', async () => {
    const { container } = render(<Harness />);
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('passes axe while a card is held in keyboard drag mode', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    const card = getCardHandle('t1');
    mockRect(card, { left: 0, top: 0, width: 240, height: 40 });
    mockRect(getColumnEl('a'), { left: 0, top: 0, width: 280, height: 400 });
    mockRect(getColumnEl('b'), { left: 300, top: 0, width: 280, height: 400 });
    card.focus();
    await user.keyboard(' ');
    expect(await runAxe(container)).toHaveNoViolations();
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});
