import { useState, type ReactNode } from 'react';
import { ArrowRight, Globe, Key, Mail, Phone as PhoneIcon, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Repeater } from '@/components/forms/Repeater';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { FormField } from '@/components/forms/FormField';
import { Card, CardContent, CardTitle } from '@/components/data-display/Card';

/* --------------- Helpers --------------- */

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </header>
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">{children}</div>
    </section>
  );
}

/* --------------- Demos --------------- */

interface Email {
  address: string;
  kind: 'work' | 'personal' | 'other';
}

function EmailDemo() {
  const [emails, setEmails] = useState<Email[]>([{ address: 'alex@acme.com', kind: 'work' }]);

  return (
    <Repeater<Email>
      label="Contact emails"
      description="Used for system notifications and password resets. Max 5 addresses."
      items={emails}
      onChange={setEmails}
      createItem={(): Email => ({ address: '', kind: 'work' })}
      max={5}
      addLabel="Add email"
      renderItem={({ item, update, index }) => (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_150px]">
          <FormField label={`Email ${index + 1}`} hideLabel>
            <Input
              type="email"
              leftIcon={<Mail className="h-4 w-4" />}
              value={item.address}
              placeholder="name@example.com"
              onChange={(e) => update({ address: e.target.value })}
            />
          </FormField>
          <Select
            aria-label="Kind"
            value={item.kind}
            onChange={(e) => {
              const v = e.target.value;
              update({ kind: (v === 'personal' || v === 'other' ? v : 'work') as Email['kind'] });
            }}
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="other">Other</option>
          </Select>
        </div>
      )}
    />
  );
}

interface EnvVar {
  key: string;
  value: string;
}

function EnvVarsDemo() {
  const [envs, setEnvs] = useState<EnvVar[]>([
    { key: 'NODE_ENV', value: 'production' },
    { key: 'PORT', value: '3000' },
    { key: 'DATABASE_URL', value: 'postgres://localhost:5432/app' },
  ]);

  return (
    <Repeater<EnvVar>
      variant="stacked"
      label="Environment variables"
      description="Min 2, max 8. Stacked variant — rows share one border."
      items={envs}
      onChange={setEnvs}
      createItem={(): EnvVar => ({ key: '', value: '' })}
      min={2}
      max={8}
      addLabel="Add variable"
      renderItem={({ item, update }) => (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input
            aria-label="Variable key"
            leftIcon={<Key className="h-4 w-4" />}
            placeholder="KEY"
            value={item.key}
            onChange={(e) => update({ key: e.target.value })}
          />
          <Input
            aria-label="Variable value"
            placeholder="value"
            value={item.value}
            onChange={(e) => update({ value: e.target.value })}
          />
        </div>
      )}
    />
  );
}

interface TagItem {
  value: string;
}

function TagsDemo() {
  const [tags, setTags] = useState<TagItem[]>([{ value: 'admin' }, { value: 'beta' }]);

  return (
    <Repeater<TagItem>
      label="Role tags"
      description="Single input per row. Reorder ↑↓, remove, add up to 12."
      items={tags}
      onChange={setTags}
      createItem={(): TagItem => ({ value: '' })}
      max={12}
      addLabel="Add tag"
      renderItem={({ item, update }) => (
        <Input
          aria-label="Tag"
          leftIcon={<Tag className="h-4 w-4" />}
          value={item.value}
          placeholder="tag-name"
          onChange={(e) => update({ value: e.target.value })}
        />
      )}
    />
  );
}

interface Phone {
  number: string;
  country: string;
}

function PhonesDemo() {
  const [phones, setPhones] = useState<Phone[]>([{ number: '', country: 'US' }]);

  return (
    <Repeater<Phone>
      label="Phone numbers"
      description="Compound row · country select + number input. Reorderable."
      items={phones}
      onChange={setPhones}
      createItem={(): Phone => ({ number: '', country: 'US' })}
      max={4}
      addLabel="Add phone"
      renderItem={({ item, update, index }) => (
        // `minmax(0,1fr)` is required: without it, the right column can't shrink
        // below its content's intrinsic min-width, which lets a long phone
        // number or icon push the row past the grid container and trigger a
        // horizontal scrollbar on <main>. Country codes are plain text — flag
        // emojis fall back to oversized regional-indicator glyphs on Windows
        // and inflate the <select>'s intrinsic width, breaking the layout.
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[110px_minmax(0,1fr)]">
          <Select
            aria-label="Country"
            value={item.country}
            onChange={(e) => update({ country: e.target.value })}
          >
            <option value="US">US +1</option>
            <option value="GB">GB +44</option>
            <option value="DE">DE +49</option>
            <option value="JP">JP +81</option>
            <option value="XK">XK +383</option>
          </Select>
          <FormField label={`Phone ${index + 1}`} hideLabel>
            <Input
              type="tel"
              leftIcon={<PhoneIcon className="h-4 w-4" />}
              value={item.number}
              placeholder="555-0123"
              onChange={(e) => update({ number: e.target.value })}
            />
          </FormField>
        </div>
      )}
    />
  );
}

