import { useState } from 'react';
import { ConfirmDialog } from '@/components/feedback';
import { Button } from '@/components/primitives/Button';
import { useToast } from '@/context/ToastProvider';
import { Section } from './Section';

const CODE = `const [confirmOpen, setConfirmOpen] = useState(false);
const [confirmLoading, setConfirmLoading] = useState(false);

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
/>`;

export function ConfirmDialogSection() {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  return (
    <Section title="ConfirmDialog" code={CODE}>
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
  );
}
