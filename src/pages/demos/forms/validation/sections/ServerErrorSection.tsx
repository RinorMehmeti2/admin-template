import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Form, useForm, zodResolver } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { ApiError } from '@/data';
import { useApiMutation, useApiFormSubmit } from '@/data';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface ServerValues {
  name: string;
  email: string;
  username: string;
}

const RESERVED = new Set(['admin', 'root', 'test']);

// Local fake — never hit the real network so this demo works without MSW.
// Mirrors the shape used by mapApiError for 422 responses.
async function fakeSubmit(values: ServerValues): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 600));
  const errors: Record<string, string> = {};
  if (RESERVED.has(values.username.toLowerCase())) {
    errors.username = 'That username is already taken';
  }
  if (!values.email.includes('@')) {
    errors.email = 'Invalid email address';
  }
  if (Object.keys(errors).length > 0) {
    throw new ApiError({
      status: 422,
      code: 'validation_failed',
      message: 'Validation failed',
      payload: { errors },
    });
  }
  return { ok: true };
}

export function ServerErrorSection() {
  const { t } = useTranslation();
  const [ok, setOk] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('forms.zod.required')),
        email: z.string().min(1, t('forms.zod.required')).email(t('forms.zod.invalidEmail')),
        username: z.string().min(3, t('forms.zod.minLength', { count: 3 })),
      }),
    [t],
  );

  const form = useForm<ServerValues>({
    defaultValues: { name: '', email: '', username: '' },
    resolver: zodResolver(schema),
  });
  const { errors } = form.formState;

  const mutation = useApiMutation<{ ok: true }, ServerValues>((values) => fakeSubmit(values), {
    meta: { handlesErrors: true },
  });

  const onSubmit = useApiFormSubmit(form, mutation, {
    onSuccess: () => {
      setOk(true);
      form.reset();
    },
  });

  const code = `<Form form={form} onSubmit={onSubmit} className="space-y-4">
  <div className="grid gap-4 sm:grid-cols-2">
    <FormField label="Name" required error={errors.name?.message}>
      <Input {...form.register('name')} />
    </FormField>
    <FormField label="Email" required error={errors.email?.message}>
      <Input type="email" {...form.register('email')} />
    </FormField>
    <FormField
      label="Username"
      required
      description="Try 'admin' to see the 422 land on this field."
      error={errors.username?.message}
      className="sm:col-span-2"
    >
      <Input {...form.register('username')} />
    </FormField>
  </div>
  {errors.root?.serverError?.message !== undefined ? (
    <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
      {errors.root.serverError.message}
    </p>
  ) : null}
  <div className="flex items-center justify-between">
    {ok ? (
      <p className="text-xs text-success-foreground">Submitted. Form reset.</p>
    ) : (
      <span />
    )}
    <Button type="submit" variant="primary" isLoading={mutation.isPending}>
      Create account
    </Button>
  </div>
</Form>`;

  return (
    <Section
      id="server"
      title={t('forms.validation.server.title')}
      description={t('forms.validation.server.description')}
      code={code}
    >
      <Form form={form} onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" required error={errors.name?.message}>
            <Input {...form.register('name')} />
          </FormField>
          <FormField label="Email" required error={errors.email?.message}>
            <Input type="email" {...form.register('email')} />
          </FormField>
          <FormField
            label="Username"
            required
            description="Try 'admin' to see the 422 land on this field."
            error={errors.username?.message}
            className="sm:col-span-2"
          >
            <Input {...form.register('username')} />
          </FormField>
        </div>
        {errors.root?.serverError?.message !== undefined ? (
          <p className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {errors.root.serverError.message}
          </p>
        ) : null}
        <div className="flex items-center justify-between">
          {ok ? (
            <p className="text-xs text-success-foreground">Submitted. Form reset.</p>
          ) : (
            <span />
          )}
          <Button type="submit" variant="primary" isLoading={mutation.isPending}>
            Create account
          </Button>
        </div>
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
