import { useState } from 'react';
import {
  FocusHeader,
  IntroSection,
  ProfileFocusEditor,
  WhenToUseSection,
} from './components';

export function FocusDemoPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <FocusHeader />
      <IntroSection onOpen={() => setOpen(true)} />
      <WhenToUseSection />

      {open ? <ProfileFocusEditor onExit={() => setOpen(false)} /> : null}
    </div>
  );
}
