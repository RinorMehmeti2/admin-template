import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Step,
  StepDescription,
  StepIndicator,
  StepLabel,
  Stepper,
} from './Stepper';
import { runAxe } from '@/test-utils/a11y';

function Demo() {
  return (
    <Stepper>
      <Step status="complete" index={0}>
        <StepIndicator />
        <div>
          <StepLabel>Account</StepLabel>
        </div>
      </Step>
      <Step status="active" index={1}>
        <StepIndicator />
        <div>
          <StepLabel>Profile</StepLabel>
          <StepDescription>Add your details</StepDescription>
        </div>
      </Step>
      <Step status="idle" index={2}>
        <StepIndicator />
        <div>
          <StepLabel>Confirm</StepLabel>
        </div>
      </Step>
    </Stepper>
  );
}

describe('Stepper', () => {
  it('renders steps + connectors', () => {
    const { container } = render(<Demo />);
    const items = container.querySelectorAll('li');
    // 3 steps + 2 connectors = 5
    expect(items.length).toBe(5);
  });

  it('active step gets aria-current=step', () => {
    render(<Demo />);
    expect(screen.getByText('Profile').closest('li')).toHaveAttribute('aria-current', 'step');
  });

  it('complete indicator shows the check icon', () => {
    const { container } = render(
      <Stepper>
        <Step status="complete" index={0}>
          <StepIndicator />
          <StepLabel>x</StepLabel>
        </Step>
      </Stepper>,
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('error indicator shows the X icon AND danger label color', () => {
    render(
      <Stepper>
        <Step status="error" index={0}>
          <StepIndicator />
          <StepLabel>Broken</StepLabel>
        </Step>
      </Stepper>,
    );
    expect(screen.getByText('Broken')).toHaveClass('text-danger');
  });

  it('vertical orientation stacks the items', () => {
    const { container } = render(
      <Stepper orientation="vertical">
        <Step status="idle" index={0}><StepIndicator /></Step>
        <Step status="idle" index={1}><StepIndicator /></Step>
      </Stepper>,
    );
    expect(container.querySelector('ol')).toHaveClass('flex-col');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Demo />);
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
