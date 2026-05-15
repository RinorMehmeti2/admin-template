import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router-dom';
import { Form, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Section } from '../../_shared/Section';

interface ArticleValues {
  title: string;
  body: string;
}

const CODE = `const form = useForm<ArticleValues>({
  defaultValues: { title: '', body: '' },
});
const isDirty = form.formState.isDirty;

// Block in-app navigations while dirty.
const blocker = useBlocker(({ currentLocation, nextLocation }) => {
  if (!isDirty) return false;
  return currentLocation.pathname !== nextLocation.pathname;
});

// Block browser navigation / reload while dirty.
useEffect(() => {
  if (!isDirty) return;
  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  };
  window.addEventListener('beforeunload', onBeforeUnload);
  return () => window.removeEventListener('beforeunload', onBeforeUnload);
}, [isDirty]);

<Form form={form} onSubmit={() => undefined} className="space-y-4">
  <FormField label="Title">
    <Input {...form.register('title')} />
  </FormField>
  <FormField label="Body">
    <Textarea rows={5} {...form.register('body')} />
  </FormField>
  <div className="flex items-center justify-between text-xs text-foreground-muted">
    <span>
      Status:{' '}
      <span className={isDirty ? 'font-semibold text-warning' : 'text-foreground-muted'}>
        {isDirty ? 'unsaved changes' : 'clean'}
      </span>
    </span>
    <div className="flex gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={() => form.reset()}>
        Discard
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={() => form.reset(form.getValues())}
      >
        Save
      </Button>
    </div>
  </div>
</Form>

<ConfirmDialog
  open={blocker.state === 'blocked'}
  onOpenChange={(open) => {
    if (!open && blocker.state === 'blocked') blocker.reset();
  }}
  title="Discard unsaved changes?"
  description="You have unsaved edits. Leaving this page will discard them."
  confirmLabel="Leave"
  cancelLabel="Stay"
  variant="danger"
  onConfirm={() => {
    if (blocker.state === 'blocked') blocker.proceed();
  }}
/>`;

export function DirtyGuardSection() {
  const { t } = useTranslation();
  const form = useForm<ArticleValues>({
    defaultValues: { title: '', body: '' },
  });

  const isDirty = form.formState.isDirty;

  // Block in-app navigations while dirty.
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (!isDirty) return false;
    return currentLocation.pathname !== nextLocation.pathname;
  });

  // Block browser navigation / reload while dirty.
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  return (
    <Section
      id="dirty"
      title={t('forms.async.dirty.title')}
      description={t('forms.async.dirty.description')}
      code={CODE}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-4">
        <FormField label="Title">
          <Input {...form.register('title')} />
        </FormField>
        <FormField label="Body">
          <Textarea rows={5} {...form.register('body')} />
        </FormField>
        <div className="flex items-center justify-between text-xs text-foreground-muted">
          <span>
            Status:{' '}
            <span className={isDirty ? 'font-semibold text-warning' : 'text-foreground-muted'}>
              {isDirty ? 'unsaved changes' : 'clean'}
            </span>
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => form.reset()}>
              Discard
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => form.reset(form.getValues())}
            >
              Save
            </Button>
          </div>
        </div>
      </Form>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open && blocker.state === 'blocked') {
            blocker.reset();
          }
        }}
        title="Discard unsaved changes?"
        description="You have unsaved edits. Leaving this page will discard them."
        confirmLabel="Leave"
        cancelLabel="Stay"
        variant="danger"
        onConfirm={() => {
          if (blocker.state === 'blocked') blocker.proceed();
        }}
      />
    </Section>
  );
}
