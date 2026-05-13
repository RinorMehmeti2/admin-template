import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  LayoutGrid,
  LayoutTemplate,
  ListChecks,
  Loader,
  Mail,
  Plus,
  Rows,
  ShieldCheck,
  Sparkles,
  Table as TableIcon,
  User,
} from 'lucide-react';
import { z } from 'zod';
import { Form, useForm, zodResolver } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Repeater } from '@/components/forms/Repeater';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import { useApiFormSubmit, useApiMutation } from '@/data';
import { Section } from './_shared/Section';
import { PreviewPanel } from './_shared/PreviewPanel';
import { COUNTRY_OPTIONS } from './_shared/data';

interface Capability {
  to: string;
  titleKey: string;
  body: string;
  icon: ReactNode;
}

const CAPABILITIES: ReadonlyArray<Capability> = [
  {
    to: '/forms/fields',
    titleKey: 'nav.forms.fields',
    body: 'Every form control wrapped in an RHF context. Tokens drive every color, hint, error.',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    to: '/forms/layouts',
    titleKey: 'nav.forms.layouts',
    body: 'Single, two-column, sectioned with sticky sidebar, inline, and compact density.',
    icon: <LayoutTemplate className="h-4 w-4" />,
  },
  {
    to: '/forms/validation',
    titleKey: 'nav.forms.validation',
    body: 'Sync + cross-field + async unique + server 422 + conditional + error summary.',
    icon: <ShieldCheck className="h-4 w-4" />,
  },
  {
    to: '/forms/cards',
    titleKey: 'nav.forms.cards',
    body: 'Cards as section containers, selectable plans, nested mini-forms, live stat summaries.',
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  {
    to: '/forms/tables',
    titleKey: 'nav.forms.tables',
    body: 'useFieldArray-bound invoice lines, editable rosters, dependent rows, read-only review.',
    icon: <TableIcon className="h-4 w-4" />,
  },
  {
    to: '/forms/multi-step',
    titleKey: 'nav.forms.multiStep',
    body: 'FormWizard end-to-end — including the headline step → next-step table append pattern.',
    icon: <ListChecks className="h-4 w-4" />,
  },
  {
    to: '/forms/repeater',
    titleKey: 'nav.forms.repeater',
    body: 'Dynamic field arrays, compound rows, nested useFieldArray.',
    icon: <Rows className="h-4 w-4" />,
  },
  {
    to: '/forms/async',
    titleKey: 'nav.forms.async',
    body: 'Async submit, autosave, dirty guard, optimistic updates, Suspense-loaded defaults.',
    icon: <Loader className="h-4 w-4" />,
  },
  {
    to: '/forms',
    titleKey: 'nav.forms.overview',
    body: 'You are here — capability grid plus the trailer demo below combining four patterns.',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
];

interface TrailerEmail {
  address: string;
}

interface TrailerValues {
  customer: {
    name: string;
    email: string;
    department: string;
  };
  address: {
    street: string;
    city: string;
    zip: string;
    country: string;
  };
  extraEmails: TrailerEmail[];
  notes: string;
}

async function fakeSubmit(): Promise<{ id: string }> {
  await new Promise((r) => setTimeout(r, 800));
  return { id: `acct-${Date.now().toString(36)}` };
}

function TrailerDemo() {
  const { t } = useTranslation();
  const [createdId, setCreatedId] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        customer: z.object({
          name: z.string().min(1, t('forms.zod.required')),
          email: z
            .string()
            .min(1, t('forms.zod.required'))
            .email(t('forms.zod.invalidEmail')),
          department: z.string().min(1, t('forms.zod.required')),
        }),
        address: z.object({
          street: z.string().min(1, t('forms.zod.required')),
          city: z.string().min(1, t('forms.zod.required')),
          zip: z
            .string()
            .min(1, t('forms.zod.required'))
            .regex(/^[A-Z0-9 -]{3,10}$/i, t('forms.zod.invalidZip')),
          country: z.string().min(2),
        }),
        extraEmails: z.array(
          z.object({
            address: z
              .string()
              .min(1, t('forms.zod.required'))
              .email(t('forms.zod.invalidEmail')),
          }),
        ),
        notes: z.string(),
      }),
    [t],
  );

  const form = useForm<TrailerValues>({
    defaultValues: {
      customer: { name: '', email: '', department: 'Engineering' },
      address: { street: '', city: '', zip: '', country: 'US' },
      extraEmails: [],
      notes: '',
    },
    resolver: zodResolver(schema),
  });

  const mutation = useApiMutation<{ id: string }, TrailerValues>(
    () => fakeSubmit(),
    { meta: { handlesErrors: true } },
  );
  const onSubmit = useApiFormSubmit(form, mutation, {
    onSuccess: (data) => {
      setCreatedId(data.id);
    },
  });

  if (createdId !== null) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-6">
        <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
        <div>
          <p className="text-base font-semibold">Customer created</p>
          <p className="text-sm text-foreground-muted">ID · {createdId}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setCreatedId(null);
            form.reset();
          }}
        >
          Start a new one
        </Button>
      </div>
    );
  }

  const errors = form.formState.errors;

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card variant="outlined">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </span>
              Customer
            </CardTitle>
            <CardDescription>Identity + department.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 pt-2">
            <FormField label="Full name" required error={errors.customer?.name?.message}>
              <Input {...form.register('customer.name')} autoComplete="name" />
            </FormField>
            <FormField label="Email" required error={errors.customer?.email?.message}>
              <Input
                type="email"
                leftIcon={<Mail className="h-4 w-4" />}
                {...form.register('customer.email')}
                autoComplete="email"
              />
            </FormField>
            <FormField label="Department">
              <Select {...form.register('customer.department')}>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Sales">Sales</option>
                <option value="Support">Support</option>
              </Select>
            </FormField>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-base">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <LayoutGrid className="h-4 w-4" />
              </span>
              Billing address
            </CardTitle>
            <CardDescription>Nested address as its own card section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 pt-2">
            <FormField label="Street" required error={errors.address?.street?.message}>
              <Input {...form.register('address.street')} autoComplete="address-line1" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="City" required error={errors.address?.city?.message}>
                <Input {...form.register('address.city')} autoComplete="address-level2" />
              </FormField>
              <FormField label="ZIP" required error={errors.address?.zip?.message}>
                <Input {...form.register('address.zip')} autoComplete="postal-code" />
              </FormField>
            </div>
            <FormField label="Country">
              <Select {...form.register('address.country')}>
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </CardContent>
        </Card>
      </div>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-base">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Plus className="h-4 w-4" />
            </span>
            Additional contact emails
          </CardTitle>
          <CardDescription>Repeater · add up to 4 extra recipients.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          <Repeater<TrailerEmail>
            items={form.watch('extraEmails')}
            onChange={(items) =>
              form.setValue('extraEmails', [...items], {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            createItem={() => ({ address: '' })}
            max={4}
            addLabel="Add email"
            renderItem={({ item, update, index }) => {
              const err = errors.extraEmails?.[index]?.address?.message;
              return (
                <FormField label={`Extra email ${index + 1}`} hideLabel error={err}>
                  <Input
                    type="email"
                    leftIcon={<Mail className="h-4 w-4" />}
                    value={item.address}
                    onChange={(e) => update({ address: e.target.value })}
                    placeholder="extra@acme.test"
                  />
                </FormField>
              );
            }}
          />
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
          <CardDescription>Internal — never shown to the customer.</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          <FormField label="Notes" hideLabel>
            <Textarea rows={4} {...form.register('notes')} placeholder="Add any context…" />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" variant="primary" isLoading={mutation.isPending}>
          Create customer
        </Button>
      </div>

      <PreviewPanel form={form} defaultOpen={false} />
    </Form>
  );
}

export function FormsOverviewPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{t('forms.overview.title')}</h2>
        <p className="max-w-3xl text-foreground-muted">{t('forms.overview.subtitle')}</p>
      </header>

      <ul
        aria-label="Capabilities"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {CAPABILITIES.map((cap) => (
          <li key={cap.to}>
            <Link
              to={cap.to}
              className="group block h-full rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/40 hover:bg-surface-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {cap.icon}
                  </span>
                  {t(cap.titleKey)}
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-foreground-subtle transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-sm text-foreground-muted">{cap.body}</p>
            </Link>
          </li>
        ))}
      </ul>

      <Section
        id="trailer"
        eyebrow="Trailer demo"
        title={t('forms.overview.trailerTitle')}
        description={t('forms.overview.trailerSubtitle')}
      >
        <TrailerDemo />
      </Section>
    </div>
  );
}
