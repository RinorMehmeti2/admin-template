import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRef, type ReactNode } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import {
  DragDropProvider,
  useDraggable,
  useDropTarget,
  type DragEventInfo,
} from '@/hooks/useDragAndDrop';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

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

interface DraggableProps {
  id: string;
  type?: string;
  data?: unknown;
  disabled?: boolean;
  label?: string;
}

function Draggable(props: DraggableProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useDraggable(ref, {
    id: props.id,
    type: props.type ?? 'card',
    data: props.data ?? { value: props.id },
    disabled: props.disabled === true,
    label: props.label ?? props.id,
  });
  return (
    <div
      ref={ref}
      role="button"
      aria-label={props.label ?? props.id}
      data-testid={`drag-${props.id}`}
      {...drag.handleProps}
    >
      {props.id}
    </div>
  );
}

interface DropZoneProps {
  id: string;
  accept?: string | ((t: string) => boolean);
  slotCount?: number;
  resolveSlot?: (x: number, y: number) => number;
  onDrop?: (ev: DragEventInfo) => void;
  onDragEnter?: (ev: DragEventInfo) => void;
  onDragLeave?: (ev: DragEventInfo) => void;
  label?: string;
  children?: ReactNode;
}

function DropZone(props: DropZoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const slotCount = props.slotCount;
  const drop = useDropTarget(ref, {
    id: props.id,
    accept: props.accept ?? 'card',
    label: props.label ?? props.id,
    ...(slotCount !== undefined ? { getSlotCount: () => slotCount } : {}),
    ...(props.resolveSlot !== undefined ? { resolvePointerSlot: props.resolveSlot } : {}),
    ...(props.onDrop !== undefined ? { onDrop: props.onDrop } : {}),
    ...(props.onDragEnter !== undefined ? { onDragEnter: props.onDragEnter } : {}),
    ...(props.onDragLeave !== undefined ? { onDragLeave: props.onDragLeave } : {}),
  });
  return (
    <div ref={ref} data-testid={`drop-${props.id}`} {...drop.targetProps}>
      <span data-testid={`drop-${props.id}-state`}>
        {drop.isOver ? `over slot=${drop.overSlotIndex}` : 'idle'}
      </span>
      {props.children}
    </div>
  );
}

function liveRegion(): HTMLElement | null {
  return document.querySelector('[data-dnd-live-region]');
}

beforeEach(() => {
  document.body.innerHTML = '';
});

/* -------------------------------------------------------------------------- */
/*  Tests                                                                     */
/* -------------------------------------------------------------------------- */

