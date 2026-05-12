import { useState } from 'react';
import { FormField, PhoneInput } from '@/components/forms';

export function PhoneInputDemo() {
  const [us, setUs] = useState<string | null>(null);
  const [de, setDe] = useState<string | null>(null);
  const [pref, setPref] = useState<string | null>(null);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="Phone (US default)" description="E.164 emitted when valid.">
        <PhoneInput defaultCountry="US" onValueChange={setUs} />
        <p className="mt-1 text-xs text-foreground-muted">{us ?? '(invalid / empty)'}</p>
      </FormField>

      <FormField label="Telefon (DE default)" description="Paste +44… to auto-switch country.">
        <PhoneInput defaultCountry="DE" onValueChange={setDe} />
        <p className="mt-1 text-xs text-foreground-muted">{de ?? '(invalid / empty)'}</p>
      </FormField>

      <FormField label="Preferred countries" description="DE/FR/GB pinned to top of list.">
        <PhoneInput
          defaultCountry="US"
          preferredCountries={['DE', 'FR', 'GB']}
          onValueChange={setPref}
        />
        <p className="mt-1 text-xs text-foreground-muted">{pref ?? '(invalid / empty)'}</p>
      </FormField>

      <FormField label="Disabled">
        <PhoneInput defaultCountry="US" defaultValue="+14155551212" disabled />
      </FormField>
    </div>
  );
}
