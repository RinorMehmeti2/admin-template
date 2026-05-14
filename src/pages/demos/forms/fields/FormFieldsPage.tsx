import { useTranslation } from 'react-i18next';
import { SimsPageHeader } from '@/pages/sims/components/SimsPageHeader';
import {
  ChoicesSection,
  DatesSection,
  RangesSection,
  RichTextSection,
  TextFieldsSection,
} from './sections';

export function FormFieldsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <SimsPageHeader
        title={t('forms.fields.title')}
        description={t('forms.fields.subtitle')}
        className="mb-0"
      />

      <TextFieldsSection />
      <ChoicesSection />
      <DatesSection />
      <RangesSection />
      <RichTextSection />
    </div>
  );
}
