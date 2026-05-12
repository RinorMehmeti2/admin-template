export function FocusHeader() {
  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight">FocusMode</h1>
      <p className="mt-1 text-foreground-muted">
        A distraction-free chrome that paints over the viewport. Sidebar + Topbar are hidden;
        Escape exits. Useful for full-screen forms, document editors, and presentation surfaces.
      </p>
    </header>
  );
}
