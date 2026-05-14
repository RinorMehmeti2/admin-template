import { useTranslation } from 'react-i18next';
import { Calendar, MessageCircle, MoreHorizontal } from 'lucide-react';
import { Avatar } from '@/components/primitives/Avatar';
import { Badge } from '@/components/primitives/Badge';
import { Card, CardContent } from '@/components/data-display/Card';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';

export interface CrewMember {
  name: string;
  role: string;
  status: 'on-shift' | 'on-break' | 'off';
  specialties: ReadonlyArray<string>;
  avatarSrc?: string;
}

const STATUS_LABEL: Record<CrewMember['status'], string> = {
  'on-shift': 'croissant.cards.crew.status.onShift',
  'on-break': 'croissant.cards.crew.status.onBreak',
  off: 'croissant.cards.crew.status.off',
};

const STATUS_VARIANT: Record<CrewMember['status'], 'success' | 'warning' | 'neutral'> = {
  'on-shift': 'success',
  'on-break': 'warning',
  off: 'neutral',
};

interface CrewCardProps {
  member: CrewMember;
}

export function CrewCard({ member }: CrewCardProps) {
  const { t } = useTranslation();

  return (
    <Card variant="outlined" className="group">
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar
            size="md"
            name={member.name}
            status={
              member.status === 'on-shift'
                ? 'online'
                : member.status === 'on-break'
                  ? 'away'
                  : 'offline'
            }
            className="overflow-visible"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
            <p className="truncate text-xs text-foreground-muted">{member.role}</p>
          </div>
          <Badge variant={STATUS_VARIANT[member.status]} size="sm" dot>
            {t(STATUS_LABEL[member.status])}
          </Badge>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {member.specialties.map((s) => (
            <li key={s}>
              <Badge variant="primary" size="sm">
                {s}
              </Badge>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" leftIcon={<MessageCircle className="h-4 w-4" />}>
              {t('croissant.cards.crew.message')}
            </Button>
            <Button size="sm" variant="ghost" leftIcon={<Calendar className="h-4 w-4" />}>
              {t('croissant.cards.crew.schedule')}
            </Button>
          </div>
          <IconButton
            aria-label={t('croissant.cards.crew.more', { name: member.name })}
            variant="ghost"
            size="sm"
          >
            <MoreHorizontal className="h-4 w-4" />
          </IconButton>
        </div>
      </CardContent>
    </Card>
  );
}
