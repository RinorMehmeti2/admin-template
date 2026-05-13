import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Briefcase, Building2, User } from 'lucide-react';
import { FormField, Input, RadioGroup, Radio, Switch, Textarea } from '@/components/forms';
import {
  FormWizard,
  FormWizardStep,
  type StepIndicatorVariant,
  type WizardOrientation,
} from '@/components/forms/FormWizard';
import { Card, CardContent } from '@/components/data-display';
import { useToast } from '@/context/ToastProvider';
import { PERSIST_KEY } from '../data';
import type { WizardDemoValues } from '../model';

interface WizardDemoProps {
  orientation: WizardOrientation;
  variant: StepIndicatorVariant;
}

export function WizardDemo({ orientation, variant }: WizardDemoProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const fullSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t('wizardDemo.validation.emailRequired'))
          .email(t('wizardDemo.validation.emailInvalid')),
        password: z.string().min(8, t('wizardDemo.validation.passwordMin')),
        fullName: z.string().min(1, t('wizardDemo.validation.nameRequired')),
        bio: z.string().min(1, t('wizardDemo.validation.bioRequired')),
        workspace: z.string().min(1, t('wizardDemo.validation.workspaceRequired')),
        plan: z.string().min(1, t('wizardDemo.validation.planRequired')),
        agreeMarketing: z.boolean(),
      }),
    [t],
  );
  const stepAccount = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t('wizardDemo.validation.emailRequired'))
          .email(t('wizardDemo.validation.emailInvalid')),
        password: z.string().min(8, t('wizardDemo.validation.passwordMin')),
      }),
    [t],
  );
  const stepProfile = useMemo(
    () =>
      z.object({
        fullName: z.string().min(1, t('wizardDemo.validation.nameRequired')),
        bio: z.string().min(1, t('wizardDemo.validation.bioRequired')),
      }),
    [t],
  );
  const stepWorkspace = useMemo(
    () =>
      z.object({
        workspace: z.string().min(1, t('wizardDemo.validation.workspaceRequired')),
        plan: z.string().min(1, t('wizardDemo.validation.planRequired')),
      }),
    [t],
  );

  const labels = useMemo(
    () => ({
      nextLabel: t('forms.wizard.next'),
      backLabel: t('forms.wizard.back'),
      submitLabel: t('forms.wizard.submit'),
      summaryTitle: t('wizardDemo.step.review.title'),
      summaryDescription: t('wizardDemo.step.review.description'),
      summaryHelpText: t('forms.wizard.summaryHelp'),
      restoreDialogTitle: t('forms.wizard.restoreTitle'),
      restoreDialogDescription: t('forms.wizard.restoreDescription'),
      restoreConfirmLabel: t('forms.wizard.restoreConfirm'),
      restoreCancelLabel: t('forms.wizard.restoreCancel'),
      blockedToast: (step: string) => t('forms.wizard.blockedToast', { step }),
      compactSummaryText: (current: number, total: number) =>
        t('forms.wizard.compactSummary', { current, total }),
    }),
    [t],
  );

  return (
    <Card>
      <CardContent className="p-6">
        <FormWizard
          schema={fullSchema}
          defaultValues={{
            email: '',
            password: '',
            fullName: '',
            bio: '',
            workspace: '',
            plan: '',
            agreeMarketing: false,
          }}
          orientation={orientation}
          stepIndicatorVariant={variant}
          persistKey={PERSIST_KEY}
          showSummaryStep
          responsiveOrientation
          compactBelow="sm"
          labels={labels}
          onSubmit={() => {
            toast.success(t('wizardDemo.submitSuccess'));
          }}
        >
          <FormWizardStep<WizardDemoValues>
            id="account"
            title={t('wizardDemo.step.account.title')}
            description={t('wizardDemo.step.account.description')}
            icon={<User className="h-4 w-4" />}
            schema={stepAccount}
            render={({ form }) => (
              <div className="space-y-4 max-w-md">
                <FormField
                  label={t('wizardDemo.field.email')}
                  error={form.formState.errors.email?.message}
                >
                  <Input type="email" autoComplete="email" {...form.register('email')} />
                </FormField>
                <FormField
                  label={t('wizardDemo.field.password')}
                  error={form.formState.errors.password?.message}
                >
                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...form.register('password')}
                  />
                </FormField>
              </div>
            )}
          />
          <FormWizardStep<WizardDemoValues>
            id="profile"
            title={t('wizardDemo.step.profile.title')}
            description={t('wizardDemo.step.profile.description')}
            icon={<Briefcase className="h-4 w-4" />}
            schema={stepProfile}
            render={({ form }) => (
              <div className="space-y-4 max-w-md">
                <FormField
                  label={t('wizardDemo.field.fullName')}
                  error={form.formState.errors.fullName?.message}
                >
                  <Input {...form.register('fullName')} />
                </FormField>
                <FormField
                  label={t('wizardDemo.field.bio')}
                  error={form.formState.errors.bio?.message}
                >
                  <Textarea rows={3} {...form.register('bio')} />
                </FormField>
              </div>
            )}
          />
          <FormWizardStep<WizardDemoValues>
            id="workspace"
            title={t('wizardDemo.step.workspace.title')}
            description={t('wizardDemo.step.workspace.description')}
            icon={<Building2 className="h-4 w-4" />}
            schema={stepWorkspace}
            render={({ form }) => (
              <div className="space-y-4 max-w-md">
                <FormField
                  label={t('wizardDemo.field.workspace')}
                  error={form.formState.errors.workspace?.message}
                >
                  <Input {...form.register('workspace')} />
                </FormField>
                <FormField
                  label={t('wizardDemo.field.plan')}
                  error={form.formState.errors.plan?.message}
                >
                  <RadioGroup
                    name="plan"
                    value={form.watch('plan') ?? ''}
                    onValueChange={(v) => form.setValue('plan', v, { shouldDirty: true })}
                    orientation="horizontal"
                  >
                    <Radio value="free">Free</Radio>
                    <Radio value="pro">Pro</Radio>
                    <Radio value="enterprise">Enterprise</Radio>
                  </RadioGroup>
                </FormField>
                <label className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
                  <span>{t('wizardDemo.field.agreeMarketing')}</span>
                  <Switch
                    checked={form.watch('agreeMarketing') === true}
                    onChange={(e) =>
                      form.setValue('agreeMarketing', e.target.checked, {
                        shouldDirty: true,
                      })
                    }
                  />
                </label>
              </div>
            )}
          />
        </FormWizard>
      </CardContent>
    </Card>
  );
}
