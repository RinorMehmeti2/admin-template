import { ExampleBlock } from './ExampleBlock';
import { Button } from '@/components/primitives/Button';

export default { title: 'Data Display/ExampleBlock', component: ExampleBlock };

const CODE = `<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>`;

export const Basic = {
  render: () => (
    <ExampleBlock title="Button" description="Variants and sizes" code={CODE}>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
    </ExampleBlock>
  ),
};

export const WithoutDescription = {
  render: () => (
    <ExampleBlock title="Button" code={CODE}>
      <Button variant="primary">Primary</Button>
    </ExampleBlock>
  ),
};

export const NoToolbar = {
  render: () => (
    <ExampleBlock title="Button" description="Toolbar suppressed">
      <Button variant="primary">Primary</Button>
    </ExampleBlock>
  ),
};
