import { useState } from 'react';
import { z } from 'zod';
import { Heart, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Separator } from '@/components/primitives/Separator';
import { Alert } from '@/components/feedback/Alert';
import { ApiError, useApiFormSubmit, useApiMutation } from '@/data';
import {
  Checkbox,
  ColorPicker,
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
  NumberInput,
  OtpInput,
  PhoneInput,
  Radio,
  RadioGroup,
  Rating,
  LazyRichTextEditor,
  RangeSlider,
  type RangeSliderValue,
  Select,
  Slider,
  Switch,
  TagInput,
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
  description: z.string().refine((html) => html.replace(/<[^>]*>/g, '').trim().length > 0, {
    message: 'Description is required',
  }),
});
type SettingsValues = z.infer<typeof settingsSchema>;

// ScenarioPicker drives the mock API so reviewers can demo each error path
// without touching the network layer. In production the mutation would call
// the real endpoint via `api()`.
type SettingsScenario = 'success' | 'fieldErrors' | 'serverError' | 'authExpired';

function fakeSettingsApi(
  scenario: SettingsScenario,
  values: SettingsValues,
): Promise<SettingsValues> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (scenario === 'success') return resolve(values);
      if (scenario === 'fieldErrors') {
        // 422 with zod-style field map → useApiFormSubmit dispatches per-field
        // setError calls back into RHF.
        return reject(
          new ApiError({
            status: 422,
            message: 'Some fields need attention.',
            code: 'validation',
            payload: {
              fields: {
                name: 'That display name is already taken.',
                bio: 'Bio cannot reference internal usernames.',
              },
            },
          }),
        );
      }
      if (scenario === 'serverError') {
        // 500 → mapApiError → toast (the helper fires toast.error itself).
        return reject(
          new ApiError({ status: 500, message: 'Could not save settings. Try again.' }),
        );
      }
      // 'authExpired' → 401 → mapApiError returns a redirect action; the
      // helper navigates the user to /login.
      reject(new ApiError({ status: 401, message: 'Session expired.' }));
    }, 300);
  });
}

