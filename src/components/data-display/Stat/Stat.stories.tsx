import { DollarSign, ShoppingCart, Users } from 'lucide-react';
import { Stat } from './Stat';
import { Card } from '../Card';

export default { title: 'Data Display/Stat', component: Stat };

export const Default = {
  render: () => (
    <Card variant="outlined" className="max-w-xs p-6">
      <Stat
        label="Total revenue"
        value="$48,210"
        delta={12.4}
        deltaLabel="vs previous 30 days"
        icon={<DollarSign className="h-4 w-4" />}
      />
    </Card>
  ),
};

export const Grid = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card variant="outlined" className="p-6">
        <Stat label="Revenue" value="$48,210" delta={12.4} icon={<DollarSign className="h-4 w-4" />} />
      </Card>
      <Card variant="outlined" className="p-6">
        <Stat label="Users" value="2,140" delta={-3.1} icon={<Users className="h-4 w-4" />} />
      </Card>
      <Card variant="outlined" className="p-6">
        <Stat label="Orders" value="148" delta={0} icon={<ShoppingCart className="h-4 w-4" />} />
      </Card>
    </div>
  ),
};

export const Compact = {
  render: () => (
    <Card variant="outlined" className="max-w-sm p-4">
      <Stat
        variant="compact"
        label="Active sessions"
        value="382"
        delta={8.2}
        icon={<Users className="h-5 w-5" />}
      />
    </Card>
  ),
};
