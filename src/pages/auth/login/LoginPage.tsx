import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, LogIn, Mail } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/primitives/Button';
import { Form, FormField, Input, useForm, zodResolver } from '@/components/forms';
import { Alert } from '@/components/feedback/Alert';
import { useAuth } from '@/auth';
import { MOCK_ACCOUNTS } from '@/auth/mockAuthClient';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginValues = z.infer<typeof loginSchema>;

interface FromState {
  from?: string;
}

export function LoginPage() {
  const { login, error, state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as FromState | null)?.from ?? '/';
  const [submitFailed, setSubmitFailed] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const { register, formState } = form;
  const { errors } = formState;

  async function onSubmit(values: LoginValues): Promise<void> {
    setSubmitFailed(false);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch {
      setSubmitFailed(true);
    }
  }

  const isSubmitting = formState.isSubmitting || state === 'authenticating';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LogIn className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Welcome back. Enter your credentials to continue.
          </p>
        </div>

        {submitFailed && error !== null ? (
          <Alert
            variant="danger"
            title="Sign-in failed"
            description={error.message}
            className="mb-4"
          />
        ) : null}

        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <FormField label="Email" required error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              {...register('email')}
            />
          </FormField>

          <FormField label="Password" required error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              {...register('password')}
            />
          </FormField>

          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Sign in
          </Button>
        </Form>

        <DemoCredentials />

        <p className="mt-4 text-center text-xs text-foreground-subtle">
          <Link to="/" className="text-primary hover:underline">
            Back to overview
          </Link>
        </p>
      </div>
    </div>
  );
}

function DemoCredentials() {
  return (
    <div className="mt-6 rounded-md border border-dashed border-border bg-surface-muted/40 p-3">
      <p className="text-xs font-medium text-foreground-muted">Demo accounts</p>
      <ul className="mt-2 space-y-1 text-xs text-foreground-subtle">
        {MOCK_ACCOUNTS.map((acc) => (
          <li key={acc.email} className="flex items-center justify-between gap-2">
            <span>
              <code className="font-mono">{acc.email}</code>
              {' / '}
              <code className="font-mono">{acc.password}</code>
            </span>
            <span className="text-foreground-subtle">[{acc.roles.join(', ')}]</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
