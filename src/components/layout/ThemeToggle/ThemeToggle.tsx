import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/primitives/IconButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/navigation/DropdownMenu';
import { useTheme, type Theme } from '@/context/ThemeProvider';
import { cn } from '@/lib/cn';

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const Icon = resolvedTheme === 'dark' ? Moon : Sun;
  const themeLabels: Record<Theme, string> = {
    light: t('theme.mode.light'),
    dark: t('theme.mode.dark'),
    system: t('theme.mode.system'),
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton
          aria-label={t('theme.toggle.aria', { theme: themeLabels[theme] })}
          variant="ghost"
          size="md"
          data-print="hide"
          className={cn(className)}
        >
          <Icon className="h-4 w-4" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom-end" sideOffset={6} className="min-w-[10rem]">
        <DropdownMenuLabel>{t('theme.toggle.label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={(next) => setTheme(next as Theme)}>
          <DropdownMenuRadioItem value="light">
            <Sun className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
            <span>{themeLabels.light}</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
            <span>{themeLabels.dark}</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
            <span>{themeLabels.system}</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
