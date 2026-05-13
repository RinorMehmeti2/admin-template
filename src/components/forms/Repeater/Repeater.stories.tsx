import { useState } from 'react';
import { Repeater } from './Repeater';
import { Input } from '../Input';
import { Select } from '../Select';
import { FormField } from '../FormField';

export default { title: 'Forms/Repeater', component: Repeater };

interface Email {
  address: string;
  kind: 'work' | 'personal';
}

function DefaultStory() {
  const [items, setItems] = useState<Email[]>([{ address: '', kind: 'work' }]);
  return (
    <div className="max-w-lg">
      <Repeater<Email>
        label="Email addresses"
        description="Add one or more emails. Drag with arrows to reorder."
        items={items}
        onChange={setItems}
        createItem={() => ({ address: '', kind: 'work' })}
        max={5}
        renderItem={({ item, update, index }) => (
          <div className="grid grid-cols-[1fr_140px] gap-2">
            <FormField label={`Email ${index + 1}`} hideLabel>
              <Input
                type="email"
                value={item.address}
                placeholder="name@example.com"
                onChange={(e) => update({ address: e.target.value })}
              />
            </FormField>
            <Select
              value={item.kind}
              onChange={(e) => update({ kind: e.target.value as Email['kind'] })}
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
            </Select>
          </div>
        )}
      />
    </div>
  );
}

function StackedStory() {
  const [items, setItems] = useState<{ value: string }[]>([
    { value: 'first' },
    { value: 'second' },
  ]);
  return (
    <div className="max-w-lg">
      <Repeater
        variant="stacked"
        label="Tags"
        items={items}
        onChange={setItems}
        createItem={() => ({ value: '' })}
        renderItem={({ item, update }) => (
          <Input
            aria-label="Tag value"
            value={item.value}
            onChange={(e) => update({ value: e.target.value })}
          />
        )}
      />
    </div>
  );
}

function WithMinMaxStory() {
  const [items, setItems] = useState<{ key: string; val: string }[]>([
    { key: '', val: '' },
    { key: '', val: '' },
  ]);
  return (
    <div className="max-w-lg">
      <Repeater
        label="Environment variables (min 2, max 6)"
        items={items}
        onChange={setItems}
        createItem={() => ({ key: '', val: '' })}
        min={2}
        max={6}
        addLabel="Add variable"
        renderItem={({ item, update }) => (
          <div className="grid grid-cols-2 gap-2">
            <Input
              aria-label="key"
              placeholder="KEY"
              value={item.key}
              onChange={(e) => update({ key: e.target.value })}
            />
            <Input
              aria-label="value"
              placeholder="value"
              value={item.val}
              onChange={(e) => update({ val: e.target.value })}
            />
          </div>
        )}
      />
    </div>
  );
}

export const Default = { render: () => <DefaultStory /> };
export const Stacked = { render: () => <StackedStory /> };
export const WithMinMax = { render: () => <WithMinMaxStory /> };
