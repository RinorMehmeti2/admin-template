import { useState } from 'react';
import { Bell, Phone, Smartphone } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/data-display';
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from '@/components/feedback/BottomSheet';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/feedback/Drawer';
import { Input } from '@/components/forms/Input';
import { Label } from '@/components/forms/Label';
import { useToast } from '@/context/ToastProvider';

/*
 * /mobile-preview — showcase mobile-native behaviors. Resize the viewport to
 * &lt;768px (or open DevTools device emulation) for the full effect.
 */

export function MobilePreviewPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mobile preview</h1>
        <p className="mt-1 text-foreground-muted">
          Bottom sheets, swipe-to-dismiss, responsive drawer, and bumped tap targets. Resize the
          viewport below the <code className="font-mono text-xs">md</code> breakpoint to see the
          mobile behavior.
        </p>
      </header>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>BottomSheet</CardTitle>
          <CardDescription>
            Drag the grab handle between snap points. Swipe down past the lowest snap to dismiss.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BottomSheetDemo />
        </CardContent>
      </Card>

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

      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Toast swipe-to-dismiss</CardTitle>
          <CardDescription>
            On touch devices, swipe a toast to the right past the threshold to dismiss it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToastDemo />
        </CardContent>
      </Card>

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
    </div>
  );
}

function BottomSheetDemo() {
  const [snap, setSnap] = useState(25);
  return (
    <BottomSheet snapPoints={[25, 50, 90]} snap={snap} onSnapChange={setSnap}>
      <BottomSheetTrigger>
        <Button>Open bottom sheet</Button>
      </BottomSheetTrigger>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>New task</BottomSheetTitle>
        </BottomSheetHeader>
        <BottomSheetBody>
          <p className="mb-3 text-sm text-foreground-muted">
            Active snap: <strong>{snap}vh</strong>. Drag the handle.
          </p>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="task-title">Title</Label>
              <Input id="task-title" placeholder="Pick up groceries" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="task-note">Note</Label>
              <Input id="task-note" placeholder="Optional" />
            </div>
          </div>
        </BottomSheetBody>
        <BottomSheetFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Save</Button>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  );
}

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

function ToastDemo() {
  const { toast } = useToast();
  return (
    <div className="flex gap-2">
      <Button onClick={() => toast.info('Swipe me right →', { duration: 0 })}>Show toast</Button>
      <Button variant="outline" onClick={() => toast.success('Saved')}>
        Quick toast
      </Button>
    </div>
  );
}
