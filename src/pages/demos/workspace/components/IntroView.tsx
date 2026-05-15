import { Button } from '@/components/primitives/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/data-display/Card';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';

export function IntroView({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="mx-auto max-w-[1400px]">
      <SimsPageHeader
        title="FullscreenWorkspace"
        description="A true full-viewport canvas with floating, draggable, collapsible panels. Use for visual editors, dashboard-edit modes, and design tools."
      />
      <Card variant="outlined">
        <CardHeader>
          <CardTitle className="text-base">Try it</CardTitle>
          <p className="mt-1 text-sm text-foreground-muted">
            Open the workspace and drag the Layers / Properties panels around. Position is clamped
            to the canvas — drag a panel to a corner and the cursor will trail off but the panel
            sticks.
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="primary" onClick={onOpen}>
            Open workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
