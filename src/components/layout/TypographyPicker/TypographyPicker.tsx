import { Settings2, Type } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@/components/primitives/IconButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { useTheme } from '@/context/ThemeProvider';
import { cn } from '@/lib/cn';

export interface TypographyPickerProps {
  className?: string;
  editorRoute?: string;
}

export function TypographyPicker({
  className,
  editorRoute = '/settings/typography',
}: TypographyPickerProps) {
  const { typographies, typographyId, setTypographyId, activeTypography } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton
          aria-label={t('typography.picker.aria', { name: activeTypography.name })}
          variant="ghost"
          size="md"
          data-print="hide"
          className={cn(className)}
        >
          <Type className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom-end" sideOffset={6} className="min-w-[16rem]">
        <DropdownMenuLabel>{t('typography.picker.label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={typographyId} onValueChange={setTypographyId}>
          {typographies.map((c) => (
            <DropdownMenuRadioItem key={c.id} value={c.id}>
              <span
                aria-hidden="true"
                className="inline-block w-7 shrink-0 text-center text-sm font-semibold"
                style={{ fontFamily: c.fonts['--font-heading'] ?? c.fonts['--font-sans'] }}
              >
                Aa
              </span>
              <span className="flex-1 truncate">{c.name}</span>
              {c.builtIn ? (
                <span className="ml-auto text-[10px] uppercase tracking-wide text-foreground-subtle">
                  {t('typography.picker.builtIn')}
                </span>
              ) : null}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate(editorRoute)}>
          <Settings2 className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
          <span>{t('typography.picker.customize')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
