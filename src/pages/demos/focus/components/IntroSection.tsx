import { Button } from '@/components/primitives/Button';

interface IntroSectionProps {
  onOpen: () => void;
}

export function IntroSection({ onOpen }: IntroSectionProps) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-6">
      <h2 className="text-base font-semibold">Profile editor</h2>
      <p className="text-sm text-foreground-muted">
        Click below to enter focus mode. Press{' '}
        <kbd className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">Esc</kbd>, click ✕, or
        press the back arrow to return.
      </p>
      <Button onClick={onOpen}>Edit profile in focus mode</Button>
    </section>
  );
}
