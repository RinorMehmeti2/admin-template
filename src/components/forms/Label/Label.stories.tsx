import { Label } from './Label';

export default { title: 'Forms/Label', component: Label };

export const Default = { render: () => <Label htmlFor="x">Email address</Label> };

export const Required = {
  render: () => <Label htmlFor="x" required>Email address</Label>,
};
