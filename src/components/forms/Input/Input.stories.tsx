import { Mail, Search } from 'lucide-react';
import { Input } from './Input';

export default { title: 'Forms/Input', component: Input };

export const Default = {
  render: () => <Input placeholder="you@example.com" className="max-w-sm" />,
};

export const Variants = {
  render: () => (
    <div className="max-w-sm space-y-3">
      <Input placeholder="default" />
      <Input variant="error" placeholder="error" defaultValue="oops" />
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div className="max-w-sm space-y-3">
      <Input inputSize="sm" placeholder="small" />
      <Input inputSize="md" placeholder="medium" />
      <Input inputSize="lg" placeholder="large" />
    </div>
  ),
};

export const Adornments = {
  render: () => (
    <div className="max-w-sm space-y-3">
      <Input placeholder="Search" leftIcon={<Search className="h-4 w-4" />} />
      <Input placeholder="Email" leftIcon={<Mail className="h-4 w-4" />} />
      <Input placeholder="0.00" prefix="$" suffix="USD" />
    </div>
  ),
};

export const States = {
  render: () => (
    <div className="max-w-sm space-y-3">
      <Input placeholder="disabled" disabled />
      <Input placeholder="readonly" readOnly defaultValue="cannot edit" />
    </div>
  ),
};
