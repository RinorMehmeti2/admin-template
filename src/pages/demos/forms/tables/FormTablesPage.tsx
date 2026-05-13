import { useTranslation } from 'react-i18next';
import {
  DependentRowsSection,
  EditableRosterSection,
  InvoiceLineItemsSection,
  ReadOnlySummarySection,
} from './sections';

export function FormTablesPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('forms.tables.title')}</h2>
        <p className="max-w-3xl text-foreground-muted">{t('forms.tables.subtitle')}</p>
      </header>

      <InvoiceLineItemsSection />
      <EditableRosterSection />
      <DependentRowsSection />
      <ReadOnlySummarySection />
    </div>
  );
}
