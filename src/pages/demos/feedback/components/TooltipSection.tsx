import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback';
import { Button } from '@/components/primitives/Button';
import { Section } from './Section';

export function TooltipSection() {
  return (
    <Section title="Tooltip">
      <div className="flex flex-wrap items-center gap-3">
        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline">Hover or focus</Button>
          </TooltipTrigger>
          <TooltipContent side="top">On top</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline">Bottom</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">On bottom</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" leftIcon={<Info className="h-4 w-4" />}>
              Info
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Tooltips support keyboard focus too</TooltipContent>
        </Tooltip>
      </div>
    </Section>
  );
}
