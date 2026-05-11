import { useState } from 'react';
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from './BottomSheet';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/forms/Input';
import { Label } from '@/components/forms/Label';

export default { title: 'Feedback/BottomSheet', component: BottomSheet };

export function Default() {
  return (
    <BottomSheet>
      <BottomSheetTrigger>
        <Button>Open sheet</Button>
      </BottomSheetTrigger>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>Quick action</BottomSheetTitle>
        </BottomSheetHeader>
        <BottomSheetBody>
          <p className="text-sm text-foreground-muted">
            Drag the handle to resize between snap points. Swipe down past the lowest snap to
            dismiss.
          </p>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  );
}

export function ThreeSnapPoints() {
  const [snap, setSnap] = useState(25);
  return (
    <BottomSheet defaultOpen snapPoints={[25, 50, 90]} snap={snap} onSnapChange={setSnap}>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>Snap: {snap}vh</BottomSheetTitle>
        </BottomSheetHeader>
        <BottomSheetBody>
          <p className="text-sm text-foreground-muted">Drag the handle up/down to switch.</p>
          <div className="mt-2 space-y-1">
            {[25, 50, 90].map((s) => (
              <Button
                key={s}
                variant={snap === s ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSnap(s)}
              >
                {s}vh
              </Button>
            ))}
          </div>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  );
}

export function NoHandle() {
  return (
    <BottomSheet defaultOpen>
      <BottomSheetContent showHandle={false}>
        <BottomSheetHeader>
          <BottomSheetTitle>No grab handle</BottomSheetTitle>
        </BottomSheetHeader>
        <BottomSheetBody>
          <p className="text-sm text-foreground-muted">Use the close button or Escape.</p>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  );
}

export function WithFormContent() {
  return (
    <BottomSheet defaultOpen snapPoints={[50, 90]}>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>Create item</BottomSheetTitle>
        </BottomSheetHeader>
        <BottomSheetBody>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="bs-name">Name</Label>
              <Input id="bs-name" placeholder="Pick a name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bs-note">Note</Label>
              <Input id="bs-note" placeholder="Optional" />
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
