import { useState } from 'react';
import { FocusMode } from './FocusMode';
import { Button } from '@/components/primitives/Button';
import { Container } from '@/components/layout/Container';

export default { title: 'Layout/FocusMode', component: FocusMode };

export const Default = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <div className="space-y-3 p-6">
          <p className="text-sm text-foreground-muted">
            FocusMode paints over the viewport. The story uses portal-style fixed positioning, so
            you'll see the rest of Storybook's chrome behind it before it mounts.
          </p>
          <Button onClick={() => setOpen(true)}>Open focus mode</Button>
          {open ? (
            <FocusMode title="Edit profile" onExit={() => setOpen(false)}>
              <Container size="md" className="py-10">
                <h2 className="text-xl font-semibold">Profile</h2>
                <p className="mt-2 text-sm text-foreground-muted">
                  Press Escape, click ✕, or the back arrow to exit.
                </p>
              </Container>
            </FocusMode>
          ) : null}
        </div>
      );
    }
    return <Demo />;
  },
};

export const WithToolbar = {
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <div className="p-6">
          <Button onClick={() => setOpen(true)}>Open with Save toolbar</Button>
          {open ? (
            <FocusMode
              title="Untitled document"
              onExit={() => setOpen(false)}
              toolbar={
                <Button size="sm" onClick={() => setOpen(false)}>
                  Save
                </Button>
              }
            >
              <Container size="md" className="py-10">
                <p className="text-sm text-foreground-muted">Document body…</p>
              </Container>
            </FocusMode>
          ) : null}
        </div>
      );
    }
    return <Demo />;
  },
};
