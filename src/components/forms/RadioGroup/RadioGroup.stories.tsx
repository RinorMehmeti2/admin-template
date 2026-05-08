import { useState } from 'react';
import { RadioGroup } from './RadioGroup';
import { Radio } from '@/components/forms/Radio';

export default { title: 'Forms/RadioGroup', component: RadioGroup };

export const Vertical = {
  render: () => (
    <RadioGroup name="theme1" defaultValue="light" aria-label="Theme">
      <Radio value="light">Light</Radio>
      <Radio value="dark">Dark</Radio>
      <Radio value="system">System</Radio>
    </RadioGroup>
  ),
};

export const Horizontal = {
  render: () => (
    <RadioGroup name="theme2" orientation="horizontal" defaultValue="dark" aria-label="Theme">
      <Radio value="light">Light</Radio>
      <Radio value="dark">Dark</Radio>
      <Radio value="system">System</Radio>
    </RadioGroup>
  ),
};

export const Controlled = {
  render: () => {
    function ControlledDemo() {
      const [v, setV] = useState('admin');
      return (
        <div className="space-y-3">
          <RadioGroup name="role" value={v} onValueChange={setV} aria-label="Role">
            <Radio value="admin">Admin</Radio>
            <Radio value="editor">Editor</Radio>
            <Radio value="viewer">Viewer</Radio>
          </RadioGroup>
          <p className="text-xs text-foreground-muted">Selected: {v}</p>
        </div>
      );
    }
    return <ControlledDemo />;
  },
};
