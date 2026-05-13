import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, Zap } from 'lucide-react';
import { StatCard } from './StatCard';

export default { title: 'Data Display/StatCard', component: StatCard };

const spark = [12, 18, 14, 22, 19, 28, 24, 32, 30, 38];
const sparkDown = [40, 36, 38, 30, 28, 22, 24, 18, 16, 12];

export const Default = {
  render: () => (
    <div className="max-w-sm">
      <StatCard
        label="Total revenue"
        value={48210}
        unit="USD"
        delta={12.4}
        deltaLabel="vs previous 30 days"
        icon={<DollarSign className="h-4 w-4" />}
        sparklineData={spark}
      />
    </div>
  ),
};

export const Grid = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Revenue"
        value={48210}
        delta={12.4}
        icon={<DollarSign className="h-4 w-4" />}
        sparklineData={spark}
      />
      <StatCard
        label="Active users"
        value={2140}
        delta={-3.1}
        icon={<Users className="h-4 w-4" />}
        sparklineData={sparkDown}
      />
      <StatCard label="Orders" value={148} delta={0} icon={<ShoppingCart className="h-4 w-4" />} />
      <StatCard
        label="Throughput"
        value={9420}
        unit="rps"
        delta={5.6}
        icon={<Zap className="h-4 w-4" />}
        sparklineData={spark}
      />
    </div>
  ),
};

export const Variants = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard variant="default" label="Default" value={1234} delta={2.1} />
      <StatCard variant="outlined" label="Outlined" value={1234} delta={2.1} />
      <StatCard variant="elevated" label="Elevated" value={1234} delta={2.1} />
      <StatCard variant="accent" label="Accent" value={1234} delta={2.1} />
    </div>
  ),
};

export const Loading = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Revenue" value={0} loading icon={<DollarSign className="h-4 w-4" />} />
      <StatCard label="Users" value={0} loading icon={<Users className="h-4 w-4" />} />
      <StatCard label="Orders" value={0} loading />
    </div>
  ),
};

function LiveUpdatingStory() {
  const [v, setV] = useState(1000);
  useEffect(() => {
    const id = window.setInterval(() => {
      setV((cur) => cur + Math.round((Math.random() - 0.3) * 200));
    }, 1500);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="max-w-sm">
      <StatCard
        label="Online now"
        value={v}
        delta={((v - 1000) / 1000) * 100}
        deltaLabel="vs baseline"
        icon={<Users className="h-4 w-4" />}
      />
    </div>
  );
}

export const LiveUpdating = { render: () => <LiveUpdatingStory /> };

export const Clickable = {
  render: () => (
    <div className="max-w-sm">
      <StatCard
        label="Open orders"
        value={42}
        delta={5}
        deltaLabel="today"
        icon={<ShoppingCart className="h-4 w-4" />}
        onClick={() => alert('Navigate to orders')}
      />
    </div>
  ),
};
