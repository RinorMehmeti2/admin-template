export function WhenToUseSection() {
  return (
    <section className="rounded-lg border border-dashed border-border p-6 text-sm text-foreground-muted">
      <h3 className="text-sm font-semibold text-foreground">When to use</h3>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>Full-screen forms with many fields where the surrounding chrome is noise.</li>
        <li>Document / rich-text editors where you want the canvas to dominate.</li>
        <li>Wizard / onboarding flows triggered from a dashboard action.</li>
        <li>Presentation mode in BI tools.</li>
      </ul>
    </section>
  );
}
