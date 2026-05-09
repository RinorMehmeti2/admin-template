import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useRef, useEffect } from 'react';
import { render, act } from '@testing-library/react';
import {
  usePosition,
  usePositionAtPoint,
  resolvePosition,
  type Placement,
  type Boundary,
} from '@/hooks/usePosition';

/* -------------------------------------------------------------------------- */
/*  Helpers — drive layout in jsdom by stubbing getBoundingClientRect           */
/* -------------------------------------------------------------------------- */

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function stubRect(el: HTMLElement, box: Box): void {
  el.getBoundingClientRect = () =>
    ({
      x: box.x,
      y: box.y,
      left: box.x,
      top: box.y,
      right: box.x + box.width,
      bottom: box.y + box.height,
      width: box.width,
      height: box.height,
      toJSON: () => ({}),
    }) as DOMRect;
}

function setViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
  Object.defineProperty(window, 'scrollX', { configurable: true, value: 0 });
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
}

interface DemoProps {
  placement: Placement;
  triggerBox: Box;
  contentBox: Box;
  flip?: boolean;
  shift?: boolean;
  padding?: number;
  boundary?: Boundary;
  offset?: number;
  onUpdate: (state: { x: number; y: number; placement: Placement; ready: boolean }) => void;
}

function Demo({
  placement,
  triggerBox,
  contentBox,
  flip,
  shift,
  padding,
  boundary,
  offset,
  onUpdate,
}: DemoProps) {
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger.current !== null) stubRect(trigger.current, triggerBox);
    if (content.current !== null) stubRect(content.current, contentBox);
  });

  const opts: Parameters<typeof usePosition>[2] = {
    placement,
    offset: offset ?? 0,
  };
  if (flip !== undefined) opts.flip = flip;
  if (shift !== undefined) opts.shift = shift;
  if (padding !== undefined) opts.padding = padding;
  if (boundary !== undefined) opts.boundary = boundary;
  const pos = usePosition(trigger, content, opts);

  useEffect(() => {
    onUpdate(pos);
  }, [pos, onUpdate]);

  return (
    <div>
      <button ref={trigger}>trigger</button>
      <div ref={content} data-testid="content" />
    </div>
  );
}

async function renderAndSettle(
  props: Omit<DemoProps, 'onUpdate'>,
): Promise<{ x: number; y: number; placement: Placement; ready: boolean }> {
  let last = { x: 0, y: 0, placement: props.placement, ready: false };
  await act(async () => {
    render(<Demo {...props} onUpdate={(s) => (last = s)} />);
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 30));
  });
  return last;
}

/* -------------------------------------------------------------------------- */

describe('usePosition — basic', () => {
  beforeEach(() => setViewport(1000, 800));

  it('flips ready=true after first measurement', async () => {
    const result = await renderAndSettle({
      placement: 'bottom-start',
      triggerBox: { x: 100, y: 100, width: 80, height: 32 },
      contentBox: { x: 0, y: 0, width: 200, height: 100 },
    });
    expect(result.ready).toBe(true);
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
      const result = await renderAndSettle({
        placement: p,
        triggerBox: { x: 400, y: 300, width: 80, height: 32 },
        contentBox: { x: 0, y: 0, width: 120, height: 60 },
        flip: false,
        shift: false,
      });
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
      expect(result.placement).toBe(p);
    }
  });
});

describe('usePosition — flip', () => {
  beforeEach(() => setViewport(1000, 800));

  it('flips bottom → top when no room below', async () => {
    const result = await renderAndSettle({
      placement: 'bottom-start',
      offset: 4,
      // Trigger near bottom: 800 - 32 = 768
      triggerBox: { x: 100, y: 770, width: 80, height: 30 },
      contentBox: { x: 0, y: 0, width: 200, height: 100 },
    });
    expect(result.placement).toBe('top-start');
  });

  it('flips top → bottom when no room above', async () => {
    const result = await renderAndSettle({
      placement: 'top-start',
      offset: 4,
      triggerBox: { x: 100, y: 4, width: 80, height: 30 },
      contentBox: { x: 0, y: 0, width: 200, height: 100 },
    });
    expect(result.placement).toBe('bottom-start');
  });

  it('flips right → left when no room to the right', async () => {
    const result = await renderAndSettle({
      placement: 'right',
      offset: 4,
      triggerBox: { x: 950, y: 300, width: 40, height: 32 },
      contentBox: { x: 0, y: 0, width: 200, height: 100 },
    });
    expect(result.placement).toBe('left');
  });

  it('flips left → right when no room to the left', async () => {
    const result = await renderAndSettle({
      placement: 'left',
      offset: 4,
      triggerBox: { x: 10, y: 300, width: 40, height: 32 },
      contentBox: { x: 0, y: 0, width: 200, height: 100 },
    });
    expect(result.placement).toBe('right');
  });

  it('does not flip when there is room', async () => {
    const result = await renderAndSettle({
      placement: 'bottom-start',
      offset: 4,
      triggerBox: { x: 100, y: 100, width: 80, height: 32 },
      contentBox: { x: 0, y: 0, width: 200, height: 100 },
    });
    expect(result.placement).toBe('bottom-start');
  });
});

