import { useNavigate } from 'react-router-dom';
import { FocusMode } from '@/components/layout/FocusMode';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/primitives/Button';
import { Form, FormField, Input, Select, Textarea, useForm, zodResolver } from '@/components/forms';
import { useToast } from '@/context/ToastProvider';
import { profileSchema, type ProfileValues } from '../model';

interface ProfileFocusEditorProps {
  onExit: () => void;
}

export function ProfileFocusEditor({ onExit }: ProfileFocusEditorProps) {
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
    <FocusMode
      title="Edit profile"
      onExit={onExit}
      toolbar={
        <Button
          size="sm"
          isLoading={form.formState.isSubmitting}
          onClick={form.handleSubmit((values) => {
            toast.success(`Saved ${values.name}`);
            onExit();
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
  );
}
