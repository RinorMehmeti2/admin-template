import { useState } from 'react';
import { z } from 'zod';
import { Lock, Mail } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Separator } from '@/components/primitives/Separator';
import {
  Checkbox,
  Combobox,
  ComboboxContent,
  ComboboxTrigger,
  Controller,
  DatePicker,
  DateRangePicker,
  type DateRange,
  Form,
  FormField,
  Input,
  Radio,
  RadioGroup,
  RichTextEditor,
  Select,
  Switch,
  Textarea,
  TimePicker,
  DateTimePicker,
  useForm,
  zodResolver,
} from '@/components/forms';
import { addDays } from '@/lib/date';

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
  description: z
    .string()
    .refine((html) => html.replace(/<[^>]*>/g, '').trim().length > 0, {
      message: 'Description is required',
    }),
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
      description:
        '<p>Mathematician, writer, and the first computer programmer. Notes on the <strong>Analytical Engine</strong> include what is now recognised as the first algorithm intended to be processed by a machine.</p>',
    },
  });
  const { register, control, formState, reset } = form;
  const { errors } = formState;

  return (
    <Form form={form} onSubmit={(values) => setSubmitted(values)} className="space-y-5">
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

      <FormField label="Account active" description="Disabled accounts cannot sign in.">
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

      <FormField label="Bio" description="Up to 280 characters." error={errors.bio?.message}>
        <Textarea
          autoResize
          minRows={3}
          maxRows={8}
          placeholder="A short blurb..."
          {...register('bio')}
        />
      </FormField>

      <FormField
        label="Description"
        description="Rich text — supports headings, lists, links, and inline formatting."
        required
        error={errors.description?.message}
      >
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.invalid}
              placeholder="Tell us about yourself…"
              toolbar="minimal"
              minHeight={140}
              aria-label="Description"
            />
          )}
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

// ---------- BIO EDITOR DEMO ----------

function BioEditorDemo() {
  const [html, setHtml] = useState<string>(
    '<h2>About</h2><p>Software engineer with a soft spot for <strong>typed APIs</strong> and <em>well-named identifiers</em>.</p><ul><li>React + TypeScript</li><li>ProseMirror</li><li>Design systems</li></ul>',
  );
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
      <FormField
        label="Bio"
        description="Full toolbar with bubble menu on selection. Try selecting some text."
      >
        <RichTextEditor
          value={html}
          onChange={setHtml}
          placeholder="Write your bio…"
          minHeight={220}
          aria-label="Bio"
        />
      </FormField>
      <div className="space-y-2 lg:pt-7">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
          Output HTML
        </p>
        <pre className="max-h-[260px] overflow-auto rounded-md border border-border bg-surface-muted p-3 text-xs text-foreground-muted">
          {html}
        </pre>
      </div>
    </div>
  );
}

// ---------- COMBOBOX DEMO ----------

interface Country {
  code: string;
  name: string;
}

const COUNTRIES: ReadonlyArray<Country> = [
  { code: 'us', name: 'United States' },
  { code: 'ca', name: 'Canada' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'jp', name: 'Japan' },
  { code: 'br', name: 'Brazil' },
  { code: 'in', name: 'India' },
  { code: 'mx', name: 'Mexico' },
  { code: 'za', name: 'South Africa' },
  { code: 'kr', name: 'South Korea' },
];

const TAG_SUGGESTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'frontend', label: 'frontend' },
  { value: 'backend', label: 'backend' },
  { value: 'design', label: 'design' },
  { value: 'docs', label: 'docs' },
  { value: 'a11y', label: 'a11y' },
  { value: 'performance', label: 'performance' },
  { value: 'testing', label: 'testing' },
];

