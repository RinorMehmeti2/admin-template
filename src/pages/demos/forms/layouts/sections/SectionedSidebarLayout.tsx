import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Checkbox } from '@/components/forms/Checkbox';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/lib/cn';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface ProfileValues {
  fullName: string;
  email: string;
  street: string;
  city: string;
  salary: string;
  currency: string;
  canAdmin: boolean;
  canEdit: boolean;
  notes: string;
}

interface AnchorDef {
  id: string;
  label: string;
}

const CODE = `<div className="grid grid-cols-1 gap-6 md:grid-cols-[12rem_minmax(0,1fr)]">
  <aside aria-label="Section nav" className="md:sticky md:top-24 md:self-start">
    <ul className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible">
      {anchors.map((a) => (
        <li key={a.id}>
          <a
            href={\`#sec-\${a.id}\`}
            className={cn(
              'inline-block whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium',
              activeId === a.id
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground-muted hover:bg-surface-muted',
            )}
            aria-current={activeId === a.id ? 'true' : undefined}
          >
            {a.label}
          </a>
        </li>
      ))}
    </ul>
  </aside>

  <Form form={form} onSubmit={() => undefined} className="min-w-0 space-y-8">
    <section id="sec-identity" className="scroll-mt-24 space-y-3">
      <h3 className="text-base font-semibold">Identity</h3>
      <FormField label="Full name" required>
        <Input {...form.register('fullName')} />
      </FormField>
    </section>

    <section id="sec-contact" className="scroll-mt-24 space-y-3">
      <h3 className="text-base font-semibold">Contact</h3>
      <FormField label="Email" required>
        <Input type="email" {...form.register('email')} />
      </FormField>
    </section>

    <section id="sec-permissions" className="scroll-mt-24 space-y-3">
      <h3 className="text-base font-semibold">Permissions</h3>
      <label className="flex items-center gap-3 text-sm">
        <Checkbox {...form.register('canAdmin')} />
        Can administer the workspace
      </label>
    </section>

    <div className="flex justify-end pt-2">
      <Button type="submit" variant="primary">Save profile</Button>
    </div>
  </Form>
</div>`;

export function SectionedSidebarLayout() {
  const { t } = useTranslation();
  const form = useForm<ProfileValues>({
    defaultValues: {
      fullName: 'Alex Kowalski',
      email: 'alex.kowalski@acme.test',
      street: '1 Market St',
      city: 'San Francisco',
      salary: '120000',
      currency: 'USD',
      canAdmin: false,
      canEdit: true,
      notes: '',
    },
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>('identity');

  const anchors = useMemo<ReadonlyArray<AnchorDef>>(
    () => [
      { id: 'identity', label: 'Identity' },
      { id: 'contact', label: 'Contact' },
      { id: 'compensation', label: 'Compensation' },
      { id: 'permissions', label: 'Permissions' },
      { id: 'notes', label: 'Notes' },
    ],
    [],
  );

  // Track which sub-section is currently in view. Pure presentation —
  // not the kind of "behavior" CLAUDE.md asks us to extract into a hook.
  useEffect(() => {
    const root = containerRef.current;
    if (root === null) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const elements = anchors
      .map((a) => root.querySelector(`#sec-${a.id}`))
      .filter((el): el is Element => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top !== undefined && top.target instanceof HTMLElement) {
          const id = top.target.id.replace(/^sec-/, '');
          setActiveId(id);
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.5, 1] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [anchors]);

  return (
    <Section
      id="sectioned"
      title={t('forms.layouts.sectioned.title')}
      description={t('forms.layouts.sectioned.description')}
      code={CODE}
    >
      <div ref={containerRef} className="grid grid-cols-1 gap-6 md:grid-cols-[12rem_minmax(0,1fr)]">
        <aside
          aria-label="Section nav"
          className="md:sticky md:top-24 md:self-start"
          data-print="hide"
        >
          <ul className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible">
            {anchors.map((a) => (
              <li key={a.id}>
                <a
                  href={`#sec-${a.id}`}
                  className={cn(
                    'inline-block whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    activeId === a.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
                  )}
                  aria-current={activeId === a.id ? 'true' : undefined}
                >
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <Form form={form} onSubmit={() => undefined} className="min-w-0 space-y-8">
          <section id="sec-identity" className="scroll-mt-24 space-y-3">
            <h3 className="text-base font-semibold">Identity</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Full name" required>
                <Input {...form.register('fullName')} />
              </FormField>
            </div>
          </section>

          <section id="sec-contact" className="scroll-mt-24 space-y-3">
            <h3 className="text-base font-semibold">Contact</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Email" required>
                <Input type="email" {...form.register('email')} />
              </FormField>
              <FormField label="Street">
                <Input {...form.register('street')} />
              </FormField>
              <FormField label="City">
                <Input {...form.register('city')} />
              </FormField>
            </div>
          </section>

          <section id="sec-compensation" className="scroll-mt-24 space-y-3">
            <h3 className="text-base font-semibold">Compensation</h3>
            <div className="grid gap-3 sm:grid-cols-2">
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
          </section>

          <section id="sec-permissions" className="scroll-mt-24 space-y-3">
            <h3 className="text-base font-semibold">Permissions</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-sm">
                <Checkbox {...form.register('canAdmin')} />
                Can administer the workspace
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Checkbox {...form.register('canEdit')} />
                Can edit content
              </label>
            </div>
          </section>

          <section id="sec-notes" className="scroll-mt-24 space-y-3">
            <h3 className="text-base font-semibold">Notes</h3>
            <FormField label="Internal notes" description="Visible to admins only.">
              <Textarea rows={4} {...form.register('notes')} />
            </FormField>
          </section>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary">
              Save profile
            </Button>
          </div>
        </Form>
      </div>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
