import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from './ContextMenu';

export default { title: 'Navigation/ContextMenu', component: ContextMenu };

export const Default = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="grid h-40 w-72 place-items-center rounded-lg border border-dashed border-border bg-surface-muted text-sm text-foreground-muted">
          Right-click anywhere here
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Cut <ContextMenuShortcut>⌘X</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuItem>Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuItem>Paste <ContextMenuShortcut>⌘V</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
