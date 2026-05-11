import { Palette as PaletteIcon, Settings2 } from 'lucide-react';
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

export interface ThemePickerProps {
  className?: string;
  editorRoute?: string;
}

export function ThemePicker({ className, editorRoute = '/settings/theme' }: ThemePickerProps) {
  const { palettes, paletteId, setPaletteId, activePalette, resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const swatchColor = activePalette[resolvedTheme]['--color-primary'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton
          aria-label={t('theme.picker.aria', { name: activePalette.name })}
          variant="ghost"
          size="md"
          data-print="hide"
          className={cn(className)}
        >
          <span className="relative inline-flex h-4 w-4 items-center justify-center">
            <PaletteIcon className="h-4 w-4" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-surface"
              style={{ backgroundColor: swatchColor }}
            />
          </span>
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom-end" sideOffset={6} className="min-w-[14rem]">
        <DropdownMenuLabel>{t('theme.picker.label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={paletteId} onValueChange={setPaletteId}>
          {palettes.map((p) => (
            <DropdownMenuRadioItem key={p.id} value={p.id}>
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: p[resolvedTheme]['--color-primary'] }}
              />
              <span className="flex-1 truncate">{p.name}</span>
              {p.builtIn ? (
                <span className="ml-auto text-[10px] uppercase tracking-wide text-foreground-subtle">
                  {t('theme.picker.builtIn')}
                </span>
              ) : null}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate(editorRoute)}>
          <Settings2 className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
          <span>{t('theme.picker.customize')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