function ComboboxDemo() {
  const [country, setCountry] = useState<string | ReadonlyArray<string>>('');
  const [tags, setTags] = useState<ReadonlyArray<string>>(['frontend', 'a11y']);
  const [tagItems, setTagItems] = useState(TAG_SUGGESTIONS);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="Country" description="Single-select with search.">
        <Combobox<Country>
          items={COUNTRIES}
          getItemLabel={(c) => c.name}
          getItemValue={(c) => c.code}
          value={country}
          onValueChange={setCountry}
        >
          <ComboboxTrigger placeholder="Pick a country…" />
          <ComboboxContent />
        </Combobox>
      </FormField>

      <FormField label="Tags" description="Multi-select. Type to create.">
        <Combobox<{ value: string; label: string }>
          items={tagItems}
          getItemLabel={(t) => t.label}
          getItemValue={(t) => t.value}
          multiple
          value={tags}
          onValueChange={(next) => {
            if (Array.isArray(next)) setTags(next);
          }}
          creatable
          onCreate={(name) => {
            const value = name.trim().toLowerCase().replace(/\s+/g, '-');
            if (value === '') return;
            setTagItems((cur) =>
              cur.some((t) => t.value === value) ? cur : [...cur, { value, label: name.trim() }],
            );
            setTags((cur) => (cur.includes(value) ? cur : [...cur, value]));
          }}
        >
          <ComboboxTrigger placeholder="Add tags…" />
          <ComboboxContent />
        </Combobox>
      </FormField>
    </div>
  );
}

// ---------- DATE PICKER DEMO ----------

function DatePickerDemo() {
  const [date, setDate] = useState<Date | null>(null);
  const [typedDate, setTypedDate] = useState<Date | null>(null);
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Date" description="Click to open the calendar.">
          <DatePicker value={date} onChange={setDate} placeholder="Pick a date" />
        </FormField>

        <FormField label="Date — typeable" description="allowTextInput, format YYYY-MM-DD.">
          <DatePicker
            value={typedDate}
            onChange={setTypedDate}
            allowTextInput
            format="yyyy-MM-dd"
            placeholder="2026-05-09"
          />
        </FormField>
      </div>

      <FormField label="Within next 30 days" description="With min/max bounds + weekend disabled.">
        <DatePicker
          minDate={today}
          maxDate={addDays(today, 30)}
          isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
          placeholder="Pick a weekday"
        />
      </FormField>

      <FormField label="Date range" description="Two months + presets.">
        <DateRangePicker value={range} onChange={setRange} />
      </FormField>
    </div>
  );
}

// ---------- TIME PICKER DEMO ----------

function TimePickerDemo() {
  const [t24, setT24] = useState<string | null>('09:30');
  const [t12, setT12] = useState<string | null>('14:30');
  const [tStep, setTStep] = useState<string | null>('09:00');
  const [tSec, setTSec] = useState<string | null>('10:15:30');

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="24-hour" description="Default format.">
        <TimePicker value={t24} onChange={(n) => setT24(typeof n === 'string' ? n : null)} />
      </FormField>

      <FormField label="12-hour" description="With AM/PM column.">
        <TimePicker
          format="12h"
          value={t12}
          onChange={(n) => setT12(typeof n === 'string' ? n : null)}
        />
      </FormField>

      <FormField label="15-min step" description="Quarter-hour increments.">
        <TimePicker
          step={15}
          value={tStep}
          onChange={(n) => setTStep(typeof n === 'string' ? n : null)}
        />
      </FormField>

      <FormField label="With seconds" description="HH:MM:SS.">
        <TimePicker
          withSeconds
          value={tSec}
          onChange={(n) => setTSec(typeof n === 'string' ? n : null)}
        />
      </FormField>
    </div>
  );
}

// ---------- DATE TIME PICKER DEMO ----------

function DateTimePickerDemo() {
  const [v, setV] = useState<Date | null>(null);
  return (
    <FormField label="When" description="Composed DatePicker + TimePicker.">
      <DateTimePicker value={v} onChange={setV} timeFormat="12h" step={15} />
      {v !== null ? <p className="text-xs text-foreground-muted">{v.toString()}</p> : null}
    </FormField>
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

      <Separator />

      <Section title="Bio editor (RichTextEditor)">
        <BioEditorDemo />
      </Section>

      <Separator />

      <Section title="Combobox / Autocomplete">
        <ComboboxDemo />
      </Section>

      <Separator />

      <Section title="Date pickers">
        <DatePickerDemo />
      </Section>

      <Separator />

      <Section title="Time picker">
        <TimePickerDemo />
      </Section>

      <Separator />

      <Section title="Date + time">
        <DateTimePickerDemo />
      </Section>
    </div>
  );
}
