import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import {
  DependentRowsSection,
  EditableRosterSection,
  InvoiceLineItemsSection,
  ReadOnlySummarySection,
} from './sections';

export function FormTablesPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('forms.tables.title')}
        description={t('forms.tables.subtitle')}
        className="mb-0"
      />

      <InvoiceLineItemsSection />
      <EditableRosterSection />
      <DependentRowsSection />
      <ReadOnlySummarySection />
    </div>
  );
}
