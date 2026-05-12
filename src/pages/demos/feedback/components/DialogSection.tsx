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
} from '@/components/feedback';
import { Button } from '@/components/primitives/Button';
import { Section } from './Section';

export function DialogSection() {
  return (
    <Section title="Dialog">
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger>
            <Button>Default</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update profile</DialogTitle>
              <DialogDescription>Make changes to your profile here.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p className="text-sm text-foreground-muted">
                Form fields would normally go here. Try Tab — focus is trapped inside the dialog.
                Try Esc or click the backdrop — both close.
              </p>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>Save</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger>
            <Button variant="outline">Large</Button>
          </DialogTrigger>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>Large dialog</DialogTitle>
              <DialogDescription>
                Use for richer flows — long forms, side-by-side preview, embedded tables.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className="grid gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-md border border-border bg-surface-muted p-3">
                    <p className="text-sm font-medium text-foreground">Row {i + 1}</p>
                    <p className="text-xs text-foreground-muted">
                      Larger size keeps content readable without dominating the viewport.
                    </p>
                  </div>
                ))}
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>Save</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger>
            <Button variant="outline">XL</Button>
          </DialogTrigger>
          <DialogContent size="xl">
            <DialogHeader>
              <DialogTitle>Extra-large dialog</DialogTitle>
              <DialogDescription>Comfortable for dashboards or wizards.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p className="text-sm text-foreground-muted">
                Reach for `xl` when content needs breathing room. For near-fullscreen reach, use
                `size="full"` instead.
              </p>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger>
            <Button variant="outline">Full</Button>
          </DialogTrigger>
          <DialogContent size="full">
            <DialogHeader>
              <DialogTitle>Fullscreen dialog</DialogTitle>
              <DialogDescription>Edge-to-edge — leaves a small inset margin.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p className="text-sm text-foreground-muted">
                Use for media editors, document previews, or any flow where chrome would distract.
              </p>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger>
            <Button variant="outline">Info</Button>
          </DialogTrigger>
          <DialogContent variant="info">
            <DialogHeader>
              <DialogTitle>Heads up</DialogTitle>
              <DialogDescription>Informational tone — blue top accent.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p className="text-sm text-foreground-muted">Use for non-blocking system messages.</p>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Got it</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger>
            <Button variant="outline">Danger</Button>
          </DialogTrigger>
          <DialogContent variant="danger">
            <DialogHeader>
              <DialogTitle>Delete account</DialogTitle>
              <DialogDescription>
                Destructive tone — red top accent communicates risk.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p className="text-sm text-foreground-muted">
                This will permanently delete all your data. This action cannot be undone.
              </p>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="danger">Delete</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger>
            <Button variant="outline">Locked</Button>
          </DialogTrigger>
          <DialogContent variant="warning" closeOnOverlayClick={false} closeOnEscape={false}>
            <DialogHeader>
              <DialogTitle>Confirm required</DialogTitle>
              <DialogDescription>
                Backdrop click and Esc are disabled — close only via the X or buttons below.
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
      </div>
    </Section>
  );
}
