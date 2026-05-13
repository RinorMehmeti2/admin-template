import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, CheckCircle2, Settings, User } from 'lucide-react';
import { z } from 'zod';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Switch } from '@/components/forms/Switch';
import {
  FormWizard,
  FormWizardStep,
  type FormWizardHandle,
} from '@/components/forms/FormWizard';
import { Button } from '@/components/primitives/Button';
import { useToast } from '@/context/ToastProvider';
import { Section } from '../../_shared/Section';
import { useWizardLabels } from './useWizardLabels';

interface ClassicValues {
  email: string;
  password: string;
  fullName: string;
  bio: string;
  workspace: string;
  plan: 'free' | 'pro' | 'enterprise';
  digest: boolean;
}

export function ClassicWizardSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const labels = useWizardLabels();
  const [submitted, setSubmitted] = useState(false);
  const wizardRef = useRef<FormWizardHandle<ClassicValues>>(null);

  const stepAccount = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t('forms.zod.required'))
          .email(t('forms.zod.invalidEmail')),
        password: z.string().min(8, t('forms.zod.minLength', { count: 8 })),
      }),
    [t],
  );
  const stepProfile = useMemo(
    () =>
      z.object({
        fullName: z.string().min(1, t('forms.zod.required')),
        bio: z.string().min(1, t('forms.zod.required')),
      }),
    [t],
  );
  const stepPrefs = useMemo(
    () =>
      z.object({
        workspace: z.string().min(1, t('forms.zod.required')),
        plan: z.enum(['free', 'pro', 'enterprise']),
        digest: z.boolean(),
      }),
    [t],
  );
  const fullSchema = useMemo(() => stepAccount.merge(stepProfile).merge(stepPrefs), [
    stepAccount,
    stepProfile,
    stepPrefs,
  ]);

  if (submitted) {
    return (
      <Section
        id="classic"
        title={t('forms.multiStep.classic.title')}
        description={t('forms.multiStep.classic.description')}
      >
        <div className="flex flex-col items-start gap-3 rounded-md border border-success/30 bg-success/10 p-4">
          <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
          <p className="text-sm font-semibold">Account created.</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              wizardRef.current?.reset();
            }}
          >
            Start over
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section
      id="classic"
      title={t('forms.multiStep.classic.title')}
      description={t('forms.multiStep.classic.description')}
    >
      <FormWizard
        ref={wizardRef}
        schema={fullSchema}
        defaultValues={{
          email: '',
          password: '',
          fullName: '',
          bio: '',
          workspace: '',
          plan: 'free',
          digest: true,
        }}
        persistKey="demo:forms:classic-wizard"
        autoRestore
        responsiveOrientation
        compactBelow="sm"
        showSummaryStep
        labels={labels}
        onSubmit={() => {
          toast.success('Account created');
          setSubmitted(true);
        }}
      >
        <FormWizardStep<ClassicValues>
          id="account"
          title="Account"
          description="Sign-in credentials"
          icon={<User className="h-4 w-4" />}
          schema={stepAccount}
          render={({ form }) => (
            <div className="max-w-md space-y-4">
              <FormField label="Email" required error={form.formState.errors.email?.message}>
                <Input type="email" autoComplete="email" {...form.register('email')} />
              </FormField>
              <FormField label="Password" required error={form.formState.errors.password?.message}>
                <Input
                  type="password"
                  autoComplete="new-password"
                  {...form.register('password')}
                />
              </FormField>
            </div>
          )}
        />
        <FormWizardStep<ClassicValues>
          id="profile"
          title="Profile"
          description="Tell us about you"
          icon={<Briefcase className="h-4 w-4" />}
          schema={stepProfile}
          render={({ form }) => (
            <div className="max-w-md space-y-4">
              <FormField label="Full name" required error={form.formState.errors.fullName?.message}>
                <Input {...form.register('fullName')} />
              </FormField>
              <FormField label="Bio" required error={form.formState.errors.bio?.message}>
                <Textarea rows={3} {...form.register('bio')} />
              </FormField>
            </div>
          )}
        />
        <FormWizardStep<ClassicValues>
          id="preferences"
          title="Preferences"
          description="Workspace & plan"
          icon={<Settings className="h-4 w-4" />}
          schema={stepPrefs}
          render={({ form }) => (
            <div className="max-w-md space-y-4">
              <FormField label="Workspace" required error={form.formState.errors.workspace?.message}>
                <Input {...form.register('workspace')} />
              </FormField>
              <FormField label="Plan">
                <Select {...form.register('plan')}>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </Select>
              </FormField>
              <label className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
                <span>Weekly digest email</span>
                <Switch
                  checked={form.watch('digest')}
                  onChange={(e) => form.setValue('digest', e.target.checked, { shouldDirty: true })}
                />
              </label>
            </div>
          )}
        />
      </FormWizard>
    </Section>
  );
}
