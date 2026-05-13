import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Receipt, User, UserCheck } from 'lucide-react';
import { z } from 'zod';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Radio } from '@/components/forms/Radio';
import { RadioGroup } from '@/components/forms/RadioGroup';
import { FormWizard, FormWizardStep } from '@/components/forms/FormWizard';
import { useToast } from '@/context/ToastProvider';
import { Section } from '../../_shared/Section';
import { useWizardLabels } from './useWizardLabels';

type AccountType = 'personal' | 'business';

interface BranchValues {
  accountType: AccountType;
  fullName: string;
  email: string;
  companyName: string;
  vatId: string;
  taxRegion: string;
}

export function BranchingWizardSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const labels = useWizardLabels('Finish');
  const [accountType, setAccountType] = useState<AccountType>('personal');

  const typeSchema = useMemo(
    () => z.object({ accountType: z.enum(['personal', 'business']) }),
    [],
  );
  const personalSchema = useMemo(
    () =>
      z.object({
        fullName: z.string().min(1, t('forms.zod.required')),
        email: z
          .string()
          .min(1, t('forms.zod.required'))
          .email(t('forms.zod.invalidEmail')),
      }),
    [t],
  );
  const companySchema = useMemo(
    () =>
      z.object({
        companyName: z.string().min(1, t('forms.zod.required')),
        vatId: z.string().min(1, t('forms.zod.required')),
      }),
    [t],
  );
  const taxSchema = useMemo(
    () => z.object({ taxRegion: z.string().min(1, t('forms.zod.required')) }),
    [t],
  );

  const fullSchema = useMemo(() => {
    const merged = typeSchema.merge(personalSchema).extend({
      companyName: z.string().default(''),
      vatId: z.string().default(''),
      taxRegion: z.string().default(''),
    });
    return merged;
  }, [typeSchema, personalSchema]);

  return (
    <Section
      id="branching"
      title={t('forms.multiStep.branching.title')}
      description={t('forms.multiStep.branching.description')}
    >
      <FormWizard
        schema={fullSchema}
        defaultValues={{
          accountType: 'personal',
          fullName: '',
          email: '',
          companyName: '',
          vatId: '',
          taxRegion: '',
        }}
        responsiveOrientation
        compactBelow="sm"
        labels={labels}
        onSubmit={(values) => {
          toast.success(`Account created (${values.accountType})`);
        }}
      >
        <FormWizardStep<BranchValues>
          id="type"
          title="Account type"
          icon={<UserCheck className="h-4 w-4" />}
          schema={typeSchema}
          render={({ form }) => (
            <div className="max-w-md space-y-3">
              <FormField label="Type">
                <RadioGroup
                  name="accountType"
                  value={form.watch('accountType')}
                  onValueChange={(v) => {
                    const next = v as AccountType;
                    form.setValue('accountType', next, { shouldDirty: true });
                    setAccountType(next);
                  }}
                  orientation="vertical"
                >
                  <Radio value="personal">Personal · 3-step flow</Radio>
                  <Radio value="business">Business · 5-step flow with VAT + tax region</Radio>
                </RadioGroup>
              </FormField>
            </div>
          )}
        />
        <FormWizardStep<BranchValues>
          id="personal"
          title="Identity"
          icon={<User className="h-4 w-4" />}
          schema={personalSchema}
          render={({ form }) => (
            <div className="max-w-md space-y-4">
              <FormField label="Full name" required error={form.formState.errors.fullName?.message}>
                <Input {...form.register('fullName')} />
              </FormField>
              <FormField label="Email" required error={form.formState.errors.email?.message}>
                <Input type="email" {...form.register('email')} />
              </FormField>
            </div>
          )}
        />
        <FormWizardStep<BranchValues>
          id="company"
          title="Company"
          icon={<Building2 className="h-4 w-4" />}
          schema={companySchema}
          hidden={accountType !== 'business'}
          render={({ form }) => (
            <div className="max-w-md space-y-4">
              <FormField
                label="Company name"
                required
                error={form.formState.errors.companyName?.message}
              >
                <Input {...form.register('companyName')} />
              </FormField>
              <FormField label="VAT ID" required error={form.formState.errors.vatId?.message}>
                <Input {...form.register('vatId')} />
              </FormField>
            </div>
          )}
        />
        <FormWizardStep<BranchValues>
          id="tax"
          title="Tax region"
          icon={<Receipt className="h-4 w-4" />}
          schema={taxSchema}
          hidden={accountType !== 'business'}
          render={({ form }) => (
            <div className="max-w-md space-y-4">
              <FormField
                label="Tax region"
                required
                error={form.formState.errors.taxRegion?.message}
              >
                <Input placeholder="e.g. EU-DE, US-CA" {...form.register('taxRegion')} />
              </FormField>
            </div>
          )}
        />
      </FormWizard>
    </Section>
  );
}