function SettingsForm() {
  const [submitted, setSubmitted] = useState<SettingsValues | null>(null);
  const [scenario, setScenario] = useState<SettingsScenario>('success');

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

  // INTEGRATION POINT 1: the mutation opts out of the global error dispatcher.
  // Without `meta.handlesErrors`, the QueryClient's MutationCache.onError would
  // toast every failure and useApiFormSubmit would never get a chance to
  // setError per field.
  const mutation = useApiMutation<SettingsValues, SettingsValues>(
    (values) => fakeSettingsApi(scenario, values),
    {
      meta: { handlesErrors: true },
    },
  );

  // INTEGRATION POINT 2: useApiFormSubmit returns a SubmitHandler. It runs the
  // mutation, classifies failures via mapApiError, and routes them: inline
  // → form.setError, toast → toast.error, redirect → navigate, fatal →
  // re-throw to the nearest error boundary.
  const handleSubmit = useApiFormSubmit(form, mutation, {
    onSuccess: (data) => setSubmitted(data),
  });

  // INTEGRATION POINT 3: form-level server message is surfaced via the RHF
  // 'root.serverError' slot. RHF stores it on errors.root.serverError.
  const rootError = errors.root?.serverError?.message;

  return (
    <Form form={form} onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="Mock API scenario"
        description="Drives the fake mutation so each error path can be exercised without a backend."
      >
        <Select
          value={scenario}
          onChange={(e) => setScenario(e.currentTarget.value as SettingsScenario)}
        >
          <option value="success">Success</option>
          <option value="fieldErrors">422 — field errors</option>
          <option value="serverError">500 — toast</option>
          <option value="authExpired">401 — redirect to login</option>
        </Select>
      </FormField>

      {rootError !== undefined ? (
        <Alert variant="danger" title="Could not save" description={rootError} />
      ) : null}

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
            <LazyRichTextEditor
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
        <LazyRichTextEditor
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

// ---------- SLIDERS ----------

function SliderDemo() {
  const [volume, setVolume] = useState(40);
  const [opacity, setOpacity] = useState(75);
  const [budget, setBudget] = useState<RangeSliderValue>([200, 1500]);

  return (
    <div className="space-y-8">
      <FormField label="Volume" description={`Currently ${volume}%`}>
        <Slider
          aria-label="Volume"
          value={volume}
          onValueChange={setVolume}
          formatValue={(v) => `${v}%`}
        />
      </FormField>

      <FormField label="Opacity" description="With marks">
        <Slider
          aria-label="Opacity"
          value={opacity}
          onValueChange={setOpacity}
          step={25}
          marks={[
            { value: 0, label: '0%' },
            { value: 25, label: '25%' },
            { value: 50, label: '50%' },
            { value: 75, label: '75%' },
            { value: 100, label: '100%' },
          ]}
          formatValue={(v) => `${v}%`}
        />
      </FormField>

      <FormField
        label="Budget range"
        description={`$${budget[0].toLocaleString()} – $${budget[1].toLocaleString()}`}
      >
        <RangeSlider
          aria-label="Budget range"
          thumbAriaLabels={['Min budget', 'Max budget']}
          min={0}
          max={5000}
          step={50}
          minDistance={100}
          value={budget}
          onValueChange={setBudget}
          formatValue={(v) => `$${v.toLocaleString()}`}
        />
      </FormField>
    </div>
  );
}

// ---------- TAG INPUT ----------

function TagInputDemo() {
  const [tags, setTags] = useState<string[]>(['react', 'typescript']);
  const [emails, setEmails] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>(['frontend']);

  const validateEmail = (raw: string): string | null => {
    const t = raw.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t : null;
  };

  return (
    <div className="space-y-6">
      <FormField label="Tags" description="Press comma, Enter, or Tab to commit a tag.">
        <TagInput value={tags} onValueChange={setTags} placeholder="Add tag…" />
      </FormField>

      <FormField label="Recipients" description="Email validation — invalid entries shake.">
        <TagInput
          value={emails}
          onValueChange={setEmails}
          validate={validateEmail}
          placeholder="someone@example.com"
        />
      </FormField>

      <FormField label="Topics" description="With suggestions; ArrowDown to open.">
        <TagInput
          value={topics}
          onValueChange={setTopics}
          suggestions={[
            'frontend',
            'backend',
            'design',
            'docs',
            'a11y',
            'performance',
            'testing',
            'ops',
          ]}
          maxTags={5}
          placeholder="Pick a topic…"
        />
      </FormField>
    </div>
  );
}

// ---------- OTP INPUT ----------

function OtpInputDemo() {
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [completed, setCompleted] = useState<string | null>(null);
  const [alpha, setAlpha] = useState('');

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="PIN (4 digits)">
        <OtpInput length={4} value={pin} onValueChange={setPin} autoFocusOnMount={false} />
        <p className="mt-1 text-xs text-foreground-muted">value: {pin || '(empty)'}</p>
      </FormField>

      <FormField label="Verification code" description="onComplete fires on last digit.">
        <OtpInput
          length={6}
          value={code}
          onValueChange={setCode}
          onComplete={setCompleted}
          autoFocusOnMount={false}
        />
        <p className="mt-1 text-xs text-foreground-muted">
          {completed !== null ? `complete: ${completed}` : 'value: ' + (code || '(empty)')}
        </p>
      </FormField>

      <FormField label="Alphanumeric" description="Letters + digits accepted.">
        <OtpInput
          length={6}
          allowedChars={/^[0-9a-zA-Z]$/}
          value={alpha}
          onValueChange={setAlpha}
          autoFocusOnMount={false}
        />
      </FormField>

      <FormField label="Masked" description="Renders dots like a password.">
        <OtpInput length={6} masked autoFocusOnMount={false} />
      </FormField>
    </div>
  );
}

// ---------- PHONE INPUT ----------

function PhoneInputDemo() {
  const [us, setUs] = useState<string | null>(null);
  const [de, setDe] = useState<string | null>(null);
  const [pref, setPref] = useState<string | null>(null);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="Phone (US default)" description="E.164 emitted when valid.">
        <PhoneInput defaultCountry="US" onValueChange={setUs} />
        <p className="mt-1 text-xs text-foreground-muted">{us ?? '(invalid / empty)'}</p>
      </FormField>

      <FormField label="Telefon (DE default)" description="Paste +44… to auto-switch country.">
        <PhoneInput defaultCountry="DE" onValueChange={setDe} />
        <p className="mt-1 text-xs text-foreground-muted">{de ?? '(invalid / empty)'}</p>
      </FormField>

      <FormField label="Preferred countries" description="DE/FR/GB pinned to top of list.">
        <PhoneInput
          defaultCountry="US"
          preferredCountries={['DE', 'FR', 'GB']}
          onValueChange={setPref}
        />
        <p className="mt-1 text-xs text-foreground-muted">{pref ?? '(invalid / empty)'}</p>
      </FormField>

      <FormField label="Disabled">
        <PhoneInput defaultCountry="US" defaultValue="+14155551212" disabled />
      </FormField>
    </div>
  );
}

// ---------- NUMBER INPUT ----------

