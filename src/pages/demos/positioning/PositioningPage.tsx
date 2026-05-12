import {
  ContextMenuArea,
  CustomBoundaryDemo,
  DraggableTooltip,
  EdgeDropdownGrid,
} from './components';

export function PositioningPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Positioning</h1>
        <p className="mt-1 text-sm text-foreground-subtle">
          Manual verification page for <code>usePosition</code>: flip on placement-axis overflow,
          shift on perpendicular-axis overflow, custom boundaries, and cursor-anchored menus.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Tooltip flip</h2>
        <DraggableTooltip initial={{ x: 50, y: 50 }} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">DropdownMenu near edges</h2>
        <p className="text-sm text-foreground-subtle">
          Open each menu and try scrolling the viewport — placements adapt automatically.
        </p>
        <EdgeDropdownGrid />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">ContextMenu at cursor</h2>
        <ContextMenuArea />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Custom boundary</h2>
        <CustomBoundaryDemo />
      </section>
    </div>
  );
}
