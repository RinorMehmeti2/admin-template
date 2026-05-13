import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AtSign, Eye, EyeOff, Lock, User } from 'lucide-react';
import { Controller, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { NumberInput } from '@/components/forms/NumberInput';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { OtpInput } from '@/components/forms/OtpInput';
import { TagInput } from '@/components/forms/TagInput';
import { FormField } from '@/components/forms/FormField';
import { Form } from '@/components/forms/Form';
import { IconButton } from '@/components/primitives/IconButton';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface TextValues {
  name: string;
  email: string;
  password: string;
  bio: string;
  age: number | null;
  phone: string;
  otp: string;
  tags: ReadonlyArray<string>;
}

export function TextFieldsSection() {
  const { t } = useTranslation();
  const [showPwd, setShowPwd] = useState(false);
  const form = useForm<TextValues>({
    defaultValues: {
      name: 'Alex Kowalski',
      email: 'alex@acme.test',
      password: '',
      bio: 'Builds calm software for serious tools.',
      age: 32,
      phone: '+14155550123',
      otp: '',
      tags: ['frontend', 'a11y'],
    },
  });

  return (
    <Section
      id="text-inputs"
      title={t('forms.fields.text.title')}
      description={t('forms.fields.text.description')}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name">
            <Input
              autoComplete="name"
              leftIcon={<User className="h-4 w-4" />}
              {...form.register('name')}
            />
          </FormField>

          <FormField label="Email" description="With a left adornment icon.">
            <Input
              type="email"
              autoComplete="email"
              leftIcon={<AtSign className="h-4 w-4" />}
              {...form.register('email')}
            />
          </FormField>

          <FormField label="Password" description="Click the eye to toggle.">
            <Input
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <IconButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPwd((v) => !v)}
                  className="h-7 w-7"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </IconButton>
              }
              {...form.register('password')}
            />
          </FormField>

          <FormField label="Age" description="NumberInput · integer, 0–120.">
            <Controller
              control={form.control}
              name="age"
              render={({ field }) => (
                <NumberInput
                  min={0}
                  max={120}
                  step={1}
                  precision={0}
                  value={field.value}
                  onValueChange={(v) => field.onChange(v)}
                />
              )}
            />
          </FormField>

          <FormField label="Phone" description="E.164-typed PhoneInput.">
            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <PhoneInput
                  value={field.value}
                  onValueChange={(e164) => field.onChange(e164 ?? '')}
                />
              )}
            />
          </FormField>

          <FormField label="OTP" description="One-time code, 6 digits.">
            <Controller
              control={form.control}
              name="otp"
              render={({ field }) => (
                <OtpInput
                  length={6}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </FormField>
        </div>

        <FormField label="Bio" description="Textarea — multi-line, auto-grows.">
          <Textarea rows={4} {...form.register('bio')} />
        </FormField>

        <FormField label="Tags" description="Comma or Enter to add. Backspace removes.">
          <Controller
            control={form.control}
            name="tags"
            render={({ field }) => (
              <TagInput<string>
                value={field.value as string[]}
                onValueChange={field.onChange}
                placeholder="Add a tag…"
              />
            )}
          />
        </FormField>
      </Form>

      <PreviewPanel form={form} />
    </Section>
  );
}
