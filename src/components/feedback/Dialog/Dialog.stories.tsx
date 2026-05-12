import { Button } from '@/components/primitives/Button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog';

export default { title: 'Feedback/Dialog', component: Dialog };

export const Default = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update profile</DialogTitle>
          <DialogDescription>Make changes to your profile here.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-foreground-muted">Form fields would go here.</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Sizes = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((s) => (
        <Dialog key={s}>
          <DialogTrigger>
            <Button variant="outline">{s}</Button>
          </DialogTrigger>
          <DialogContent size={s}>
            <DialogHeader>
              <DialogTitle>Size: {s}</DialogTitle>
            </DialogHeader>
            <DialogBody>Lorem ipsum dolor sit amet.</DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button>OK</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  ),
};

export const Variants = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['default', 'info', 'success', 'warning', 'danger'] as const).map((v) => (
        <Dialog key={v}>
          <DialogTrigger>
            <Button variant="outline">{v}</Button>
          </DialogTrigger>
          <DialogContent variant={v}>
            <DialogHeader>
              <DialogTitle>Variant: {v}</DialogTitle>
              <DialogDescription>
                Colored top accent communicates tone (info, success, warning, danger).
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p className="text-sm text-foreground-muted">
                Use sparingly for system-level dialogs that need urgency or status cues.
              </p>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button>OK</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  ),
};

export const Locked = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <Button>Open locked dialog</Button>
      </DialogTrigger>
      <DialogContent variant="warning" closeOnOverlayClick={false} closeOnEscape={false}>
        <DialogHeader>
          <DialogTitle>Confirm required</DialogTitle>
          <DialogDescription>
            This dialog can only be dismissed via the close buttons — clicking the backdrop and
            pressing Escape are disabled.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-foreground-muted">
            Use for destructive flows or wizards where accidental dismissal would lose work.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="danger">Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
