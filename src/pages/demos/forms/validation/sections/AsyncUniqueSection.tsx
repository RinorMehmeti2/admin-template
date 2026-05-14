import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, X } from 'lucide-react';
import { Form, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface AsyncValues {
  username: string;
}

type CheckState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available'; username: string }
  | { status: 'taken'; username: string };

const RESERVED = new Set(['admin', 'root', 'test', 'system', 'support']);

// Local mock — deliberately not going through MSW so this demo works
// without VITE_USE_MSW=true. Latency mimics a real lookup.
async function checkUsernameLocal(username: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 400));
  return username.length > 0 && !RESERVED.has(username.toLowerCase());
}

export function AsyncUniqueSection() {
  const { t } = useTranslation();
  const form = useForm<AsyncValues>({ defaultValues: { username: '' }, mode: 'onChange' });
  const username = form.watch('username').trim().toLowerCase();
  const debounced = useDebouncedValue(username, 400);
  const [state, setState] = useState<CheckState>({ status: 'idle' });
  const reqId = useRef(0);

  // The setState calls below intentionally run in an effect so the
  // availability check fires after debounce. The functional-update form
  // collapses redundant transitions; the async branch updates only when
  // the latest request resolves.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (debounced.length < 3) {
      setState((prev) => (prev.status === 'idle' ? prev : { status: 'idle' }));
      form.clearErrors('username');
      return;
    }
    const id = ++reqId.current;
    setState((prev) => (prev.status === 'checking' ? prev : { status: 'checking' }));
    void checkUsernameLocal(debounced).then((available) => {
      if (reqId.current !== id) return;
      if (available) {
        setState({ status: 'available', username: debounced });
        form.clearErrors('username');
      } else {
        setState({ status: 'taken', username: debounced });
        form.setError('username', { type: 'taken', message: t('forms.zod.usernameTaken') });
      }
    });
  }, [debounced, form, t]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const rightIcon = useMemo(() => {
    if (state.status === 'checking')
      return <Loader2 className="h-4 w-4 animate-spin text-foreground-muted" />;
    if (state.status === 'available') return <Check className="h-4 w-4 text-success" />;
    if (state.status === 'taken') return <X className="h-4 w-4 text-danger" />;
    return undefined;
  }, [state.status]);

  const code = `<Form form={form} onSubmit={() => undefined} className="space-y-4">
  <FormField
    label="Username"
    description="Try 'admin', 'root', or 'test' to trigger the taken state."
    error={form.formState.errors.username?.message}
  >
    <Input
      {...form.register('username')}
      autoComplete="username"
      placeholder="At least 3 chars…"
      {...(rightIcon !== undefined ? { rightIcon } : {})}
    />
  </FormField>
  <div className="flex justify-end">
    <Button type="submit" variant="primary" disabled={state.status !== 'available'}>
      Continue
    </Button>
  </div>
</Form>`;

  return (
    <Section
      id="async-unique"
      title={t('forms.validation.asyncUnique.title')}
      description={t('forms.validation.asyncUnique.description')}
      code={code}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-4">
        <FormField
          label="Username"
          description="Try 'admin', 'root', or 'test' to trigger the taken state."
          error={form.formState.errors.username?.message}
        >
          <Input
            {...form.register('username')}
            autoComplete="username"
            placeholder="At least 3 chars…"
            {...(rightIcon !== undefined ? { rightIcon } : {})}
          />
        </FormField>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={state.status !== 'available'}>
            Continue
          </Button>
        </div>
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
