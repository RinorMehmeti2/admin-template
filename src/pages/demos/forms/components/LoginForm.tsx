import { useState } from 'react';
import { z } from 'zod';
import { Lock, Mail } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import {
  Controller,
  Form,
  FormField,
  Input,
  Switch,
  useForm,
  zodResolver,
} from '@/components/forms';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'At least 8 characters'),
  remember: z.boolean(),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [submitted, setSubmitted] = useState<LoginValues | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });
  const { register, formState, control } = form;
  const { errors } = formState;

  return (
    <Form form={form} onSubmit={(values) => setSubmitted(values)} className="space-y-4">
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
        <pre className="mt-3 max-h-80 overflow-auto rounded-md border border-border bg-surface-muted p-3 text-xs text-foreground-muted">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      ) : null}
    </Form>
  );
}
