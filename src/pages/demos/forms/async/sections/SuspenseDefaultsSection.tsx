import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Switch } from '@/components/forms/Switch';
import { Select } from '@/components/forms/Select';
import { FormField } from '@/components/forms/FormField';
import { LoadingBoundary } from '@/components/feedback/LoadingBoundary';
import { Skeleton } from '@/components/primitives/Skeleton';
import { Section } from '../../_shared/Section';

interface DefaultsValues {
  name: string;
  email: string;
  timezone: string;
  digest: boolean;
}

// Local cache so the suspense throws only on first mount.
let cachedDefaults: DefaultsValues | null = null;
let inflight: Promise<DefaultsValues> | null = null;

function fetchDefaults(): DefaultsValues {
  if (cachedDefaults !== null) return cachedDefaults;
  if (inflight === null) {
    inflight = new Promise<DefaultsValues>((resolve) => {
      setTimeout(() => {
        cachedDefaults = {
          name: 'Alex Kowalski',
          email: 'alex@acme.test',
          timezone: 'America/Los_Angeles',
          digest: true,
        };
        resolve(cachedDefaults);
      }, 800);
    });
  }
  throw inflight;
}

function FormSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-1/2" />
    </div>
  );
}

function InnerForm() {
  const defaults = fetchDefaults();
  const form = useForm<DefaultsValues>({ defaultValues: defaults });
  // Re-sync once if the cached defaults change (e.g. user reloads).
  useEffect(() => {
    form.reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form form={form} onSubmit={() => undefined} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Name">
          <Input {...form.register('name')} />
        </FormField>
        <FormField label="Email">
          <Input type="email" {...form.register('email')} />
        </FormField>
        <FormField label="Timezone">
          <Select {...form.register('timezone')}>
            <option value="UTC">UTC</option>
            <option value="America/Los_Angeles">America/Los Angeles</option>
            <option value="Europe/Berlin">Europe/Berlin</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </Select>
        </FormField>
        <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2 text-sm">
          <span>Weekly digest</span>
          <Switch
            checked={form.watch('digest')}
            onChange={(e) => form.setValue('digest', e.target.checked, { shouldDirty: true })}
          />
        </label>
      </div>
    </Form>
  );
}

export function SuspenseDefaultsSection() {
  const { t } = useTranslation();
  const [key, setKey] = useState(0);

  return (
    <Section
      id="suspense-defaults"
      title={t('forms.async.defaults.title')}
      description={t('forms.async.defaults.description')}
      actions={
        <button
          type="button"
          className="rounded-md border border-border bg-surface px-3 py-1 text-xs text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => {
            cachedDefaults = null;
            inflight = null;
            setKey((k) => k + 1);
          }}
        >
          Refetch
        </button>
      }
    >
      <LoadingBoundary fallback={<FormSkeleton />}>
        <Suspense fallback={<FormSkeleton />}>
          <InnerForm key={key} />
        </Suspense>
      </LoadingBoundary>
    </Section>
  );
}
