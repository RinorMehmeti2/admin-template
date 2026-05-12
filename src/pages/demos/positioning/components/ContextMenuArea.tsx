import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/navigation/ContextMenu';

export function ContextMenuArea() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          tabIndex={0}
          role="button"
          aria-label="Right-click anywhere — even at corners"
          className="grid h-48 place-items-center rounded-lg border border-dashed border-border bg-surface-muted/40 text-sm text-foreground-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Right-click anywhere — including the corners — and the menu will clamp to the viewport.
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Open</ContextMenuItem>
        <ContextMenuItem>Duplicate</ContextMenuItem>
        <ContextMenuItem>Rename</ContextMenuItem>
        <ContextMenuItem>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
