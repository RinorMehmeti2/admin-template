import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import {
  AuditLogCard,
  BuildPipelineCard,
  CommentThreadCard,
  DeploymentHistoryCard,
} from './components';

export function TimelinePage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-[1400px]">
      <SimsPageHeader
        title={t('demos.timeline.title')}
        description={t('demos.timeline.subtitle')}
      />
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <AuditLogCard />
          <CommentThreadCard />
        </div>
        <BuildPipelineCard />
        <DeploymentHistoryCard />
      </div>
    </div>
  );
}
