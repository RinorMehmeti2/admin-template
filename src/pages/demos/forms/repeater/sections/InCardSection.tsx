import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, Plus } from 'lucide-react';
import { Repeater } from '@/components/forms/Repeater';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/primitives/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import { Section } from '../../_shared/Section';

interface EnvVar {
  key: string;
  value: string;
}

const MAX_VARS = 8;

const CODE = `<Card variant="outlined">
  <CardHeader className="flex flex-row items-start justify-between gap-2">
    <div>
      <CardTitle className="text-base">Environment variables</CardTitle>
      <CardDescription>
        {envs.length} of {MAX_VARS}. KEY=value pairs · stacked layout.
      </CardDescription>
    </div>
    <Button
      type="button"
      variant="primary"
      size="sm"
      leftIcon={<Plus className="h-3.5 w-3.5" />}
      disabled={envs.length >= MAX_VARS}
      onClick={() => setEnvs((cur) => [...cur, { key: '', value: '' }])}
    >
      Add variable
    </Button>
  </CardHeader>
  <CardContent className="px-6 pb-6 pt-2">
    <Repeater<EnvVar>
      variant="stacked"
      items={envs}
      onChange={setEnvs}
      createItem={(): EnvVar => ({ key: '', value: '' })}
      min={1}
      max={MAX_VARS}
      addable={false}
      renderItem={({ item, update, index }) => (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input
            aria-label={\`Key \${index + 1}\`}
            leftIcon={<Key className="h-4 w-4" />}
            value={item.key}
            onChange={(e) => update({ key: e.target.value })}
            placeholder="KEY"
          />
          <Input
            aria-label={\`Value \${index + 1}\`}
            value={item.value}
            onChange={(e) => update({ value: e.target.value })}
            placeholder="value"
          />
        </div>
      )}
    />
  </CardContent>
</Card>`;

export function InCardSection() {
  const { t } = useTranslation();
  const [envs, setEnvs] = useState<EnvVar[]>([
    { key: 'NODE_ENV', value: 'production' },
    { key: 'PORT', value: '3000' },
  ]);

  return (
    <Section
      id="in-card"
      title={t('forms.repeater.inCard.title')}
      description={t('forms.repeater.inCard.description')}
      code={CODE}
    >
      <Card variant="outlined">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Environment variables</CardTitle>
            <CardDescription>
              {envs.length} of {MAX_VARS}. KEY=value pairs · stacked layout.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            disabled={envs.length >= MAX_VARS}
            onClick={() => setEnvs((cur) => [...cur, { key: '', value: '' }])}
          >
            Add variable
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          <Repeater<EnvVar>
            variant="stacked"
            items={envs}
            onChange={setEnvs}
            createItem={(): EnvVar => ({ key: '', value: '' })}
            min={1}
            max={MAX_VARS}
            // Hide internal Add button — header owns the action.
            addable={false}
            renderItem={({ item, update, index }) => (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  aria-label={`Key ${index + 1}`}
                  leftIcon={<Key className="h-4 w-4" />}
                  value={item.key}
                  onChange={(e) => update({ key: e.target.value })}
                  placeholder="KEY"
                />
                <Input
                  aria-label={`Value ${index + 1}`}
                  value={item.value}
                  onChange={(e) => update({ value: e.target.value })}
                  placeholder="value"
                />
              </div>
            )}
          />
        </CardContent>
      </Card>
    </Section>
  );
}
