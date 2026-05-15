import { useTranslation } from 'react-i18next';
import { useFieldArray } from 'react-hook-form';
import { Controller, Form, useForm } from '@/components/forms/Form';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/data-display/Table';
import { Plus, Trash2 } from 'lucide-react';
import { Section } from '../../_shared/Section';
import { PreviewPanel } from '../../_shared/PreviewPanel';
import { EMPLOYEE_ROLES } from '../../_shared/data';

interface RosterValues {
  members: Array<{
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
  }>;
}

const CODE = `<Form form={form} onSubmit={() => undefined} className="space-y-4">
  <div className="rounded-md border border-border bg-surface">
    <Table size="dense" containerClassName="rounded-md">
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: '32%' }}>Name</TableHead>
          <TableHead style={{ width: '38%' }}>Email</TableHead>
          <TableHead style={{ width: '22%' }}>Role</TableHead>
          <TableHead style={{ width: '8%' }}>
            <span className="sr-only">Remove</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((row, i) => (
          <TableRow key={row.id} className="align-top">
            <TableCell>
              <Input inputSize="sm" {...form.register(\`members.\${i}.name\`)} />
            </TableCell>
            <TableCell>
              <Input type="email" inputSize="sm" {...form.register(\`members.\${i}.email\`)} />
            </TableCell>
            <TableCell>
              <Controller
                control={form.control}
                name={\`members.\${i}.role\`}
                render={({ field }) => (
                  <Select selectSize="sm" value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                    {EMPLOYEE_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </Select>
                )}
              />
            </TableCell>
            <TableCell>
              <IconButton type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
  <div className="flex justify-between gap-2">
    <Button
      type="button"
      variant="outline"
      leftIcon={<Plus className="h-4 w-4" />}
      onClick={() => append({ name: '', email: '', role: 'viewer' })}
    >
      Add member
    </Button>
    <Button type="submit" variant="primary">Save roster</Button>
  </div>
</Form>`;

export function EditableRosterSection() {
  const { t } = useTranslation();
  const form = useForm<RosterValues>({
    defaultValues: {
      members: [
        { name: 'Amara Dao', email: 'amara@acme.test', role: 'admin' },
        { name: 'Bao Eklund', email: 'bao@acme.test', role: 'editor' },
        { name: 'Carla Goncalves', email: 'carla@acme.test', role: 'viewer' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'members',
  });

  return (
    <Section
      id="roster"
      title={t('forms.tables.roster.title')}
      description={t('forms.tables.roster.description')}
      code={CODE}
    >
      <Form form={form} onSubmit={() => undefined} className="space-y-4">
        <div className="rounded-md border border-border bg-surface">
          <Table size="dense" containerClassName="rounded-md">
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '32%' }}>Name</TableHead>
                <TableHead style={{ width: '38%' }}>Email</TableHead>
                <TableHead style={{ width: '22%' }}>Role</TableHead>
                <TableHead style={{ width: '8%' }}>
                  <span className="sr-only">Remove</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((row, i) => (
                <TableRow key={row.id} className="align-top">
                  <TableCell>
                    <Input
                      inputSize="sm"
                      aria-label={`Member ${i + 1} name`}
                      {...form.register(`members.${i}.name`)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="email"
                      inputSize="sm"
                      aria-label={`Member ${i + 1} email`}
                      {...form.register(`members.${i}.email`)}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      control={form.control}
                      name={`members.${i}.role`}
                      render={({ field }) => (
                        <Select
                          selectSize="sm"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value as RosterValues['members'][number]['role'],
                            )
                          }
                          aria-label={`Member ${i + 1} role`}
                        >
                          {EMPLOYEE_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </Select>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${row.name}`}
                      onClick={() => remove(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => append({ name: '', email: '', role: 'viewer' })}
          >
            Add member
          </Button>
          <Button type="submit" variant="primary">
            Save roster
          </Button>
        </div>
      </Form>
      <PreviewPanel form={form} defaultOpen={false} />
    </Section>
  );
}
