import { Bell, Phone, Smartphone } from 'lucide-react';
import { IconButton } from '@/components/primitives/IconButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/data-display';

export function TapTargetsSection() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Tap targets</CardTitle>
        <CardDescription>
          Small icon buttons opt into <code className="font-mono text-xs">data-touch-target</code>.
          On coarse pointers a CSS rule lifts their hit area to 44×44 px.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <IconButton aria-label="Phone" size="sm" variant="outline">
          <Phone className="h-4 w-4" />
        </IconButton>
        <IconButton aria-label="Mobile" size="sm" variant="outline">
          <Smartphone className="h-4 w-4" />
        </IconButton>
        <IconButton aria-label="Bell" size="sm" variant="outline">
          <Bell className="h-4 w-4" />
        </IconButton>
      </CardContent>
    </Card>
  );
}
