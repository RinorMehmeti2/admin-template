import { useEffect, useState } from 'react';
import { Progress } from '@/components/feedback';
import { Section } from './Section';

const CODE = `const [progress, setProgress] = useState(0);

useEffect(() => {
  const id = setInterval(() => setProgress((v) => (v >= 100 ? 0 : v + 5)), 350);
  return () => clearInterval(id);
}, []);

<div className="space-y-4">
  <Progress value={progress} label="Animated" />
  <Progress value={45} variant="success" label="Stable" />
  <Progress value={80} variant="warning" />
  <Progress indeterminate label="Loading" />
</div>`;

export function ProgressSection() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setProgress((v) => (v >= 100 ? 0 : v + 5)), 350);
    return () => clearInterval(id);
  }, []);

  return (
    <Section title="Progress" code={CODE}>
      <div className="space-y-4">
        <Progress value={progress} label="Animated" />
        <Progress value={45} variant="success" label="Stable" />
        <Progress value={80} variant="warning" />
        <Progress indeterminate label="Loading" />
      </div>
    </Section>
  );
}
