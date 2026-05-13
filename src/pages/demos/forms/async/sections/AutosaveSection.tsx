import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, XCircle } from 'lucide-react';
import { Form, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { FormField } from '@/components/forms/FormField';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/cn';
import { Section } from '../../_shared/Section';

interface SettingsValues {
  workspace: string;
  description: string;
  visibility: 'public' | 'private';
}

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: Date }
  | { kind: 'error' };

async function fakeSave(): Promise<void> {
  await new Promise((r) => setTimeout(r, 600));
  // Random failure can be added; keep deterministic for demo.
}

export function AutosaveSection() {
  const { t } = useTranslation();
  const form = useForm<SettingsValues>({
    defaultValues: {
      workspace: 'Acme Engineering',
      description: 'Builds calm tools for ops teams.',
      visibility: 'private',
    },
  });
  const watched = form.watch();
  const debounced = useDebouncedValue(watched, 800);
  const [state, setState] = useState<SaveState>({ kind: 'idle' });
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setState({ kind: 'saving' });
    let cancelled = false;
    fakeSave()
      .then(() => {
        if (!cancelled) setState({ kind: 'saved', at: new Date() });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  let statusIcon = null;
  let statusText = '';
  let statusClass = 'text-foreground-muted';
  if (state.kind === 'saving') {
    statusIcon = <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />;
    statusText = 'Saving…';
  } else if (state.kind === 'saved') {
    statusIcon = <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />;
    statusText = `Saved · ${state.at.toLocaleTimeString()}`;
    statusClass = 'text-success-foreground';
  } else if (state.kind === 'error') {
    statusIcon = <XCircle className="h-3.5 w-3.5 text-danger" aria-hidden="true" />;
    statusText = 'Save failed';
    statusClass = 'text-danger';
  }

  return (
    <Section
      id="autosave"
      title={t('forms.async.autosave.title')}
      description={t('forms.async.autosave.description')}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Workspace settings</h3>
          <span className={cn('inline-flex items-center gap-1.5 text-xs', statusClass)}>
            {statusIcon}
            {statusText}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Workspace name">
            <Input {...form.register('workspace')} />
          </FormField>
          <FormField label="Visibility">
            <Select {...form.register('visibility')}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </Select>
          </FormField>
          <FormField label="Description" className="sm:col-span-2">
            <Textarea rows={3} {...form.register('description')} />
          </FormField>
        </div>
      </Form>
    </Section>
  );
}