describe('useDragAndDrop — pointer mode', () => {
  it('fires onDrop with source data + target id after a pointer drag', () => {
    const onDrop = vi.fn();
    render(
      <DragDropProvider>
        <Draggable id="A" data={{ value: 'A' }} />
        <DropZone id="zone1" onDrop={onDrop} />
      </DragDropProvider>,
    );
    const handle = screen.getByTestId('drag-A');
    const zone = screen.getByTestId('drop-zone1');
    mockRect(handle, { left: 0, top: 0, width: 50, height: 50 });
    mockRect(zone, { left: 200, top: 0, width: 200, height: 100 });
    stubPointerCapture(handle);

    act(() => {
      handle.dispatchEvent(pointer('pointerdown', 1, 10, 10));
    });
    // First move below threshold — no drag yet
    act(() => {
      window.dispatchEvent(pointer('pointermove', 1, 12, 11));
    });
    // Cross threshold and enter the drop zone
    act(() => {
      window.dispatchEvent(pointer('pointermove', 1, 300, 50));
    });
    // Drop
    act(() => {
      window.dispatchEvent(pointer('pointerup', 1, 300, 50));
    });

    expect(onDrop).toHaveBeenCalledTimes(1);
    const ev = onDrop.mock.calls[0]?.[0] as DragEventInfo;
    expect(ev.source.id).toBe('A');
    expect(ev.source.data).toEqual({ value: 'A' });
    expect(ev.targetId).toBe('zone1');
    expect(ev.mode).toBe('pointer');
  });

  it('does not fire onDrop when the target does not accept the source type', () => {
    const onDrop = vi.fn();
    render(
      <DragDropProvider>
        <Draggable id="A" type="card" />
        <DropZone id="zone1" accept="folder" onDrop={onDrop} />
      </DragDropProvider>,
    );
    const handle = screen.getByTestId('drag-A');
    const zone = screen.getByTestId('drop-zone1');
    mockRect(handle, { left: 0, top: 0, width: 50, height: 50 });
    mockRect(zone, { left: 200, top: 0, width: 200, height: 100 });
    stubPointerCapture(handle);

    act(() => handle.dispatchEvent(pointer('pointerdown', 1, 10, 10)));
    act(() => window.dispatchEvent(pointer('pointermove', 1, 300, 50)));
    act(() => window.dispatchEvent(pointer('pointerup', 1, 300, 50)));

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('fires enter/leave when the pointer crosses target boundaries', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    render(
      <DragDropProvider>
        <Draggable id="A" />
        <DropZone id="zone1" onDragEnter={onEnter} onDragLeave={onLeave} />
      </DragDropProvider>,
    );
    const handle = screen.getByTestId('drag-A');
    const zone = screen.getByTestId('drop-zone1');
    mockRect(handle, { left: 0, top: 0, width: 50, height: 50 });
    mockRect(zone, { left: 200, top: 0, width: 200, height: 100 });
    stubPointerCapture(handle);

    act(() => handle.dispatchEvent(pointer('pointerdown', 1, 10, 10)));
    act(() => window.dispatchEvent(pointer('pointermove', 1, 300, 50))); // enter
    act(() => window.dispatchEvent(pointer('pointermove', 1, 100, 50))); // leave
    act(() => window.dispatchEvent(pointer('pointerup', 1, 100, 50))); // drop outside

    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('does not start a drag on small pointer travel (treat as click)', () => {
    const onDrop = vi.fn();
    render(
      <DragDropProvider>
        <Draggable id="A" />
        <DropZone id="zone1" onDrop={onDrop} />
      </DragDropProvider>,
    );
    const handle = screen.getByTestId('drag-A');
    const zone = screen.getByTestId('drop-zone1');
    mockRect(handle, { left: 0, top: 0, width: 50, height: 50 });
    mockRect(zone, { left: 200, top: 0, width: 200, height: 100 });
    stubPointerCapture(handle);

    act(() => handle.dispatchEvent(pointer('pointerdown', 1, 10, 10)));
    act(() => window.dispatchEvent(pointer('pointermove', 1, 12, 11))); // < 4px
    act(() => window.dispatchEvent(pointer('pointerup', 1, 12, 11)));

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('uses resolvePointerSlot to pick the slot index inside an ordered target', () => {
    const onDrop = vi.fn();
    render(
      <DragDropProvider>
        <Draggable id="A" />
        <DropZone
          id="zone1"
          slotCount={3}
          resolveSlot={(_x, y) => {
            // 0..100 → slot 0, 100..200 → slot 1, 200+ → slot 2
            if (y < 100) return 0;
            if (y < 200) return 1;
            return 2;
          }}
          onDrop={onDrop}
        />
      </DragDropProvider>,
    );
    const handle = screen.getByTestId('drag-A');
    const zone = screen.getByTestId('drop-zone1');
    mockRect(handle, { left: 0, top: 0, width: 50, height: 50 });
    mockRect(zone, { left: 0, top: 0, width: 400, height: 400 });
    stubPointerCapture(handle);

    act(() => handle.dispatchEvent(pointer('pointerdown', 1, 200, 0)));
    act(() => window.dispatchEvent(pointer('pointermove', 1, 200, 150))); // slot 1
    act(() => window.dispatchEvent(pointer('pointerup', 1, 200, 150)));

    const ev = onDrop.mock.calls[0]?.[0] as DragEventInfo;
    expect(ev.slotIndex).toBe(1);
  });

  it('cancels on pointercancel', () => {
    const onDrop = vi.fn();
    render(
      <DragDropProvider>
        <Draggable id="A" />
        <DropZone id="zone1" onDrop={onDrop} />
      </DragDropProvider>,
    );
    const handle = screen.getByTestId('drag-A');
    const zone = screen.getByTestId('drop-zone1');
    mockRect(handle, { left: 0, top: 0, width: 50, height: 50 });
    mockRect(zone, { left: 200, top: 0, width: 200, height: 100 });
    stubPointerCapture(handle);

    act(() => handle.dispatchEvent(pointer('pointerdown', 1, 10, 10)));
    act(() => window.dispatchEvent(pointer('pointermove', 1, 300, 50)));
    act(() => window.dispatchEvent(pointer('pointercancel', 1, 300, 50)));

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('emits SR announcements: pickup, over, drop', () => {
    render(
      <DragDropProvider>
        <Draggable id="A" label="Card A" />
        <DropZone id="zone1" label="Column One" />
      </DragDropProvider>,
    );
    const handle = screen.getByTestId('drag-A');
    const zone = screen.getByTestId('drop-zone1');
    mockRect(handle, { left: 0, top: 0, width: 50, height: 50 });
    mockRect(zone, { left: 200, top: 0, width: 200, height: 100 });
    stubPointerCapture(handle);

    act(() => handle.dispatchEvent(pointer('pointerdown', 1, 10, 10)));
    // Cross activation threshold but stay outside the drop zone.
    act(() => window.dispatchEvent(pointer('pointermove', 1, 80, 10)));
    expect(liveRegion()?.textContent).toContain('Picked up Card A');
    act(() => window.dispatchEvent(pointer('pointermove', 1, 300, 50)));
    expect(liveRegion()?.textContent).toContain('Over Column One');
    act(() => window.dispatchEvent(pointer('pointerup', 1, 300, 50)));
    expect(liveRegion()?.textContent).toContain('Dropped Card A on Column One');
  });
});

describe('useDragAndDrop — keyboard mode', () => {
  it('Space picks up, ArrowRight cycles targets, Enter drops', async () => {
    const onDrop = vi.fn();
    const user = userEvent.setup();
    render(
      <DragDropProvider>
        <Draggable id="A" label="Card A" />
        <DropZone id="zone1" label="Column 1" onDrop={onDrop} />
        <DropZone id="zone2" label="Column 2" onDrop={onDrop} />
      </DragDropProvider>,
    );
    const handle = screen.getByTestId('drag-A');
    mockRect(handle, { left: 0, top: 0, width: 50, height: 50 });
    mockRect(screen.getByTestId('drop-zone1'), { left: 0, top: 100, width: 200, height: 200 });
    mockRect(screen.getByTestId('drop-zone2'), { left: 220, top: 100, width: 200, height: 200 });

    handle.focus();
    await user.keyboard(' '); // pick up — defaults to first target (zone1)
    // Keyboard pickup immediately enters the first target; the most recent
    // announcement on the live region is the "over" one.
    expect(liveRegion()?.textContent).toContain('Over Column 1');
    await user.keyboard('{ArrowRight}'); // → zone2
    expect(liveRegion()?.textContent).toContain('Over Column 2');
    await user.keyboard('{Enter}'); // drop

    expect(onDrop).toHaveBeenCalledTimes(1);
    const ev = onDrop.mock.calls[0]?.[0] as DragEventInfo;
    expect(ev.targetId).toBe('zone2');
    expect(ev.mode).toBe('keyboard');
  });

  it('Escape cancels keyboard drag', async () => {
    const onDrop = vi.fn();
    const user = userEvent.setup();
    render(
      <DragDropProvider>
        <Draggable id="A" label="Card A" />
        <DropZone id="zone1" label="Column 1" onDrop={onDrop} />
      </DragDropProvider>,
    );
    const handle = screen.getByTestId('drag-A');
    mockRect(handle, { left: 0, top: 0, width: 50, height: 50 });
    mockRect(screen.getByTestId('drop-zone1'), { left: 0, top: 100, width: 200, height: 200 });

    handle.focus();
    await user.keyboard(' ');
    await user.keyboard('{Escape}');

    expect(onDrop).not.toHaveBeenCalled();
    expect(liveRegion()?.textContent).toContain('Cancelled drag of Card A');
  });

  it('ArrowDown / ArrowUp cycles slots within a target', async () => {
    const onDrop = vi.fn();
    const user = userEvent.setup();
    render(
      <DragDropProvider>
        <Draggable id="A" />
        <DropZone id="zone1" slotCount={4} onDrop={onDrop} />
      </DragDropProvider>,
    );
    const handle = screen.getByTestId('drag-A');
    mockRect(handle, { left: 0, top: 0, width: 50, height: 50 });
    mockRect(screen.getByTestId('drop-zone1'), { left: 0, top: 100, width: 200, height: 400 });

    handle.focus();
    await user.keyboard(' '); // pick up; slot 0
    await user.keyboard('{ArrowDown}'); // slot 1
    await user.keyboard('{ArrowDown}'); // slot 2
    await user.keyboard('{Enter}');

    const ev = onDrop.mock.calls[0]?.[0] as DragEventInfo;
    expect(ev.slotIndex).toBe(2);
  });

  it('disabled source does not start a drag', async () => {
    const onDrop = vi.fn();
    const user = userEvent.setup();
    render(
      <DragDropProvider>
        <Draggable id="A" disabled />
        <DropZone id="zone1" onDrop={onDrop} />
      </DragDropProvider>,
    );
    const handle = screen.getByTestId('drag-A');
    handle.focus();
    await user.keyboard(' ');
    await user.keyboard('{Enter}');
    expect(onDrop).not.toHaveBeenCalled();
  });
});

describe('useDragAndDrop — a11y', () => {
  it('passes axe in idle state', async () => {
    const { container } = render(
      <DragDropProvider>
        <Draggable id="A" label="Card A" />
        <DropZone id="zone1" label="Column 1" />
      </DragDropProvider>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });

  it('passes axe while a keyboard drag is in progress', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DragDropProvider>
        <Draggable id="A" label="Card A" />
        <DropZone id="zone1" label="Column 1" />
      </DragDropProvider>,
    );
    const handle = screen.getByTestId('drag-A');
    mockRect(handle, { left: 0, top: 0, width: 50, height: 50 });
    mockRect(screen.getByTestId('drop-zone1'), { left: 0, top: 100, width: 200, height: 200 });
    handle.focus();
    await user.keyboard(' ');
    expect(await runAxe(container)).toHaveNoViolations();
    // Also assert the live region body is valid.
    expect(await runAxe(document.body)).toHaveNoViolations();
  });
});
