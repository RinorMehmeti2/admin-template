import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, User } from 'lucide-react';
import { z } from 'zod';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/feedback/Dialog';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { FormWizard, FormWizardStep } from '@/components/forms/FormWizard';
import { Button } from '@/components/primitives/Button';
import { useToast } from '@/context/ToastProvider';
import { Section } from '../../_shared/Section';
import { useWizardLabels } from './useWizardLabels';

interface InviteValues {
  email: string;
  role: string;
  fullName: string;
  message: string;
}

export function ModalWizardSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const labels = useWizardLabels('Send invite');

  const stepInvite = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t('forms.zod.required')).email(t('forms.zod.invalidEmail')),
        role: z.string().min(1, t('forms.zod.required')),
      }),
    [t],
  );
  const stepProfile = useMemo(
    () =>
      z.object({
        fullName: z.string().min(1, t('forms.zod.required')),
        message: z.string().optional().default(''),
      }),
    [t],
  );
  const fullSchema = useMemo(() => stepInvite.merge(stepProfile), [stepInvite, stepProfile]);

  return (
    <Section
      id="modal"
      title={t('forms.multiStep.modal.title')}
      description={t('forms.multiStep.modal.description')}
    >
      <Button type="button" variant="primary" onClick={() => setOpen(true)}>
        Invite teammate…
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>
              Two-step wizard inside a Dialog. Focus trap interacts cleanly with step transitions.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <FormWizard
              schema={fullSchema}
              defaultValues={{ email: '', role: 'viewer', fullName: '', message: '' }}
              labels={labels}
              onSubmit={() => {
                toast.success('Invitation sent');
                setOpen(false);
              }}
              responsiveOrientation
              compactBelow="sm"
            >
              <FormWizardStep<InviteValues>
                id="invite"
                title="Invite"
                icon={<User className="h-4 w-4" />}
                schema={stepInvite}
                render={({ form }) => (
                  <div className="space-y-4">
                    <FormField label="Email" required error={form.formState.errors.email?.message}>
                      <Input type="email" {...form.register('email')} />
                    </FormField>
                    <FormField label="Role" required error={form.formState.errors.role?.message}>
                      <Input {...form.register('role')} />
                    </FormField>
                  </div>
                )}
              />
              <FormWizardStep<InviteValues>
                id="profile"
                title="Personalise"
                icon={<Briefcase className="h-4 w-4" />}
                schema={stepProfile}
                render={({ form }) => (
                  <div className="space-y-4">
                    <FormField
                      label="Full name"
                      required
                      error={form.formState.errors.fullName?.message}
                    >
                      <Input {...form.register('fullName')} />
                    </FormField>
                    <FormField label="Optional message">
                      <Input placeholder="Welcome to the team!" {...form.register('message')} />
                    </FormField>
                  </div>
                )}
              />
            </FormWizard>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </Section>
  );
}
