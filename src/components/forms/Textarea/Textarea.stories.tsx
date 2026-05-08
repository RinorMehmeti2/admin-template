import { Textarea } from './Textarea';

export default { title: 'Forms/Textarea', component: Textarea };

export const Default = {
  render: () => <Textarea placeholder="Tell us about yourself..." className="max-w-md" rows={4} />,
};

export const AutoResize = {
  render: () => (
    <Textarea
      autoResize
      minRows={2}
      maxRows={8}
      placeholder="Type to grow..."
      className="max-w-md"
    />
  ),
};

export const Error = {
  render: () => (
    <Textarea variant="error" defaultValue="too short" className="max-w-md" rows={3} />
  ),
};
