import { Button } from '@/components/primitives/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/data-display';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/feedback/Drawer';

function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger>
        <Button variant="outline">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <p className="text-sm text-foreground-muted">
            Side-right on desktop, bottom-sheet on mobile (default <code>responsive=true</code>).
          </p>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export function DrawerSection() {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Drawer (responsive)</CardTitle>
        <CardDescription>
          On mobile this side-right drawer auto-converts to a bottom sheet style overlay with
          swipe-to-dismiss. On desktop it stays anchored to the right.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DrawerDemo />
      </CardContent>
    </Card>
  );
}
