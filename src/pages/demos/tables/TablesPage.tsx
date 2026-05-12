import { OrdersTableSection, SimpleTableSection, UsersTableSection } from './components';

export function TablesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tables</h1>
        <p className="mt-1 text-foreground-muted">
          The Table primitive plus the generic DataTable composition with sort, filter, paginate,
          select.
        </p>
      </header>

      <SimpleTableSection />
      <UsersTableSection />
      <OrdersTableSection />
    </div>
  );
}
