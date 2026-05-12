import { Button } from '@/components/primitives/Button';

export function IntroView({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">FullscreenWorkspace</h1>
        <p className="mt-1 text-foreground-muted">
          A true full-viewport canvas with floating, draggable, collapsible panels. Use for visual
          editors, dashboard-edit modes, and design tools.
        </p>
      </header>
      <section className="space-y-3 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-base font-semibold">Try it</h2>
        <p className="text-sm text-foreground-muted">
          Open the workspace and drag the Layers / Properties panels around. Position is clamped
          to the canvas — drag a panel to a corner and the cursor will trail off but the panel
          sticks.
        </p>
        <Button onClick={onOpen}>Open workspace</Button>
      </section>
    </div>
  );
}
