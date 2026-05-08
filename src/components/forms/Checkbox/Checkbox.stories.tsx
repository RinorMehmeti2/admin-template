import { Checkbox } from './Checkbox';

export default { title: 'Forms/Checkbox', component: Checkbox };

export const Default = {
  render: () => (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox aria-label="Agree" />
      I agree to the terms
    </label>
  ),
};

export const States = {
  render: () => (
    <div className="space-y-2 text-sm">
      <label className="flex items-center gap-2">
        <Checkbox aria-label="default" /> Default
      </label>
      <label className="flex items-center gap-2">
        <Checkbox aria-label="checked" defaultChecked /> Checked
      </label>
      <label className="flex items-center gap-2">
        <Checkbox aria-label="indeterminate" indeterminate /> Indeterminate
      </label>
      <label className="flex items-center gap-2 opacity-60">
        <Checkbox aria-label="disabled" disabled /> Disabled
      </label>
      <label className="flex items-center gap-2 opacity-60">
        <Checkbox aria-label="disabled checked" disabled defaultChecked /> Disabled checked
      </label>
    </div>
  ),
};
