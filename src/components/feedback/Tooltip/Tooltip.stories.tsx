import { Button } from '@/components/primitives/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';

export default { title: 'Feedback/Tooltip', component: Tooltip };

export const Default = {
  render: () => (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-3 p-12">
        <Tooltip>
          <TooltipTrigger>
            <Button>Top</Button>
          </TooltipTrigger>
          <TooltipContent side="top">On top</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button>Bottom</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">On bottom</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button>Left</Button>
          </TooltipTrigger>
          <TooltipContent side="left">On left</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button>Right</Button>
          </TooltipTrigger>
          <TooltipContent side="right">On right</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

export const Variants = {
  render: () => (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-wrap items-center gap-3 p-12">
        {(['default', 'light', 'primary', 'success', 'warning', 'danger', 'info'] as const).map(
          (variant) => (
            <Tooltip key={variant}>
              <TooltipTrigger>
                <Button variant="outline">{variant}</Button>
              </TooltipTrigger>
              <TooltipContent variant={variant} side="top">
                {variant} tooltip
              </TooltipContent>
            </Tooltip>
          ),
        )}
      </div>
    </TooltipProvider>
  ),
};

export const Sizes = {
  render: () => (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-3 p-12">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Tooltip key={size}>
            <TooltipTrigger>
              <Button variant="outline">{size}</Button>
            </TooltipTrigger>
            <TooltipContent size={size} side="top">
              Size {size}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
};
