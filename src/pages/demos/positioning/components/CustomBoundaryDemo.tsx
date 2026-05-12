import { useCallback, useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';

export function CustomBoundaryDemo() {
  const boundaryRef = useRef<HTMLDivElement>(null);
  // Stable getter — read inside the hook's effect, never during render.
  const getBoundary = useCallback(() => boundaryRef.current ?? document.body, []);

  return (
    <div
      ref={boundaryRef}
      className="relative h-48 w-full overflow-hidden rounded-lg border border-dashed border-border bg-surface-muted/40 p-3"
    >
      <p className="text-xs text-foreground-subtle">
        Boundary is this dashed box, not the viewport. The dropdown shifts to stay inside.
      </p>
      <div className="absolute right-2 top-10">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm" leftIcon={<MoreVertical className="h-4 w-4" />}>
              Bounded menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom-start" boundary={getBoundary} padding={4}>
            <DropdownMenuLabel>Inside the dashed box</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>One</DropdownMenuItem>
            <DropdownMenuItem>Two</DropdownMenuItem>
            <DropdownMenuItem>Three</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
