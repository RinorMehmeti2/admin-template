import { FormField } from './FormField';
import { Input } from '@/components/forms/Input';
import { Checkbox } from '@/components/forms/Checkbox';

export default { title: 'Forms/FormField', component: FormField };

export const Basic = {
  render: () => (
    <div className="max-w-sm">
      <FormField label="Email" description="Where you sign in.">
        <Input placeholder="you@example.com" />
      </FormField>
    </div>
  ),
};

export const RequiredWithError = {
  render: () => (
    <div className="max-w-sm">
      <FormField label="Email" required error="Email is required">
        <Input placeholder="you@example.com" />
      </FormField>
    </div>
  ),
};

export const WithCheckbox = {
  render: () => (
    <div className="max-w-sm">
      <FormField label="I agree to the terms" error="You must agree">
        <Checkbox />
      </FormField>
    </div>
  ),
};
