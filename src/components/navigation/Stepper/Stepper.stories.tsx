import {
  Step,
  StepDescription,
  StepIndicator,
  StepLabel,
  Stepper,
} from './Stepper';

export default { title: 'Navigation/Stepper', component: Stepper };

export const Horizontal = {
  render: () => (
    <Stepper className="max-w-2xl">
      <Step status="complete" index={0}><StepIndicator /><StepLabel>Account</StepLabel></Step>
      <Step status="active" index={1}><StepIndicator /><StepLabel>Profile</StepLabel></Step>
      <Step status="idle" index={2}><StepIndicator /><StepLabel>Confirm</StepLabel></Step>
    </Stepper>
  ),
};

export const Vertical = {
  render: () => (
    <Stepper orientation="vertical" className="w-72">
      <Step status="complete" index={0}>
        <StepIndicator />
        <div>
          <StepLabel>Account created</StepLabel>
          <StepDescription>2 hours ago</StepDescription>
        </div>
      </Step>
      <Step status="active" index={1}>
        <StepIndicator />
        <div>
          <StepLabel>Verify email</StepLabel>
          <StepDescription>Check your inbox</StepDescription>
        </div>
      </Step>
      <Step status="idle" index={2}>
        <StepIndicator />
        <StepLabel>Add payment</StepLabel>
      </Step>
    </Stepper>
  ),
};

export const WithError = {
  render: () => (
    <Stepper className="max-w-2xl">
      <Step status="complete" index={0}><StepIndicator /><StepLabel>Account</StepLabel></Step>
      <Step status="error" index={1}><StepIndicator /><StepLabel>Profile</StepLabel></Step>
      <Step status="idle" index={2}><StepIndicator /><StepLabel>Confirm</StepLabel></Step>
    </Stepper>
  ),
};
