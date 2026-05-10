import { useRef, useState } from 'react';
import { PhoneInput, type PhoneInputHandle } from './PhoneInput';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';

export default { title: 'Forms/PhoneInput', component: PhoneInput };

function BasicDemo() {
  const [v, setV] = useState<string | null>(null);
  return (
    <div className="max-w-sm">
      <FormField label="Phone" description="E.164 output emitted only when valid.">
        <PhoneInput defaultCountry="US" onValueChange={setV} placeholder="(555) 123-4567" />
      </FormField>
      <pre className="mt-3 rounded-md border border-border bg-surface-muted p-3 text-xs text-foreground-muted">
        {v ?? '(no valid number yet)'}
      </pre>
    </div>
  );
}
export const DefaultUS = { render: () => <BasicDemo /> };

function GermanyDemo() {
  const [v, setV] = useState<string | null>(null);
  return (
    <div className="max-w-sm">
      <FormField label="Telefon">
        <PhoneInput defaultCountry="DE" onValueChange={setV} placeholder="030 1234567" />
      </FormField>
      <pre className="mt-3 rounded-md border border-border bg-surface-muted p-3 text-xs text-foreground-muted">
        {v ?? '(no valid number yet)'}
      </pre>
    </div>
  );
}
export const DefaultGermany = { render: () => <GermanyDemo /> };

function PreferredDemo() {
  const [v, setV] = useState<string | null>(null);
  return (
    <div className="max-w-sm">
      <FormField label="Phone" description="DE / FR / GB pinned to the top.">
        <PhoneInput
          defaultCountry="US"
          preferredCountries={['DE', 'FR', 'GB']}
          onValueChange={setV}
        />
      </FormField>
      <pre className="mt-3 rounded-md border border-border bg-surface-muted p-3 text-xs text-foreground-muted">
        {v ?? '(no valid number yet)'}
      </pre>
    </div>
  );
}
export const PreferredCountries = { render: () => <PreferredDemo /> };

function DisabledDemo() {
  return (
    <div className="max-w-sm">
      <FormField label="Phone">
        <PhoneInput defaultCountry="US" defaultValue="+14155551212" disabled />
      </FormField>
    </div>
  );
}
export const Disabled = { render: () => <DisabledDemo /> };

function ErrorDemo() {
  return (
    <div className="max-w-sm">
      <FormField label="Phone" error="Number is invalid">
        <PhoneInput defaultCountry="US" defaultValue="+1415" error />
      </FormField>
    </div>
  );
}
export const ErrorState = { render: () => <ErrorDemo /> };

function RefHandleDemo() {
  const ref = useRef<PhoneInputHandle>(null);
  const [snapshot, setSnapshot] = useState<{
    isValid: boolean;
    countryCode: string;
    e164: string | null;
  } | null>(null);

  return (
    <div className="max-w-sm space-y-3">
      <FormField label="Phone" description="Ref-based validation read.">
        <PhoneInput ref={ref} defaultCountry="US" />
      </FormField>
      <Button
        variant="secondary"
        onClick={() => {
          if (ref.current === null) return;
          setSnapshot({
            isValid: ref.current.isValid,
            countryCode: ref.current.countryCode,
            e164: ref.current.e164,
          });
        }}
      >
        Read ref
      </Button>
      {snapshot !== null ? (
        <pre className="rounded-md border border-border bg-surface-muted p-3 text-xs text-foreground-muted">
          {JSON.stringify(snapshot, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
export const RefHandle = { render: () => <RefHandleDemo /> };
