import { useState } from 'react';
import { FocusHeader, IntroSection, ProfileFocusEditor, WhenToUseSection } from './components';

export function FocusDemoPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px]">
      <FocusHeader />
      <div className="space-y-6">
        <IntroSection onOpen={() => setOpen(true)} />
        <WhenToUseSection />
      </div>
      {open ? <ProfileFocusEditor onExit={() => setOpen(false)} /> : null}
    </div>
  );
}
