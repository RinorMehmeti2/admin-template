import { Plus } from 'lucide-react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display';
import { Button } from '@/components/primitives/Button';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { LoadingBoundary, SkeletonTable } from '@/components/feedback/LoadingBoundary';
import type { User } from '../model';
import { UsersErrorFallback } from './UsersErrorFallback';
import { UsersTableContent } from './UsersTableContent';

/*
 * --- BEFORE (kept for reference) ---------------------------------------
 * The previous version called `useApiQuery` and rendered three states by
 * hand: a render-time `isLoading` skeleton inside <DataTable>, an
 * `isError` <Alert> with a Retry button, and the resolved data path. That
 * pattern still applies — see useApiQuery in src/data and the OrdersTable
 * section below. The decision tree lives in CONTRIBUTING.md § "Data
 * fetching".
 *
 *   const { data, isLoading, isError, error, refetch } =
 *     useApiQuery<UsersResponse>(keys.users.list(filters), fetcher);
 *   if (isError) return <Alert title="Couldn't load users" … />;
 *   return <DataTable data={data?.data ?? []} isLoading={isLoading} … />;
 *
 * --- AFTER (this file) -------------------------------------------------
 * UsersTableSection renders chrome (header, action bar, ConfirmDialog) and
 * delegates the data leg to <UsersTableContent>, wrapped in
 * <LoadingBoundary fallback={<SkeletonTable />}>. The boundary catches
 * Suspense (skeleton) and ErrorBoundary (Alert) declaratively; the inner
 * component calls `useApiSuspenseQuery` and renders the resolved
 * `data` directly with no `isLoading` / `isError` branching.
 *
 * Trade-offs:
 *   - The DataTable + selection state must live inside the boundary
 *     because selection depends on resolved rows. Header chrome stays
 *     outside so the Card structure and "Invite user" button render
 *     immediately.
 *   - On refetch, the boundary suspends again unless we adopt
 *     useDeferredValue/startTransition. Acceptable for v1 — we'll add a
 *     "soft refresh" pattern when the team needs it.
 */

export function UsersTableSection() {
  const [selected, setSelected] = useState<User[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card variant="outlined">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Toolbar uses &lt;FilterableSearch&gt; — debounced query + add/remove filter chips for
            Status / Role / Email. Loading + error legs handled by &lt;LoadingBoundary&gt; +
            useApiSuspenseQuery.
          </CardDescription>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Invite user</Button>
      </CardHeader>
      <CardContent>
        <LoadingBoundary
          fallback={<SkeletonTable count={8} columns={4} />}
          errorFallback={(props) => <UsersErrorFallback {...props} />}
          source="route:/tables#users"
        >
          <UsersTableContent
            setSelected={setSelected}
            selectedCount={selected.length}
            onDelete={() => setConfirmOpen(true)}
          />
        </LoadingBoundary>
      </CardContent>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="danger"
        title={`Delete ${selected.length} user${selected.length === 1 ? '' : 's'}?`}
        description="This is a demo — no users will actually be deleted."
        confirmLabel="Delete"
        onConfirm={() => setConfirmOpen(false)}
      />
    </Card>
  );
}
