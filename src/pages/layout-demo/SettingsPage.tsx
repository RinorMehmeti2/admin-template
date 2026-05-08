import {
  Step,
  StepDescription,
  StepIndicator,
  StepLabel,
  Stepper,
} from '@/components/navigation/Stepper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/navigation/Tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/primitives/Button';
import { DemoBreadcrumbs } from './LayoutDemo';

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Workspace preferences and integrations."
        breadcrumbs={
          <DemoBreadcrumbs items={[{ label: 'Dashboard', to: '/layout' }, { label: 'Settings' }]} />
        }
      />

      <Tabs defaultValue="general" orientation="vertical" variant="underline">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Alert variant="info" title="Heads up" description="Changes apply across all workspaces." />
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-base font-semibold">Workspace</h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Form fields would normally live here.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <p className="text-sm text-foreground-muted">No integrations connected yet.</p>
        </TabsContent>

        <TabsContent value="billing">
          <p className="text-sm text-foreground-muted">Pro plan, $49 / month.</p>
        </TabsContent>

        <TabsContent value="onboarding">
          <Stepper className="max-w-2xl">
            <Step status="complete" index={0}>
              <StepIndicator />
              <div>
                <StepLabel>Account</StepLabel>
                <StepDescription>Created</StepDescription>
              </div>
            </Step>
            <Step status="active" index={1}>
              <StepIndicator />
              <div>
                <StepLabel>Profile</StepLabel>
                <StepDescription>In progress</StepDescription>
              </div>
            </Step>
            <Step status="idle" index={2}>
              <StepIndicator />
              <div>
                <StepLabel>Invite team</StepLabel>
                <StepDescription>Optional</StepDescription>
              </div>
            </Step>
          </Stepper>
        </TabsContent>
      </Tabs>
    </div>
  );
}
