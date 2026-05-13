import { StickyCard, StickyStack } from './StickyCard';
import { Card, CardContent, CardTitle } from '@/components/data-display/Card';

export default { title: 'Layout/StickyCard', component: StickyCard };

const filler = (n: number) =>
  Array.from({ length: n }, (_, i) => (
    <p key={i} className="text-sm text-foreground-muted">
      Paragraph {i + 1}. Scroll to see the sticky behavior. Lorem ipsum dolor sit amet consectetur
      adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
  ));

export const Default = {
  render: () => (
    <div className="h-[400px] overflow-y-auto rounded-md border border-border p-4">
      <StickyCard offset={0}>
        <h3 className="text-base font-semibold">Sticky header</h3>
        <p className="text-xs text-foreground-muted">Stays at the top while you scroll.</p>
      </StickyCard>
      <div className="space-y-3 pt-4">{filler(20)}</div>
    </div>
  ),
};

export const Compact = {
  render: () => (
    <div className="h-[400px] overflow-y-auto rounded-md border border-border p-4">
      <StickyCard offset={0} compactWhenStuck>
        <h3 className="text-base font-semibold">Compacts when stuck</h3>
        <p className="text-xs text-foreground-muted">Padding shrinks on stick.</p>
      </StickyCard>
      <div className="space-y-3 pt-4">{filler(20)}</div>
    </div>
  ),
};

export const BottomSide = {
  render: () => (
    <div className="flex h-[400px] flex-col overflow-y-auto rounded-md border border-border p-4">
      <div className="space-y-3">{filler(20)}</div>
      <StickyCard side="bottom" offset={0} variant="elevated">
        <h3 className="text-base font-semibold">Sticky action bar</h3>
        <p className="text-xs text-foreground-muted">Pins to the bottom.</p>
      </StickyCard>
    </div>
  ),
};

export const Stack = {
  render: () => (
    <div className="h-[500px] overflow-y-auto rounded-md border border-border p-4">
      <StickyStack offset={0} gap={16} flowGap={32}>
        <Card variant="outlined" className="p-4">
          <CardTitle>Card 1</CardTitle>
          <CardContent className="p-0 text-sm text-foreground-muted">
            First in the stack.
          </CardContent>
        </Card>
        <Card variant="outlined" className="p-4">
          <CardTitle>Card 2</CardTitle>
          <CardContent className="p-0 text-sm text-foreground-muted">
            Slides over card 1.
          </CardContent>
        </Card>
        <Card variant="outlined" className="p-4">
          <CardTitle>Card 3</CardTitle>
          <CardContent className="p-0 text-sm text-foreground-muted">
            Then slides over both.
          </CardContent>
        </Card>
      </StickyStack>
      <div className="space-y-3 pt-8">{filler(15)}</div>
    </div>
  ),
};
