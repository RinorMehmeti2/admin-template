import { Badge } from '@/components/primitives/Badge';
import { Kbd } from '@/components/primitives/Kbd';
import { useCommandRegistry } from '@/components/overlays/CommandPalette';

export function ShowcaseHeader() {
  const { openPalette } = useCommandRegistry();
  return (
    <header className="flex flex-col gap-3">
      <Badge variant="primary" size="sm" className="self-start">
        Admin UI Template
      </Badge>
      <h1 className="text-3xl font-semibold tracking-tight">
        A fully owned component library for internal admin tools.
      </h1>
      <p className="max-w-2xl text-foreground-muted">
        Every primitive is built from scratch on React 19, Tailwind v4, and our own
        behavioral hooks — no headless library, no UI kit. Browse a category to see the
        pieces in action.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
        <button
          type="button"
          onClick={openPalette}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-foreground-muted shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span>Search commands</span>
          <span className="flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </div>
    </header>
  );
}
