import { useState } from 'react';
import { Button } from '@/components/primitives/Button';
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
import { Input } from '@/components/forms/Input';
import { Label } from '@/components/forms/Label';

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

export function BottomSheetSection() {
  return (
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
  );
}
