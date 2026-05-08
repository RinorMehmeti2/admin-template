import { useState } from 'react';
import { z } from 'zod';
import { Lock, Mail } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Separator } from '@/components/primitives/Separator';
import {
  Checkbox,
  Controller,
  Form,
  FormField,
  Input,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Textarea,
  useForm,
  zodResolver,
} from '@/components/forms';

// ---------- LOGIN ----------

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'At least 8 characters'),
  remember: z.boolean(),
});
type LoginValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const [submitted, setSubmitted] = useState<LoginValues | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });
  const { register, formState, control } = form;
  const { errors } = formState;

  return (
    <Form
      form={form}
      onSubmit={(values) => setSubmitted(values)}
      className="space-y-4"
    >
      <FormField label="Email" required error={errors.email?.message}>
        <Input
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          {...register('email')}
        />
      </FormField>

      <FormField label="Password" required error={errors.password?.message}>
        <Input
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          {...register('password')}
        />
      </FormField>

      <Controller
        control={control}
        name="remember"
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={field.value}
              onChange={(e) => field.onChange(e.currentTarget.checked)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              aria-label="Remember me"
            />
            Remember me on this device
          </label>
        )}
      />

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="submit" isLoading={formState.isSubmitting}>
          Sign in
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

// ---------- SETTINGS ----------

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
});
type SettingsValues = z.infer<typeof settingsSchema>;

function SettingsForm() {
  const [submitted, setSubmitted] = useState<SettingsValues | null>(null);
  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: 'Ada Lovelace',
      role: 'editor',
      notifications: { email: true, push: false, sms: false },
      theme: 'system',
      active: true,
      bio: '',
    },
  });
  const { register, control, formState, reset } = form;
  const { errors } = formState;

  return (
    <Form
      form={form}
      onSubmit={(values) => setSubmitted(values)}
      className="space-y-5"
    >
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

      <FormField
        label="Account active"
        description="Disabled accounts cannot sign in."
      >
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

      <FormField
        label="Bio"
        description="Up to 280 characters."
        error={errors.bio?.message}
      >
        <Textarea
          autoResize
          minRows={3}
          maxRows={8}
          placeholder="A short blurb..."
          {...register('bio')}
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

// ---------- PAGE ----------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="rounded-lg border border-border bg-surface p-6">{children}</div>
    </section>
  );
}

export function FormsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
        <p className="mt-1 text-foreground-muted">
          Form primitives composed with react-hook-form + zod validation.
        </p>
      </header>

      <Section title="Login form">
        <LoginForm />
      </Section>

      <Separator />

      <Section title="User settings form">
        <SettingsForm />
      </Section>
    </div>
  );
}
