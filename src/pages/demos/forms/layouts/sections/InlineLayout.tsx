import { useTranslation } from 'react-i18next';
import { Controller, Form, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Switch } from '@/components/forms/Switch';
import { Label } from '@/components/forms/Label';
import { Button } from '@/components/primitives/Button';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';

interface InlineValues {
  workspace: string;
  timezone: string;
  emailDigest: boolean;
  dataExport: boolean;
}

export function InlineLayout() {
  const { t } = useTranslation();
  const form = useForm<InlineValues>({
    defaultValues: {
      workspace: 'Acme Engineering',
      timezone: 'America/Los_Angeles',
      emailDigest: true,
      dataExport: false,
    },
  });

  return (
    <Section
      id="inline"
      title={t('forms.layouts.inline.title')}
      description={t('forms.layouts.inline.description')}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-4">
        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-4">
          <Label htmlFor="inline-workspace">Workspace name</Label>
          <Input id="inline-workspace" {...form.register('workspace')} />
        </div>
        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-4">
          <Label htmlFor="inline-tz">Timezone</Label>
          <Select id="inline-tz" {...form.register('timezone')}>
            <option value="UTC">UTC</option>
            <option value="America/Los_Angeles">America/Los Angeles</option>
            <option value="America/New_York">America/New York</option>
            <option value="Europe/Berlin">Europe/Berlin</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </Select>
        </div>
        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-4">
          <Label htmlFor="inline-digest">Email digest</Label>
          <Controller
            control={form.control}
            name="emailDigest"
            render={({ field }) => (
              <Switch
                id="inline-digest"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-4">
          <Label htmlFor="inline-export">Weekly data export</Label>
          <Controller
            control={form.control}
            name="dataExport"
            render={({ field }) => (
              <Switch
                id="inline-export"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary">
            Save settings
          </Button>
        </div>
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
