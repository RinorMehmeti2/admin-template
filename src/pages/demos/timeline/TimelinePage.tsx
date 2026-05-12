import { useTranslation } from 'react-i18next';
import {
  AuditLogCard,
  BuildPipelineCard,
  CommentThreadCard,
  DeploymentHistoryCard,
} from './components';

export function TimelinePage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('demos.timeline.title')}</h1>
        <p className="mt-1 text-foreground-muted">{t('demos.timeline.subtitle')}</p>
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
