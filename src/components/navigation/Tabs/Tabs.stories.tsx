import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

export default { title: 'Navigation/Tabs', component: Tabs };

const panel = (s: string) => (
  <div className="rounded-md border border-border bg-surface p-4 text-sm text-foreground-muted">
    {s}
  </div>
);

export const Underline = {
  render: () => (
    <Tabs defaultValue="a" className="max-w-xl">
      <TabsList>
        <TabsTrigger value="a">Account</TabsTrigger>
        <TabsTrigger value="b">Billing</TabsTrigger>
        <TabsTrigger value="c">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="a">{panel('Account settings.')}</TabsContent>
      <TabsContent value="b">{panel('Billing details.')}</TabsContent>
      <TabsContent value="c">{panel('Team members.')}</TabsContent>
    </Tabs>
  ),
};

export const Pills = {
  render: () => (
    <Tabs defaultValue="a" variant="pills" className="max-w-xl">
      <TabsList>
        <TabsTrigger value="a">All</TabsTrigger>
        <TabsTrigger value="b">Active</TabsTrigger>
        <TabsTrigger value="c">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="a">{panel('All items.')}</TabsContent>
      <TabsContent value="b">{panel('Active items.')}</TabsContent>
      <TabsContent value="c">{panel('Archived items.')}</TabsContent>
    </Tabs>
  ),
};

export const Segmented = {
  render: () => (
    <Tabs defaultValue="a" variant="segmented" className="max-w-xl">
      <TabsList>
        <TabsTrigger value="a">Day</TabsTrigger>
        <TabsTrigger value="b">Week</TabsTrigger>
        <TabsTrigger value="c">Month</TabsTrigger>
      </TabsList>
      <TabsContent value="a">{panel('Day view.')}</TabsContent>
      <TabsContent value="b">{panel('Week view.')}</TabsContent>
      <TabsContent value="c">{panel('Month view.')}</TabsContent>
    </Tabs>
  ),
};

export const Vertical = {
  render: () => (
    <Tabs defaultValue="a" orientation="vertical" className="max-w-xl">
      <TabsList>
        <TabsTrigger value="a">General</TabsTrigger>
        <TabsTrigger value="b">Notifications</TabsTrigger>
        <TabsTrigger value="c">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="a">{panel('General settings.')}</TabsContent>
      <TabsContent value="b">{panel('Notification settings.')}</TabsContent>
      <TabsContent value="c">{panel('Security settings.')}</TabsContent>
    </Tabs>
  ),
};
