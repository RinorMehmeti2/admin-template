import { useState } from 'react';
import { FormField, OtpInput } from '@/components/forms';

export function OtpInputDemo() {
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [completed, setCompleted] = useState<string | null>(null);
  const [alpha, setAlpha] = useState('');

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="PIN (4 digits)">
        <OtpInput length={4} value={pin} onValueChange={setPin} autoFocusOnMount={false} />
        <p className="mt-1 text-xs text-foreground-muted">value: {pin || '(empty)'}</p>
      </FormField>

      <FormField label="Verification code" description="onComplete fires on last digit.">
        <OtpInput
          length={6}
          value={code}
          onValueChange={setCode}
          onComplete={setCompleted}
          autoFocusOnMount={false}
        />
        <p className="mt-1 text-xs text-foreground-muted">
          {completed !== null ? `complete: ${completed}` : 'value: ' + (code || '(empty)')}
        </p>
      </FormField>

      <FormField label="Alphanumeric" description="Letters + digits accepted.">
        <OtpInput
          length={6}
          allowedChars={/^[0-9a-zA-Z]$/}
          value={alpha}
          onValueChange={setAlpha}
          autoFocusOnMount={false}
        />
      </FormField>

      <FormField label="Masked" description="Renders dots like a password.">
        <OtpInput length={6} masked autoFocusOnMount={false} />
      </FormField>
    </div>
  );
}
