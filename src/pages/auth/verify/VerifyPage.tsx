import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/primitives/Button';
import { FormField, OtpInput } from '@/components/forms';

const EXPECTED_CODE = '123456';

export function VerifyPage() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleComplete = (value: string) => {
    if (value === EXPECTED_CODE) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  const handleReset = () => {
    setCode('');
    setStatus('idle');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-semibold">Verify your identity</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Enter the 6-digit code we sent to your phone.
          </p>
        </div>

        {status === 'success' ? (
          <Alert
            variant="success"
            title="Verified"
            description="Code accepted. Redirecting…"
            className="mb-4"
          />
        ) : null}

        {status === 'error' ? (
          <Alert
            variant="danger"
            title="Invalid code"
            description={`Expected ${EXPECTED_CODE} for this demo.`}
            className="mb-4"
          />
        ) : null}

        <FormField label="Verification code" required>
          <OtpInput
            length={6}
            value={code}
            onValueChange={(v) => {
              setCode(v);
              if (status !== 'idle') setStatus('idle');
            }}
            onComplete={handleComplete}
            error={status === 'error'}
          />
        </FormField>

        <div className="mt-6 flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={handleReset}>
            Reset
          </Button>
          <Button type="button" disabled={code.length !== 6} onClick={() => handleComplete(code)}>
            Verify
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-foreground-subtle">
          Demo code: <code className="font-mono">{EXPECTED_CODE}</code>
        </p>
        <p className="mt-2 text-center text-xs text-foreground-subtle">
          <Link to="/" className="text-primary hover:underline">
            Back to overview
          </Link>
        </p>
      </div>
    </div>
  );
}
