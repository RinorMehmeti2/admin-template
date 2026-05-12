import { Section } from './Section';

export function ScrollLockSection() {
  return (
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
  );
}
