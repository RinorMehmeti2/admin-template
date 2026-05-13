import { useTranslation } from 'react-i18next';
import { Briefcase, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { Controller, Form, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Switch } from '@/components/forms/Switch';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';
import { EMPLOYEE_DEPARTMENTS } from '../../_shared/data';

interface ProfileValues {
  // Identity
  firstName: string;
  lastName: string;
  email: string;
  // Job
  department: string;
  role: string;
  manager: string;
  // Compensation
  salary: string;
  currency: string;
  // Access
  isAdmin: boolean;
  canPublish: boolean;
  canBilling: boolean;
  // Notes
  notes: string;
}

interface CardSectionProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}

function FormCard({ icon, title, description, children }: CardSectionProps) {
  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-base">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
          {title}
        </CardTitle>
        {description !== undefined ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3 px-6 pb-6 pt-3">{children}</CardContent>
    </Card>
  );
}

export function ProfileCardsSection() {
  const { t } = useTranslation();
  const form = useForm<ProfileValues>({
    defaultValues: {
      firstName: 'Alex',
      lastName: 'Kowalski',
      email: 'alex.kowalski@acme.test',
      department: 'Engineering',
      role: 'Staff engineer',
      manager: 'emp-1',
      salary: '180000',
      currency: 'USD',
      isAdmin: false,
      canPublish: true,
      canBilling: false,
      notes: '',
    },
  });

  return (
    <Section
      id="profile-cards"
      title={t('forms.cards.sections.title')}
      description={t('forms.cards.sections.description')}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FormCard
            icon={<User className="h-4 w-4" />}
            title="Identity"
            description="Names visible across the platform."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="First name" required>
                <Input {...form.register('firstName')} autoComplete="given-name" />
              </FormField>
              <FormField label="Last name" required>
                <Input {...form.register('lastName')} autoComplete="family-name" />
              </FormField>
            </div>
            <FormField label="Email" required>
              <Input
                type="email"
                leftIcon={<Mail className="h-4 w-4" />}
                {...form.register('email')}
                autoComplete="email"
              />
            </FormField>
          </FormCard>

          <FormCard
            icon={<Briefcase className="h-4 w-4" />}
            title="Job"
            description="Department, role, reporting line."
          >
            <FormField label="Department">
              <Select {...form.register('department')}>
                {EMPLOYEE_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </FormField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Role">
                <Input {...form.register('role')} />
              </FormField>
              <FormField label="Manager">
                <Select {...form.register('manager')}>
                  <option value="emp-1">Amara Dao</option>
                  <option value="emp-2">Bao Eklund</option>
                  <option value="emp-3">Carla Goncalves</option>
                </Select>
              </FormField>
            </div>
          </FormCard>

          <FormCard
            icon={<Lock className="h-4 w-4" />}
            title="Compensation"
            description="Sensitive — visible to People only."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField label="Annual salary">
                <Input inputMode="decimal" {...form.register('salary')} />
              </FormField>
              <FormField label="Currency">
                <Select {...form.register('currency')}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </Select>
              </FormField>
            </div>
          </FormCard>

          <FormCard
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Access"
            description="Toggle permissions for this account."
          >
            <label htmlFor="profile-isAdmin" className="flex items-center justify-between gap-3 text-sm">
              <span>
                Admin
                <span className="block text-xs text-foreground-muted">
                  Full read/write to all settings.
                </span>
              </span>
              <Controller
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <Switch
                    id="profile-isAdmin"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            </label>
            <label htmlFor="profile-canPublish" className="flex items-center justify-between gap-3 text-sm">
              <span>Can publish content</span>
              <Controller
                control={form.control}
                name="canPublish"
                render={({ field }) => (
                  <Switch
                    id="profile-canPublish"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            </label>
            <label htmlFor="profile-canBilling" className="flex items-center justify-between gap-3 text-sm">
              <span>Can manage billing</span>
              <Controller
                control={form.control}
                name="canBilling"
                render={({ field }) => (
                  <Switch
                    id="profile-canBilling"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
            </label>
          </FormCard>
        </div>

        <FormCard
          icon={<User className="h-4 w-4" />}
          title="Notes"
          description="Internal — never shown to the employee."
        >
          <FormField label="Notes" hideLabel>
            <Textarea rows={4} {...form.register('notes')} placeholder="Add any context…" />
          </FormField>
        </FormCard>

        <div
          className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6"
          data-print="hide"
        >
          <Button type="button" variant="ghost" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" variant="primary">
            Save profile
          </Button>
        </div>
      </Form>

      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
