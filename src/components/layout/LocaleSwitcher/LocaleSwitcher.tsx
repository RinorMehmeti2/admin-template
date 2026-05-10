import { Languages } from 'lucide-react';
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
import { useLocale } from '@/context/LocaleProvider';
import type { SupportedLocale } from '@/i18n';
import { cn } from '@/lib/cn';

export interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const { locale, setLocale, availableLocales } = useLocale();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <IconButton
          aria-label={t('locale.switcher.aria')}
          variant="ghost"
          size="md"
          data-print="hide"
          className={cn(className)}
        >
          <Languages className="h-4 w-4" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom-end" sideOffset={6} className="min-w-[10rem]">
        <DropdownMenuLabel>{t('locale.switcher.label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(next) => setLocale(next as SupportedLocale)}
        >
          {availableLocales.map((opt) => (
            <DropdownMenuRadioItem key={opt.code} value={opt.code}>
              <span aria-hidden="true">{opt.flag}</span>
              <span>{opt.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
