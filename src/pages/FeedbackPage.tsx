import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import {
  Alert,
  ConfirmDialog,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Progress,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/feedback';
import { Button } from '@/components/primitives/Button';
import { useToast } from '@/context/ToastProvider';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="rounded-lg border border-border bg-surface p-6">{children}</div>
    </section>
  );
}

export function FeedbackPage() {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setProgress((v) => (v >= 100 ? 0 : v + 5)), 350);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
        <p className="mt-1 text-foreground-muted">
          Alert, Toast, Dialog, Drawer, ConfirmDialog, Tooltip, Progress.
        </p>
      </header>

      <Section title="Alert">
        <div className="space-y-3">
          <Alert variant="info" title="Heads up" description="A friendly note." />
          <Alert variant="success" title="Saved" description="Your changes were saved." />
          <Alert variant="warning" title="Storage low" description="Less than 10% remaining." />
          <Alert
            variant="danger"
            title="Deletion failed"
            description="The server returned 500."
            actions={
              <>
                <Button size="sm" variant="danger">Retry</Button>
                <Button size="sm" variant="ghost">Discard</Button>
              </>
            }
          />
          <Alert
            variant="neutral"
            title="Dismissable"
            description="Click the × to remove me."
            onClose={() => toast.info('Alert dismissed (demo only)')}
          />
        </div>
      </Section>

      <Section title="Toast">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => toast.success('Saved successfully')}>Success</Button>
          <Button variant="danger" onClick={() => toast.error('Network error', { description: 'Check your connection.' })}>
            Error
          </Button>
          <Button variant="outline" onClick={() => toast.warning('Storage almost full')}>
            Warning
          </Button>
          <Button variant="ghost" onClick={() => toast.info('New version available')}>
            Info
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.neutral('Heads up', {
                duration: 0,
                action: { label: 'Undo', onClick: () => toast.success('Undone') },
              })
            }
          >
            Sticky w/ action
          </Button>
        </div>
      </Section>

      <Section title="Dialog">
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
      </Section>

      <Section title="Drawer">
        <div className="flex flex-wrap gap-2">
          {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
            <Drawer key={side} side={side}>
              <DrawerTrigger>
                <Button variant="outline">From {side}</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>From the {side}</DrawerTitle>
                </DrawerHeader>
                <DrawerBody>
                  <p className="text-sm text-foreground-muted">
                    Drawer content. Esc / overlay / close button all dismiss.
                  </p>
                </DrawerBody>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button>Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ))}
        </div>
      </Section>

      <Section title="ConfirmDialog">
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Delete account…
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete account?"
          description="This permanently removes all data. This cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          isLoading={confirmLoading}
          onConfirm={async () => {
            setConfirmLoading(true);
            await new Promise((r) => setTimeout(r, 1200));
            setConfirmLoading(false);
            setConfirmOpen(false);
            toast.success('Account deleted');
          }}
        />
      </Section>

      <Section title="Tooltip">
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger>
              <Button variant="outline">Hover or focus</Button>
            </TooltipTrigger>
            <TooltipContent side="top">On top</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="outline">Bottom</Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">On bottom</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" leftIcon={<Info className="h-4 w-4" />}>
                Info
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Tooltips support keyboard focus too</TooltipContent>
          </Tooltip>
        </div>
      </Section>

      <Section title="Progress">
        <div className="space-y-4">
          <Progress value={progress} label="Animated" />
          <Progress value={45} variant="success" label="Stable" />
          <Progress value={80} variant="warning" />
          <Progress indeterminate label="Loading" />
        </div>
      </Section>

      <Section title="Scroll lock demo">
        <p className="text-sm text-foreground-muted">
          The page below scrolls. Open the dialog above and try to scroll the page — body scroll is
          locked while the overlay is mounted.
        </p>
        <div className="mt-4 space-y-2">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-foreground-muted"
            >
              Filler row #{i + 1}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
