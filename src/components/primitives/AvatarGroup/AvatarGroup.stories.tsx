import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/feedback/Tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { List, ListItem } from '@/components/data-display/List';
import { Avatar, type AvatarProps } from '@/components/primitives/Avatar';
import { AvatarGroup } from './AvatarGroup';

export default { title: 'Primitives/AvatarGroup', component: AvatarGroup };

const TEAM: AvatarProps[] = [
  { name: 'Ada Lovelace' },
  { name: 'Bob Marley' },
  { name: 'Cher Cher' },
  { name: 'Diego Velazquez' },
  { name: 'Eve Einstein' },
  { name: 'Felix Mendelssohn' },
  { name: 'Grace Hopper' },
  { name: 'Hedy Lamarr' },
];

export const Small = {
  render: () => <AvatarGroup items={TEAM.slice(0, 3)} aria-label="team" />,
};

export const WithOverflow = {
  render: () => <AvatarGroup items={TEAM} max={4} aria-label="team" />,
};

export const Sizes = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <div key={s} className="flex items-center gap-4">
          <span className="w-8 text-xs uppercase text-foreground-muted">{s}</span>
          <AvatarGroup items={TEAM} max={4} size={s} aria-label={`team ${s}`} />
        </div>
      ))}
    </div>
  ),
};

export const Spacing = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['tight', 'normal', 'loose'] as const).map((sp) => (
        <div key={sp} className="flex items-center gap-4">
          <span className="w-16 text-xs uppercase text-foreground-muted">{sp}</span>
          <AvatarGroup items={TEAM} max={5} spacing={sp} aria-label={`team ${sp}`} />
        </div>
      ))}
    </div>
  ),
};

export const ReverseOrder = {
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-foreground-muted">Default: leftmost on top</p>
      <AvatarGroup items={TEAM.slice(0, 5)} aria-label="default" />
      <p className="mt-4 text-xs text-foreground-muted">reverseOrder: rightmost on top</p>
      <AvatarGroup items={TEAM.slice(0, 5)} reverseOrder aria-label="reverse" />
    </div>
  ),
};

export const WithTooltips = {
  render: () => (
    <TooltipProvider delayDuration={150}>
      <AvatarGroup
        items={TEAM}
        max={5}
        aria-label="team"
        renderItem={(avatar, item) => (
          <Tooltip>
            <TooltipTrigger>{avatar}</TooltipTrigger>
            <TooltipContent side="top">{item.name ?? item.alt ?? 'Member'}</TooltipContent>
          </Tooltip>
        )}
      />
    </TooltipProvider>
  ),
};

export const WithOverflowPopover = {
  render: function OverflowPopoverStory() {
    const max = 4;
    const hidden = TEAM.slice(max);
    const [open, setOpen] = useState(false);
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <span className="inline-block">
            <AvatarGroup
              items={TEAM}
              max={max}
              aria-label="team"
              onOverflowClick={() => setOpen(true)}
            />
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom-start" className="min-w-56 p-0">
          <DropdownMenuLabel>Other members</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <List variant="divided">
            {hidden.map((p) => (
              <ListItem
                key={p.name}
                leading={<Avatar name={p.name ?? 'Member'} size="sm" />}
                primary={p.name ?? 'Member'}
              />
            ))}
          </List>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const ImageAvatars = {
  render: () => (
    <AvatarGroup
      items={[
        { src: 'https://i.pravatar.cc/64?img=1', name: 'A' },
        { src: 'https://i.pravatar.cc/64?img=2', name: 'B' },
        { src: 'https://i.pravatar.cc/64?img=3', name: 'C' },
        { src: 'https://i.pravatar.cc/64?img=4', name: 'D' },
        { src: 'https://i.pravatar.cc/64?img=5', name: 'E' },
      ]}
      max={4}
      aria-label="team"
    />
  ),
};

export const Interactive = {
  render: function InteractiveStory() {
    const [clicks, setClicks] = useState(0);
    return (
      <div className="space-y-3">
        <AvatarGroup
          items={TEAM}
          max={3}
          aria-label="team"
          onOverflowClick={() => setClicks((n) => n + 1)}
        />
        <p className="text-xs text-foreground-muted">Overflow clicked: {clicks}</p>
      </div>
    );
  },
};
