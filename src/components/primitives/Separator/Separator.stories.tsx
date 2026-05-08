import { Separator } from './Separator';

export default { title: 'Primitives/Separator', component: Separator };

export const Horizontal = {
  render: () => (
    <div className="w-80">
      <p className="text-sm">Above</p>
      <Separator className="my-3" />
      <p className="text-sm">Below</p>
    </div>
  ),
};

export const Vertical = {
  render: () => (
    <div className="flex h-12 items-center gap-3">
      <span className="text-sm">Left</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Middle</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Right</span>
    </div>
  ),
};

export const Semantic = {
  render: () => (
    <div className="w-80">
      <h3 className="font-semibold">Section A</h3>
      <Separator decorative={false} className="my-3" />
      <h3 className="font-semibold">Section B</h3>
    </div>
  ),
};
