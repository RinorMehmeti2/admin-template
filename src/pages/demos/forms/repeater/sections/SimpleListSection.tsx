import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { Repeater } from '@/components/forms/Repeater';
import { Input } from '@/components/forms/Input';
import { FormField } from '@/components/forms/FormField';
import { Section } from '../../_shared/Section';

interface EmailEntry {
  address: string;
}

export function SimpleListSection() {
  const { t } = useTranslation();
  const [emails, setEmails] = useState<EmailEntry[]>([{ address: 'alex@acme.test' }]);
  return (
    <Section
      id="simple"
      title={t('forms.repeater.simple.title')}
      description={t('forms.repeater.simple.description')}
    >
      <Repeater<EmailEntry>
        label="Contact emails"
        description="Used for password resets and audit alerts."
        items={emails}
        onChange={setEmails}
        createItem={(): EmailEntry => ({ address: '' })}
        min={1}
        max={5}
        addLabel="Add email"
        renderItem={({ item, update, index }) => (
          <FormField label={`Email ${index + 1}`} hideLabel>
            <Input
              type="email"
              leftIcon={<Mail className="h-4 w-4" />}
              value={item.address}
              onChange={(e) => update({ address: e.target.value })}
              placeholder="name@example.com"
            />
          </FormField>
        )}
      />
    </Section>
  );
}
