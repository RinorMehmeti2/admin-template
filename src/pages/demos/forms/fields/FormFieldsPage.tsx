import { useTranslation } from 'react-i18next';
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
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('forms.fields.title')}</h2>
        <p className="max-w-3xl text-foreground-muted">{t('forms.fields.subtitle')}</p>
      </header>

      <TextFieldsSection />
      <ChoicesSection />
      <DatesSection />
      <RangesSection />
      <RichTextSection />
    </div>
  );
}
