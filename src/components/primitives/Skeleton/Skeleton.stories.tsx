import { Skeleton } from './Skeleton';

export default { title: 'Primitives/Skeleton', component: Skeleton };

export const Default = {
  render: () => <Skeleton className="h-4 w-48" />,
};

export const CardLoading = {
  render: () => (
    <div className="rounded-lg border border-border bg-surface p-6 space-y-3 w-80">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  ),
};

export const ListLoading = {
  render: () => (
    <div className="space-y-3 w-80">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  ),
};
