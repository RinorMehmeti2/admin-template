import { Switch } from './Switch';

export default { title: 'Forms/Switch', component: Switch };

export const Default = {
  render: () => (
    <label className="flex items-center gap-2 text-sm">
      <Switch aria-label="enable" />
      Enable notifications
    </label>
  ),
};

export const States = {
  render: () => (
    <div className="space-y-3 text-sm">
      <label className="flex items-center gap-2">
        <Switch aria-label="off" /> Off
      </label>
      <label className="flex items-center gap-2">
        <Switch aria-label="on" defaultChecked /> On
      </label>
      <label className="flex items-center gap-2 opacity-60">
        <Switch aria-label="disabled" disabled /> Disabled off
      </label>
      <label className="flex items-center gap-2 opacity-60">
        <Switch aria-label="disabled-on" disabled defaultChecked /> Disabled on
      </label>
    </div>
  ),
};
