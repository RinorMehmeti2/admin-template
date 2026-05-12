export function SearchHeader() {
  return (
    <header>
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      <p className="mt-1 text-foreground-muted">
        A reusable search + filter chips composition. Type to search messages, click "Filter" to
        add level / service / tag / date-range constraints.
      </p>
    </header>
  );
}
