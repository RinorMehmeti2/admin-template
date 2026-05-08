import { useState } from 'react';
import { Button } from '@/components/primitives/Button';
import { ConfirmDialog } from './ConfirmDialog';

export default { title: 'Feedback/ConfirmDialog', component: ConfirmDialog };

export const Default = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="danger" onClick={() => setOpen(true)}>
            Delete account
          </Button>
          <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            title="Delete account?"
            description="This permanently removes all data. This cannot be undone."
            confirmLabel="Delete"
            variant="danger"
            onConfirm={() => {
              // eslint-disable-next-line no-alert
              alert('deleted');
              setOpen(false);
            }}
          />
        </>
      );
    }
    return <Demo />;
  },
};
