import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, User } from 'lucide-react';
import { Repeater } from '@/components/forms/Repeater';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Section } from '../../_shared/Section';

interface Contact {
  name: string;
  relation: 'partner' | 'parent' | 'sibling' | 'friend' | 'other';
  phone: string;
}

export function CompoundRowsSection() {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>([
    { name: '', relation: 'partner', phone: '' },
  ]);
  return (
    <Section
      id="compound"
      title={t('forms.repeater.compound.title')}
      description={t('forms.repeater.compound.description')}
    >
      <Repeater<Contact>
        label="Emergency contacts"
        description="Reorder ↑↓ — focus stays on the focused input across reorder."
        items={contacts}
        onChange={setContacts}
        createItem={(): Contact => ({ name: '', relation: 'partner', phone: '' })}
        max={4}
        addLabel="Add contact"
        renderItem={({ item, update, index }) => (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.5fr_1fr_1fr]">
            <Input
              aria-label={`Contact ${index + 1} name`}
              leftIcon={<User className="h-4 w-4" />}
              value={item.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Full name"
            />
            <Select
              aria-label={`Contact ${index + 1} relation`}
              value={item.relation}
              onChange={(e) => update({ relation: e.target.value as Contact['relation'] })}
            >
              <option value="partner">Partner</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </Select>
            <Input
              type="tel"
              aria-label={`Contact ${index + 1} phone`}
              leftIcon={<Phone className="h-4 w-4" />}
              value={item.phone}
              onChange={(e) => update({ phone: e.target.value })}
              placeholder="555-0123"
            />
          </div>
        )}
      />
    </Section>
  );
}
