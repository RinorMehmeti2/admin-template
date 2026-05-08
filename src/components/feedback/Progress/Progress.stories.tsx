import { useEffect, useState } from 'react';
import { Progress } from './Progress';

export default { title: 'Feedback/Progress', component: Progress };

export const Variants = {
  render: () => (
    <div className="max-w-md space-y-3">
      <Progress value={20} label="default" />
      <Progress value={45} variant="success" label="success" />
      <Progress value={70} variant="warning" label="warning" />
      <Progress value={95} variant="danger" label="danger" />
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div className="max-w-md space-y-3">
      <Progress value={50} size="sm" />
      <Progress value={50} size="md" />
      <Progress value={50} size="lg" />
    </div>
  ),
};

export const Indeterminate = {
  render: () => <Progress indeterminate label="Loading" className="max-w-md" />,
};

export const Animated = {
  render: () => {
    function AnimatedDemo() {
      const [v, setV] = useState(0);
      useEffect(() => {
        const id = setInterval(() => setV((x) => (x >= 100 ? 0 : x + 7)), 400);
        return () => clearInterval(id);
      }, []);
      return <Progress value={v} className="max-w-md" label="Animated" />;
    }
    return <AnimatedDemo />;
  },
};
