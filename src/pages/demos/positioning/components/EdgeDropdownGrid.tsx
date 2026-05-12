import { Button } from '@/components/primitives/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';

export function EdgeDropdownGrid() {
  const cells: Array<{
    label: string;
    placement: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  }> = [
    { label: 'Top-left', placement: 'bottom-start' },
    { label: 'Top-right', placement: 'bottom-end' },
    { label: 'Bottom-left', placement: 'top-start' },
    { label: 'Bottom-right', placement: 'top-end' },
  ];

  return (
    <div className="relative grid h-72 grid-cols-2 gap-2 rounded-lg border border-dashed border-border bg-surface-muted/40 p-3">
      {cells.map((cell) => (
        <div key={cell.label} className="flex items-start justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm">
                {cell.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side={cell.placement}>
              <DropdownMenuLabel>Resolved side appears in data-side</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
