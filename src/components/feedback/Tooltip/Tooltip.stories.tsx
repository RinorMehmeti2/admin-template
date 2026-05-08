import { Button } from '@/components/primitives/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './Tooltip';

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
