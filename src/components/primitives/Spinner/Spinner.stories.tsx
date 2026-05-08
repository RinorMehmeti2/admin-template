import { Spinner } from './Spinner';

export default { title: 'Primitives/Spinner', component: Spinner };

export const Default = { render: () => <Spinner /> };

export const AllSizes = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

export const InColor = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="text-primary" />
      <Spinner className="text-success" />
      <Spinner className="text-danger" />
    </div>
  ),
};
