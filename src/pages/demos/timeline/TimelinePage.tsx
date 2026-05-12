import {
  AuditLogCard,
  BuildPipelineCard,
  CommentThreadCard,
  DeploymentHistoryCard,
} from './components';

export function TimelinePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
        <p className="mt-1 text-foreground-muted">
          Vertical and horizontal activity feeds — audit logs, comment threads, build pipelines,
          and deployment history.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <AuditLogCard />
        <CommentThreadCard />
      </div>

      <BuildPipelineCard />

      <DeploymentHistoryCard />
    </div>
  );
}
