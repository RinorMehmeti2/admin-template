import { Select } from './Select';

export default { title: 'Forms/Select', component: Select };

const options = (
  <>
    <option value="">Choose...</option>
    <option value="admin">Admin</option>
    <option value="editor">Editor</option>
    <option value="viewer">Viewer</option>
  </>
);

export const Default = {
  render: () => <Select className="max-w-sm">{options}</Select>,
};

export const Sizes = {
  render: () => (
    <div className="max-w-sm space-y-3">
      <Select selectSize="sm">{options}</Select>
      <Select selectSize="md">{options}</Select>
      <Select selectSize="lg">{options}</Select>
    </div>
  ),
};

export const Error = {
  render: () => <Select variant="error" className="max-w-sm">{options}</Select>,
};