interface UrlItem {
  url: string;
}

function NoReorderDemo() {
  const [urls, setUrls] = useState<UrlItem[]>([{ url: 'https://example.com' }]);

  return (
    <Repeater<UrlItem>
      label="Allowed redirect URLs"
      description="Reorder + remove disabled — just add/remove."
      items={urls}
      onChange={setUrls}
      createItem={(): UrlItem => ({ url: '' })}
      max={6}
      addLabel="Add URL"
      reorderable={false}
      renderItem={({ item, update }) => (
        <Input
          aria-label="URL"
          leftIcon={<Globe className="h-4 w-4" />}
          type="url"
          value={item.url}
          placeholder="https://example.com/callback"
          onChange={(e) => update({ url: e.target.value })}
        />
      )}
    />
  );
}

interface Webhook {
  url: string;
  events: string;
  secret: string;
}

function ErrorDemo() {
  const [hooks, setHooks] = useState<Webhook[]>([
    { url: 'https://example.com/hook', events: 'order.created', secret: '' },
  ]);
  const hasEmptySecret = hooks.some((h) => h.secret.trim() === '');

  return (
    <Repeater<Webhook>
      label="Webhooks"
      description="With error message rendered below the list."
      items={hooks}
      onChange={setHooks}
      createItem={(): Webhook => ({ url: '', events: '', secret: '' })}
      max={5}
      addLabel="Add webhook"
      error={hasEmptySecret ? 'Every webhook requires a signing secret.' : undefined}
      renderItem={({ item, update }) => (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input
            aria-label="Webhook URL"
            type="url"
            leftIcon={<Globe className="h-4 w-4" />}
            placeholder="https://..."
            value={item.url}
            onChange={(e) => update({ url: e.target.value })}
          />
          <Input
            aria-label="Events"
            placeholder="order.* or user.created"
            value={item.events}
            onChange={(e) => update({ events: e.target.value })}
          />
          <Input
            aria-label="Signing secret"
            placeholder="whsec_..."
            value={item.secret}
            onChange={(e) => update({ secret: e.target.value })}
          />
        </div>
      )}
    />
  );
}

/* --------------- Page --------------- */

const TOC = [
  { id: 'emails', label: 'Emails (compound)' },
  { id: 'env-vars', label: 'Env vars (stacked)' },
  { id: 'tags', label: 'Tags (single input)' },
  { id: 'phones', label: 'Phones (select + input)' },
  { id: 'no-reorder', label: 'No-reorder mode' },
  { id: 'errors', label: 'With error' },
] as const;

export function RepeaterDemoPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t('demos.repeater.title')}</h1>
        <p className="text-foreground-muted">{t('demos.repeater.subtitle')}</p>
      </header>

      <nav
        aria-label="On-page table of contents"
        className="rounded-lg border border-border bg-surface p-3"
      >
        <ul className="flex flex-wrap gap-2">
          {TOC.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-muted/40 px-3 py-1 text-sm text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {item.label}
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section
        id="emails"
        title="Compound rows · email + kind"
        description="Two fields per row laid out in a responsive grid. Max 5 addresses."
      >
        <EmailDemo />
      </Section>

      <Section
        id="env-vars"
        title="Stacked variant · key/value pairs"
        description="rows share one outer border. Min 2 enforced — Remove disabled at the minimum."
      >
        <EnvVarsDemo />
      </Section>

      <Section
        id="tags"
        title="Single input · reorderable"
        description="Simplest case — one input per row. Arrow buttons reorder."
      >
        <TagsDemo />
      </Section>

      <Section
        id="phones"
        title="Select + input"
        description="Country select drives the input prefix expectation."
      >
        <PhonesDemo />
      </Section>

      <Section
        id="no-reorder"
        title="No-reorder mode"
        description="Reorder buttons hidden via reorderable={false}."
      >
        <NoReorderDemo />
      </Section>

      <Section
        id="errors"
        title="With validation error"
        description="Pass an error string to render an alert below the list."
      >
        <ErrorDemo />
      </Section>

      <Card variant="outlined" className="p-4">
        <CardTitle className="text-base">Notes</CardTitle>
        <CardContent className="p-0 text-sm text-foreground-muted">
          <p className="mt-2">
            Repeater holds an internal id array parallel to the items so per-row keys stay stable
            through updates (typing doesn't remount rows). Pair with react-hook-form via{' '}
            <code className="rounded bg-surface-muted px-1">useFieldArray</code> at the call site
            for full RHF integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
