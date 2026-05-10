import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FocusMode } from '@/components/layout/FocusMode';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/primitives/Button';
import { Form, FormField, Input, Select, Textarea, useForm, zodResolver } from '@/components/forms';
import { useToast } from '@/context/ToastProvider';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer']),
  bio: z.string().max(280, 'Max 280 characters').optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

export function FocusDemoPage() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: 'editor',
      bio: '',
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">FocusMode</h1>
        <p className="mt-1 text-foreground-muted">
          A distraction-free chrome that paints over the viewport. Sidebar + Topbar are hidden;
          Escape exits. Useful for full-screen forms, document editors, and presentation surfaces.
        </p>
      </header>

      <section className="space-y-3 rounded-lg border border-border bg-surface p-6">
        <h2 className="text-base font-semibold">Profile editor</h2>
        <p className="text-sm text-foreground-muted">
          Click below to enter focus mode. Press{' '}
          <kbd className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">Esc</kbd>, click ✕, or
          press the back arrow to return.
        </p>
        <Button onClick={() => setOpen(true)}>Edit profile in focus mode</Button>
      </section>

      <section className="rounded-lg border border-dashed border-border p-6 text-sm text-foreground-muted">
        <h3 className="text-sm font-semibold text-foreground">When to use</h3>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Full-screen forms with many fields where the surrounding chrome is noise.</li>
          <li>Document / rich-text editors where you want the canvas to dominate.</li>
          <li>Wizard / onboarding flows triggered from a dashboard action.</li>
          <li>Presentation mode in BI tools.</li>
        </ul>
      </section>

      {open ? (
        <FocusMode
          title="Edit profile"
          onExit={() => setOpen(false)}
          toolbar={
            <Button
              size="sm"
              isLoading={form.formState.isSubmitting}
              onClick={form.handleSubmit((values) => {
                toast.success(`Saved ${values.name}`);
                setOpen(false);
                navigate('/focus');
              })}
            >
              Save
            </Button>
          }
        >
          <Container size="md" className="py-10">
            <Form form={form} onSubmit={() => undefined} className="space-y-5">
              <FormField label="Name" required error={form.formState.errors.name?.message}>
                <Input {...form.register('name')} />
              </FormField>
              <FormField label="Email" required error={form.formState.errors.email?.message}>
                <Input type="email" {...form.register('email')} />
              </FormField>
              <FormField label="Role" required error={form.formState.errors.role?.message}>
                <Select {...form.register('role')}>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </Select>
              </FormField>
              <FormField label="Bio" error={form.formState.errors.bio?.message}>
                <Textarea autoResize minRows={4} maxRows={10} {...form.register('bio')} />
              </FormField>
            </Form>
          </Container>
        </FocusMode>
      ) : null}
    </div>
  );
}