describe('usePosition — shift', () => {
  beforeEach(() => setViewport(1000, 800));

  it('clamps x on the perpendicular axis when content overflows the right edge', async () => {
    const result = await renderAndSettle({
      placement: 'bottom-start',
      offset: 0,
      padding: 8,
      // Trigger at right edge — bottom-start would put content.left at 950,
      // pushing content.right past 1000.
      triggerBox: { x: 950, y: 100, width: 30, height: 30 },
      contentBox: { x: 0, y: 0, width: 200, height: 100 },
    });
    // shift clamps to viewport.right - padding - content.width = 1000 - 8 - 200 = 792
    expect(result.x).toBe(792);
  });

  it('clamps x on the perpendicular axis when content overflows the left edge', async () => {
    const result = await renderAndSettle({
      placement: 'bottom-end',
      offset: 0,
      padding: 8,
      // Trigger at left edge — bottom-end would put content.left at trigger.right - width = 30 - 200 = -170.
      triggerBox: { x: 0, y: 100, width: 30, height: 30 },
      contentBox: { x: 0, y: 0, width: 200, height: 100 },
    });
    // shift clamps to viewport.left + padding = 8
    expect(result.x).toBe(8);
  });

  it('clamps y on the perpendicular axis for left/right placements', async () => {
    const result = await renderAndSettle({
      placement: 'right',
      offset: 0,
      padding: 8,
      // Trigger near top — right places y = trigger.top + (trigger.height - content.height)/2
      // = 0 + (30 - 200)/2 = -85, content overflows top.
      triggerBox: { x: 200, y: 0, width: 30, height: 30 },
      contentBox: { x: 0, y: 0, width: 100, height: 200 },
    });
    expect(result.y).toBe(8);
  });
});

describe('usePosition — boundary', () => {
  beforeEach(() => setViewport(2000, 1500));

  it('uses a custom boundary element instead of the viewport', async () => {
    // Build a constrained boundary element at 0..400 wide.
    const boundaryEl = document.createElement('div');
    document.body.appendChild(boundaryEl);
    stubRect(boundaryEl, { x: 0, y: 0, width: 400, height: 400 });

    const result = await renderAndSettle({
      placement: 'bottom-start',
      offset: 0,
      padding: 8,
      boundary: boundaryEl,
      // Trigger near right edge of the *boundary* (not viewport).
      triggerBox: { x: 380, y: 100, width: 30, height: 30 },
      contentBox: { x: 0, y: 0, width: 200, height: 100 },
    });
    // shift clamps to 400 - 8 - 200 = 192 (not 1792 from the viewport).
    expect(result.x).toBe(192);
    document.body.removeChild(boundaryEl);
  });
});

describe('usePosition — pure resolver edge cases', () => {
  it('content larger than the boundary still returns a position (clamped to min)', () => {
    const trigger = { left: 100, top: 100, right: 200, bottom: 130, width: 100, height: 30 };
    const content = { left: 0, top: 0, right: 1200, bottom: 900, width: 1200, height: 900 };
    const boundary = { left: 0, top: 0, right: 1000, bottom: 800, width: 1000, height: 800 };
    const result = resolvePosition(trigger, content, boundary, {
      placement: 'bottom-start',
      offset: 0,
      flip: true,
      shift: true,
      padding: 8,
    });
    // max < min → clamp returns min (= padding).
    expect(result.x).toBe(8);
    expect(typeof result.y).toBe('number');
  });

  it('keeps requested placement when both flip and shift are disabled', () => {
    const trigger = { left: 950, top: 770, right: 980, bottom: 800, width: 30, height: 30 };
    const content = { left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100 };
    const boundary = { left: 0, top: 0, right: 1000, bottom: 800, width: 1000, height: 800 };
    const result = resolvePosition(trigger, content, boundary, {
      placement: 'bottom-start',
      offset: 0,
      flip: false,
      shift: false,
      padding: 8,
    });
    expect(result.placement).toBe('bottom-start');
    expect(result.x).toBe(950);
    expect(result.y).toBe(800);
  });
});

describe('usePositionAtPoint', () => {
  beforeEach(() => setViewport(1000, 800));
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('clamps cursor-anchored content to the viewport', async () => {
    function CursorDemo({
      point,
      onUpdate,
    }: {
      point: { x: number; y: number };
      onUpdate: (s: { x: number; y: number; placement: Placement }) => void;
    }) {
      const content = useRef<HTMLDivElement>(null);
      useEffect(() => {
        if (content.current !== null)
          stubRect(content.current, { x: 0, y: 0, width: 200, height: 150 });
      });
      const pos = usePositionAtPoint(content, {
        point,
        placement: 'bottom-start',
        offset: 0,
        padding: 8,
      });
      useEffect(() => {
        onUpdate(pos);
      }, [pos, onUpdate]);
      return <div ref={content} />;
    }

    let last = { x: 0, y: 0, placement: 'bottom-start' as Placement };
    await act(async () => {
      render(<CursorDemo point={{ x: 950, y: 100 }} onUpdate={(s) => (last = s)} />);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    // 1000 - 8 - 200 = 792
    expect(last.x).toBe(792);
  });
});
