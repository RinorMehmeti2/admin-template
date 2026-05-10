import { describe, it, expect, vi } from 'vitest';
import { useRef } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  FullscreenWorkspace,
  WorkspaceCanvas,
  WorkspacePanel,
} from './FullscreenWorkspace';

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

function pointer(type: string, pointerId: number, clientX: number, clientY: number): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId,
    clientX,
    clientY,
    button: 0,
  });
}

/**
 * Mounts a workspace with one panel and stubs canvas + panel rects so drag
 * clamping has deterministic bounds in jsdom.
 */
function CanvasHarness({
  canvasBox,
  panelBox,
  defaultPosition,
  onPositionChange,
}: {
  canvasBox: Box;
  panelBox: Box;
  defaultPosition?: { x: number; y: number };
  onPositionChange?: (p: { x: number; y: number }) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <FullscreenWorkspace>
      <WorkspaceCanvas
        ref={(el) => {
          canvasRef.current = el;
          if (el !== null) stubRect(el, canvasBox);
        }}
      >
        <WorkspacePanel
          title="Layers"
          {...(defaultPosition !== undefined ? { defaultPosition } : {})}
          ref={(el) => {
            panelRef.current = el;
            if (el !== null) {
              stubRect(el, panelBox);
              // Report position via onAnimationStart hack? simpler: read style.
              const reported = {
                x: parseFloat(el.style.left || '0'),
                y: parseFloat(el.style.top || '0'),
              };
              onPositionChange?.(reported);
            }
          }}
        >
          panel body
        </WorkspacePanel>
      </WorkspaceCanvas>
    </FullscreenWorkspace>
  );
}

