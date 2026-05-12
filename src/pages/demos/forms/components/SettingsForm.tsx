import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/primitives/Button';
import { Alert } from '@/components/feedback/Alert';
import { ApiError, useApiFormSubmit, useApiMutation } from '@/data';
import {
  Checkbox,
  Controller,
  Form,
  FormField,
  Input,
  LazyRichTextEditor,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Textarea,
  useForm,
  zodResolver,
} from '@/components/forms';

const settingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'editor', 'viewer'], { error: 'Pick a role' }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
  theme: z.enum(['light', 'dark', 'system']),
  active: z.boolean(),
  bio: z.string().max(280, 'Max 280 characters').optional(),
  description: z.string().refine((html) => html.replace(/<[^>]*>/g, '').trim().length > 0, {
    message: 'Description is required',
  }),
});
type SettingsValues = z.infer<typeof settingsSchema>;

// ScenarioPicker drives the mock API so reviewers can demo each error path
// without touching the network layer. In production the mutation would call
// the real endpoint via `api()`.
type SettingsScenario = 'success' | 'fieldErrors' | 'serverError' | 'authExpired';

function fakeSettingsApi(
  scenario: SettingsScenario,
  values: SettingsValues,
): Promise<SettingsValues> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (scenario === 'success') return resolve(values);
      if (scenario === 'fieldErrors') {
        // 422 with zod-style field map → useApiFormSubmit dispatches per-field
        // setError calls back into RHF.
        return reject(
          new ApiError({
            status: 422,
            message: 'Some fields need attention.',
            code: 'validation',
            payload: {
              fields: {
                name: 'That display name is already taken.',
                bio: 'Bio cannot reference internal usernames.',
              },
            },
          }),
        );
      }
      if (scenario === 'serverError') {
        // 500 → mapApiError → toast (the helper fires toast.error itself).
        return reject(
          new ApiError({ status: 500, message: 'Could not save settings. Try again.' }),
        );
      }
      // 'authExpired' → 401 → mapApiError returns a redirect action; the
      // helper navigates the user to /login.
      reject(new ApiError({ status: 401, message: 'Session expired.' }));
    }, 300);
  });
}

export function SettingsForm() {
  const [submitted, setSubmitted] = useState<SettingsValues | null>(null);
  const [scenario, setScenario] = useState<SettingsScenario>('success');

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: 'Ada Lovelace',
      role: 'editor',
      notifications: { email: true, push: false, sms: false },
      theme: 'system',
      active: true,
      bio: '',
      description:
        '<p>Mathematician, writer, and the first computer programmer. Notes on the <strong>Analytical Engine</strong> include what is now recognised as the first algorithm intended to be processed by a machine.</p>',
    },
  });
  const { register, control, formState, reset } = form;
  const { errors } = formState;

  // INTEGRATION POINT 1: the mutation opts out of the global error dispatcher.
  // Without `meta.handlesErrors`, the QueryClient's MutationCache.onError would
  // toast every failure and useApiFormSubmit would never get a chance to
  // setError per field.
  const mutation = useApiMutation<SettingsValues, SettingsValues>(
    (values) => fakeSettingsApi(scenario, values),
    {
      meta: { handlesErrors: true },
    },
  );

  // INTEGRATION POINT 2: useApiFormSubmit returns a SubmitHandler. It runs the
  // mutation, classifies failures via mapApiError, and routes them: inline
  // → form.setError, toast → toast.error, redirect → navigate, fatal →
  // re-throw to the nearest error boundary.
  const handleSubmit = useApiFormSubmit(form, mutation, {
    onSuccess: (data) => setSubmitted(data),
  });

  // INTEGRATION POINT 3: form-level server message is surfaced via the RHF
  // 'root.serverError' slot. RHF stores it on errors.root.serverError.
  const rootError = errors.root?.serverError?.message;

  return (
    <Form form={form} onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="Mock API scenario"
        description="Drives the fake mutation so each error path can be exercised without a backend."
      >
        <Select
          value={scenario}
          onChange={(e) => setScenario(e.currentTarget.value as SettingsScenario)}
        >
          <option value="success">Success</option>
          <option value="fieldErrors">422 — field errors</option>
          <option value="serverError">500 — toast</option>
          <option value="authExpired">401 — redirect to login</option>
        </Select>
      </FormField>

      {rootError !== undefined ? (
        <Alert variant="danger" title="Could not save" description={rootError} />
      ) : null}

      <FormField label="Display name" required error={errors.name?.message}>
        <Input placeholder="Your name" {...register('name')} />
      </FormField>

      <FormField label="Role" required error={errors.role?.message}>
        <Select {...register('role')}>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </Select>
      </FormField>

      <FormField
        label="Notifications"
        description="Pick the channels you'd like to receive updates on."
      >
        <div className="space-y-2 pt-1 text-sm">
          <Controller
            control={control}
            name="notifications.email"
            render={({ field }) => (
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.currentTarget.checked)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                Email
              </label>
            )}
          />
          <Controller
            control={control}
            name="notifications.push"
            render={({ field }) => (
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.currentTarget.checked)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                Push
              </label>
            )}
          />
          <Controller
            control={control}
            name="notifications.sms"
            render={({ field }) => (
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.currentTarget.checked)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
                SMS
              </label>
            )}
          />
        </div>
      </FormField>

      <FormField label="Theme" required error={errors.theme?.message}>
        <Controller
          control={control}
          name="theme"
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              orientation="horizontal"
              aria-label="Theme"
            >
              <Radio value="light">Light</Radio>
              <Radio value="dark">Dark</Radio>
              <Radio value="system">System</Radio>
            </RadioGroup>
          )}
        />
      </FormField>

      <FormField label="Account active" description="Disabled accounts cannot sign in.">
        <Controller
          control={control}
          name="active"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onChange={(e) => field.onChange(e.currentTarget.checked)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              aria-label="Account active"
            />
          )}
        />
      </FormField>

      <FormField label="Bio" description="Up to 280 characters." error={errors.bio?.message}>
        <Textarea
          autoResize
          minRows={3}
          maxRows={8}
          placeholder="A short blurb..."
          {...register('bio')}
        />
      </FormField>

      <FormField
        label="Description"
        description="Rich text — supports headings, lists, links, and inline formatting."
        required
        error={errors.description?.message}
      >
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <LazyRichTextEditor
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.invalid}
              placeholder="Tell us about yourself…"
              toolbar="minimal"
              minHeight={140}
              aria-label="Description"
            />
          )}
        />
      </FormField>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => reset()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={formState.isSubmitting}>
          Save changes
        </Button>
      </div>

      {submitted !== null ? (
        <pre className="mt-3 rounded-md border border-border bg-surface-muted p-3 text-xs text-foreground-muted">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      ) : null}
    </Form>
  );
}
