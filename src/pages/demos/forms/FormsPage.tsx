import { Separator } from '@/components/primitives/Separator';
import {
  BioEditorDemo,
  ColorPickerDemo,
  ComboboxDemo,
  DatePickerDemo,
  DateTimePickerDemo,
  LoginForm,
  NumberInputDemo,
  OtpInputDemo,
  PhoneInputDemo,
  RatingDemo,
  Section,
  SettingsForm,
  SliderDemo,
  TagInputDemo,
  TimePickerDemo,
} from './components';

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
