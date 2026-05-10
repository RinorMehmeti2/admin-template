import { useState } from 'react';
import { OtpInput } from './OtpInput';
import { FormField } from '@/components/forms/FormField';

export default { title: 'Forms/OtpInput', component: OtpInput };

function FourDigitDemo() {
  const [v, setV] = useState('');
  return (
    <div className="max-w-sm space-y-3">
      <FormField label="PIN (4 digits)">
        <OtpInput length={4} value={v} onValueChange={setV} autoFocusOnMount={false} />
      </FormField>
      <p className="text-xs text-foreground-muted">value: {v || '(empty)'}</p>
    </div>
  );
}
export const FourDigit = { render: () => <FourDigitDemo /> };

function SixDigitDemo() {
  const [v, setV] = useState('');
  const [completed, setCompleted] = useState<string | null>(null);
  return (
    <div className="max-w-sm space-y-3">
      <FormField label="Verification code" description="6 digits — auto-advances on type.">
        <OtpInput
          length={6}
          value={v}
          onValueChange={setV}
          onComplete={setCompleted}
          autoFocusOnMount={false}
        />
      </FormField>
      <p className="text-xs text-foreground-muted">value: {v || '(empty)'}</p>
      {completed !== null ? (
        <p className="text-xs text-success">Complete: {completed}</p>
      ) : null}
    </div>
  );
}
export const SixDigit = { render: () => <SixDigitDemo /> };

function AlphanumericDemo() {
  const [v, setV] = useState('');
  return (
    <div className="max-w-sm">
      <FormField label="Code" description="Alphanumeric — letters + digits.">
        <OtpInput
          length={6}
          allowedChars={/^[0-9a-zA-Z]$/}
          value={v}
          onValueChange={setV}
          autoFocusOnMount={false}
        />
      </FormField>
    </div>
  );
}
export const Alphanumeric = { render: () => <AlphanumericDemo /> };

function MaskedDemo() {
  const [v, setV] = useState('');
  return (
    <div className="max-w-sm">
      <FormField label="Recovery PIN" description="Characters render as dots.">
        <OtpInput length={6} masked value={v} onValueChange={setV} autoFocusOnMount={false} />
      </FormField>
    </div>
  );
}
export const Masked = { render: () => <MaskedDemo /> };

function ErrorDemo() {
  return (
    <div className="max-w-sm">
      <FormField label="Verification code" error="Code is incorrect.">
        <OtpInput length={6} error defaultValue="123456" autoFocusOnMount={false} />
      </FormField>
    </div>
  );
}
export const ErrorState = { render: () => <ErrorDemo /> };

function DisabledDemo() {
  return (
    <div className="max-w-sm">
      <FormField label="Code">
        <OtpInput length={6} disabled defaultValue="123" autoFocusOnMount={false} />
      </FormField>
    </div>
  );
}
export const Disabled = { render: () => <DisabledDemo /> };
