import { Form, useForm } from './Form';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/primitives/Button';

export default { title: 'Forms/Form', component: Form };

export const Minimal = {
  render: () => {
    function Demo() {
      const form = useForm<{ email: string }>({ defaultValues: { email: '' } });
      return (
        <Form
          form={form}
          onSubmit={(v) => {
            // eslint-disable-next-line no-alert
            alert(JSON.stringify(v));
          }}
          className="max-w-sm space-y-3"
        >
          <FormField label="Email" required>
            <Input placeholder="you@example.com" {...form.register('email')} />
          </FormField>
          <Button type="submit">Submit</Button>
        </Form>
      );
    }
    return <Demo />;
  },
};
