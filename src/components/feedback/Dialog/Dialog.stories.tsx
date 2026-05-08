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