describe('WorkspacePanel', () => {
  it('renders inside a canvas with a draggable header and toggle', () => {
    render(
      <FullscreenWorkspace>
        <WorkspaceCanvas>
          <WorkspacePanel title="Layers">layers body</WorkspacePanel>
        </WorkspaceCanvas>
      </FullscreenWorkspace>,
    );
    expect(screen.getByRole('dialog', { name: 'Layers' })).toBeInTheDocument();
    expect(screen.getByRole('toolbar', { name: 'Move Layers' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse panel' })).toBeInTheDocument();
    expect(screen.getByText('layers body')).toBeInTheDocument();
  });

  it('toggles body via the chevron button (uses useDisclosure)', async () => {
    render(
      <FullscreenWorkspace>
        <WorkspaceCanvas>
          <WorkspacePanel title="Layers">layers body</WorkspacePanel>
        </WorkspaceCanvas>
      </FullscreenWorkspace>,
    );
    expect(screen.getByText('layers body')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse panel' }));
    expect(screen.queryByText('layers body')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Expand panel' }));
    expect(screen.getByText('layers body')).toBeInTheDocument();
  });

  it('clamps drag position to canvas bounds (right + bottom edges)', () => {
    render(
      <CanvasHarness
        canvasBox={{ x: 0, y: 0, width: 800, height: 600 }}
        panelBox={{ x: 0, y: 0, width: 240, height: 200 }}
        defaultPosition={{ x: 16, y: 16 }}
      />,
    );
    const handle = screen.getByRole('toolbar', { name: 'Move Layers' });
    handle.setPointerCapture = vi.fn();
    handle.releasePointerCapture = vi.fn();

    // Start drag at (100, 100). Move to (10000, 10000) — should clamp.
    act(() => {
      handle.dispatchEvent(pointer('pointerdown', 1, 100, 100));
    });
    act(() => {
      window.dispatchEvent(pointer('pointermove', 1, 10000, 10000));
    });
    act(() => {
      window.dispatchEvent(pointer('pointerup', 1, 10000, 10000));
    });

    const dialog = screen.getByRole('dialog', { name: 'Layers' });
    // Max x = canvas.width(800) - panel.width(240) = 560
    // Max y = canvas.height(600) - panel.height(200) = 400
    expect(dialog.style.left).toBe('560px');
    expect(dialog.style.top).toBe('400px');
  });

  it('clamps to (0,0) when dragged beyond top-left edge', () => {
    render(
      <CanvasHarness
        canvasBox={{ x: 0, y: 0, width: 800, height: 600 }}
        panelBox={{ x: 0, y: 0, width: 240, height: 200 }}
        defaultPosition={{ x: 100, y: 100 }}
      />,
    );
    const handle = screen.getByRole('toolbar', { name: 'Move Layers' });
    handle.setPointerCapture = vi.fn();
    handle.releasePointerCapture = vi.fn();

    act(() => {
      handle.dispatchEvent(pointer('pointerdown', 1, 200, 200));
    });
    act(() => {
      window.dispatchEvent(pointer('pointermove', 1, -10000, -10000));
    });
    act(() => {
      window.dispatchEvent(pointer('pointerup', 1, -10000, -10000));
    });

    const dialog = screen.getByRole('dialog', { name: 'Layers' });
    expect(dialog.style.left).toBe('0px');
    expect(dialog.style.top).toBe('0px');
  });

  it('multiple panels move independently', () => {
    render(
      <FullscreenWorkspace>
        <WorkspaceCanvas
          ref={(el) => {
            if (el !== null) stubRect(el, { x: 0, y: 0, width: 800, height: 600 });
          }}
        >
          <WorkspacePanel
            title="Layers"
            defaultPosition={{ x: 10, y: 10 }}
            ref={(el) => {
              if (el !== null) stubRect(el, { x: 0, y: 0, width: 200, height: 150 });
            }}
          >
            a
          </WorkspacePanel>
          <WorkspacePanel
            title="Properties"
            defaultPosition={{ x: 400, y: 200 }}
            ref={(el) => {
              if (el !== null) stubRect(el, { x: 0, y: 0, width: 200, height: 150 });
            }}
          >
            b
          </WorkspacePanel>
        </WorkspaceCanvas>
      </FullscreenWorkspace>,
    );
    const layers = screen.getByRole('dialog', { name: 'Layers' });
    const properties = screen.getByRole('dialog', { name: 'Properties' });

    const layersHandle = screen.getByRole('toolbar', { name: 'Move Layers' });
    layersHandle.setPointerCapture = vi.fn();
    layersHandle.releasePointerCapture = vi.fn();

    // Drag Layers only.
    act(() => {
      layersHandle.dispatchEvent(pointer('pointerdown', 1, 50, 50));
    });
    act(() => {
      window.dispatchEvent(pointer('pointermove', 1, 80, 60));
    });
    act(() => {
      window.dispatchEvent(pointer('pointerup', 1, 80, 60));
    });

    // Layers moved by (+30, +10): from (10, 10) → (40, 20).
    expect(layers.style.left).toBe('40px');
    expect(layers.style.top).toBe('20px');
    // Properties unchanged.
    expect(properties.style.left).toBe('400px');
    expect(properties.style.top).toBe('200px');
  });

  it('renders the close button when onClose is provided', async () => {
    const onClose = vi.fn();
    render(
      <FullscreenWorkspace>
        <WorkspaceCanvas>
          <WorkspacePanel title="Layers" onClose={onClose}>
            body
          </WorkspacePanel>
        </WorkspaceCanvas>
      </FullscreenWorkspace>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close panel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('FullscreenWorkspace', () => {
  it('renders multiple independent panels', () => {
    render(
      <FullscreenWorkspace>
        <WorkspaceCanvas>
          <WorkspacePanel title="A" defaultPosition={{ x: 0, y: 0 }}>
            a
          </WorkspacePanel>
          <WorkspacePanel title="B" defaultPosition={{ x: 200, y: 0 }}>
            b
          </WorkspacePanel>
          <WorkspacePanel title="C" defaultPosition={{ x: 0, y: 200 }}>
            c
          </WorkspacePanel>
        </WorkspaceCanvas>
      </FullscreenWorkspace>,
    );
    expect(screen.getByRole('dialog', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'B' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'C' })).toBeInTheDocument();
  });

  it('throws if a panel is rendered outside a canvas', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() =>
      render(
        <FullscreenWorkspace>
          <WorkspacePanel title="X">x</WorkspacePanel>
        </FullscreenWorkspace>,
      ),
    ).toThrow(/WorkspaceCanvas/);
    spy.mockRestore();
  });
});
