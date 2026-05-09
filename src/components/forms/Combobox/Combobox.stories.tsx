import { useState } from 'react';
import { Combobox, ComboboxContent, ComboboxTrigger } from './Combobox';

export default { title: 'Forms/Combobox', component: Combobox };

interface Country {
  code: string;
  name: string;
  flag: string;
}

const COUNTRIES: ReadonlyArray<Country> = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
];

export const SingleSelect = {
  render: () => (
    <div className="max-w-sm">
      <Combobox<Country>
        items={COUNTRIES}
        getItemLabel={(c) => c.name}
        getItemValue={(c) => c.code}
      >
        <ComboboxTrigger placeholder="Pick a country…" />
        <ComboboxContent />
      </Combobox>
    </div>
  ),
};

export const MultiSelect = {
  render: () => (
    <div className="max-w-md">
      <Combobox<Country>
        items={COUNTRIES}
        getItemLabel={(c) => c.name}
        getItemValue={(c) => c.code}
        multiple
      >
        <ComboboxTrigger placeholder="Pick one or more…" />
        <ComboboxContent />
      </Combobox>
    </div>
  ),
};

export const WithFlags = {
  render: () => (
    <div className="max-w-sm">
      <Combobox<Country>
        items={COUNTRIES}
        getItemLabel={(c) => c.name}
        getItemValue={(c) => c.code}
        renderItem={(c) => (
          <span className="flex items-center gap-2">
            <span aria-hidden>{c.flag}</span>
            <span>{c.name}</span>
            <span className="ml-auto text-xs uppercase text-foreground-subtle">{c.code}</span>
          </span>
        )}
      >
        <ComboboxTrigger placeholder="Pick a country…" />
        <ComboboxContent />
      </Combobox>
    </div>
  ),
};

export const Async = {
  render: () => {
    function Demo() {
      const [items, setItems] = useState<Country[]>(COUNTRIES.slice(0, 4));
      const [loading, setLoading] = useState(false);
      return (
        <div className="max-w-sm">
          <Combobox<Country>
            items={items}
            loading={loading}
            getItemLabel={(c) => c.name}
            getItemValue={(c) => c.code}
            onSearch={(q) => {
              setLoading(true);
              const id = window.setTimeout(() => {
                setItems(COUNTRIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())));
                setLoading(false);
              }, 350);
              return () => window.clearTimeout(id);
            }}
          >
            <ComboboxTrigger placeholder="Type to search…" />
            <ComboboxContent />
          </Combobox>
        </div>
      );
    }
    return <Demo />;
  },
};

export const Creatable = {
  render: () => {
    function Demo() {
      const [items, setItems] = useState(COUNTRIES);
      return (
        <div className="max-w-sm">
          <Combobox<Country>
            items={items}
            getItemLabel={(c) => c.name}
            getItemValue={(c) => c.code}
            creatable
            onCreate={(name) => {
              const code = name.toLowerCase().slice(0, 2);
              setItems((cur) => [...cur, { code, name, flag: '🏳️' }]);
            }}
          >
            <ComboboxTrigger placeholder="Pick or create…" />
            <ComboboxContent />
          </Combobox>
        </div>
      );
    }
    return <Demo />;
  },
};

export const Disabled = {
  render: () => (
    <div className="max-w-sm">
      <Combobox<Country>
        items={COUNTRIES}
        getItemLabel={(c) => c.name}
        getItemValue={(c) => c.code}
        disabled
      >
        <ComboboxTrigger placeholder="Cannot interact" />
        <ComboboxContent />
      </Combobox>
    </div>
  ),
};

export const ErrorState = {
  render: () => (
    <div className="max-w-sm space-y-2">
      <Combobox<Country>
        items={COUNTRIES}
        getItemLabel={(c) => c.name}
        getItemValue={(c) => c.code}
      >
        <ComboboxTrigger
          placeholder="Required"
          aria-invalid="true"
          className="border-danger focus-within:ring-danger"
        />
        <ComboboxContent />
      </Combobox>
      <p className="text-xs text-danger">This field is required.</p>
    </div>
  ),
};