function NumberInputDemo() {
  const [price, setPrice] = useState<number | null>(1299.99);
  const [eur, setEur] = useState<number | null>(1299.5);
  const [pct, setPct] = useState<number | null>(0.42);
  const [rating, setRating] = useState<number | null>(5);
  const [rate, setRate] = useState<number | null>(3.14);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="Price (USD)" description="en-US, currency formatting, step 0.01.">
        <NumberInput
          locale="en-US"
          formatOptions={{ style: 'currency', currency: 'USD' }}
          precision={2}
          step={0.01}
          min={0}
          value={price}
          onValueChange={setPrice}
        />
      </FormField>

      <FormField label="Precio (EUR)" description="es-ES grouping (1.299,50 €).">
        <NumberInput
          locale="es-ES"
          formatOptions={{ style: 'currency', currency: 'EUR' }}
          precision={2}
          step={0.01}
          min={0}
          value={eur}
          onValueChange={setEur}
        />
      </FormField>

      <FormField label="Completion" description="Percent format. 0–1, step 0.01.">
        <NumberInput
          formatOptions={{ style: 'percent' }}
          precision={0}
          step={0.01}
          min={0}
          max={1}
          value={pct}
          onValueChange={setPct}
        />
      </FormField>

      <FormField label="Rating" description="0–10, integer, Home/End jump to bounds.">
        <NumberInput min={0} max={10} step={1} value={rating} onValueChange={setRating} />
      </FormField>

      <FormField label="Rate" description="Two decimals.">
        <NumberInput precision={2} step={0.01} value={rate} onValueChange={setRate} />
      </FormField>

      <FormField label="With affixes" description="Prefix/suffix slots.">
        <NumberInput prefix="$" suffix="USD" precision={2} step={0.01} defaultValue={1234.5} />
      </FormField>
    </div>
  );
}

// ---------- RATING ----------

function RatingDemo() {
  const [rating, setRating] = useState(0);
  const [survey, setSurvey] = useState(7);
  const [hearts, setHearts] = useState(2);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="Rate this article" description="Half-star precision, click again to clear.">
        <Rating value={rating} onValueChange={setRating} max={5} allowHalf />
        <p className="mt-1 text-xs text-foreground-muted">value: {rating}</p>
      </FormField>

      <FormField label="NPS — 0 to 10" description="Survey scale, integer steps.">
        <Rating value={survey} onValueChange={setSurvey} max={10} size="sm" />
        <p className="mt-1 text-xs text-foreground-muted">score: {survey}</p>
      </FormField>

      <FormField label="Hearts" description="Custom icon.">
        <Rating value={hearts} onValueChange={setHearts} max={5} icon={Heart} size="lg" />
      </FormField>

      <FormField label="Average rating" description="Read-only summary.">
        <Rating value={4.5} max={5} allowHalf readOnly />
        <p className="mt-1 text-xs text-foreground-muted">4.5 / 5 (1,284 reviews)</p>
      </FormField>
    </div>
  );
}

// ---------- COLOR PICKER ----------

const BRAND_PRESETS: ReadonlyArray<string> = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

function ColorPickerDemo() {
  const [hex, setHex] = useState('#3b82f6');
  const [rgb, setRgb] = useState('rgb(34, 197, 94)');
  const [alpha, setAlpha] = useState('rgba(239, 68, 68, 0.5)');
  const [brand, setBrand] = useState('#22c55e');

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <FormField label="Hex" description="Default format.">
        <ColorPicker value={hex} onValueChange={setHex} />
        <p className="mt-1 font-mono text-xs text-foreground-muted">{hex}</p>
      </FormField>

      <FormField label="RGB with toggle" description="Toggle format inside the popover.">
        <ColorPicker value={rgb} onValueChange={setRgb} format="rgb" />
        <p className="mt-1 font-mono text-xs text-foreground-muted">{rgb}</p>
      </FormField>

      <FormField label="With alpha" description="Alpha slider + transparency-aware output.">
        <ColorPicker value={alpha} onValueChange={setAlpha} withAlpha format="rgb" />
        <div
          aria-hidden="true"
          className="mt-2 h-12 rounded-md border border-border"
          style={{ backgroundColor: alpha }}
        />
      </FormField>

      <FormField label="Brand color" description="With preset palette.">
        <ColorPicker value={brand} onValueChange={setBrand} presets={BRAND_PRESETS} />
      </FormField>
    </div>
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

      <Separator />

      <Section title="Sliders">
        <SliderDemo />
      </Section>

      <Separator />

      <Section title="Number input">
        <NumberInputDemo />
      </Section>

      <Separator />

      <Section title="Phone input">
        <PhoneInputDemo />
      </Section>

      <Separator />

      <Section title="OTP input">
        <OtpInputDemo />
      </Section>

      <Separator />

      <Section title="Tag input">
        <TagInputDemo />
      </Section>

      <Separator />

      <Section title="Rating">
        <RatingDemo />
      </Section>

      <Separator />

      <Section title="Color picker">
        <ColorPickerDemo />
      </Section>
    </div>
  );
}
