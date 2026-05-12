import {
  AlertSection,
  ConfirmDialogSection,
  DialogSection,
  DrawerSection,
  ProgressSection,
  ScrollLockSection,
  ToastSection,
  TooltipSection,
} from './components';

export function FeedbackPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Feedback</h1>
        <p className="mt-1 text-foreground-muted">
          Alert, Toast, Dialog, Drawer, ConfirmDialog, Tooltip, Progress.
        </p>
      </header>

      <AlertSection />

      <ToastSection />

      <DialogSection />

      <DrawerSection />

      <ConfirmDialogSection />

      <TooltipSection />

      <ProgressSection />

      <ScrollLockSection />
    </div>
  );
}
