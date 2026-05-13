import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, FilePlus2, RefreshCcw, Trash2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import {
  TYPOGRAPHY_SCALE_MAX,
  TYPOGRAPHY_SCALE_MIN,
  TYPOGRAPHY_SCALE_DEFAULT,
  type TypographyConfig,
} from '@/lib/typography';
import { FONT_TOKEN_KEYS, type FontTokenKey } from '@/lib/themeTokens';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { Input } from '@/components/forms/Input';
import { Slider } from '@/components/forms/Slider';
import { Alert } from '@/components/feedback/Alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/data-display/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/feedback/Dialog';
import { useToast } from '@/context/ToastProvider';
import { cn } from '@/lib/cn';

const FONT_ROLE_LABELS: Record<FontTokenKey, string> = {
  '--font-sans': 'Sans (body, UI)',
  '--font-serif': 'Serif',
  '--font-mono': 'Mono (code)',
  '--font-heading': 'Headings',
};

const FONT_ROLE_PREVIEWS: Record<FontTokenKey, string> = {
  '--font-sans': 'The quick brown fox jumps over the lazy dog',
  '--font-serif': 'The quick brown fox jumps over the lazy dog',
  '--font-mono': 'const fox = () => "quick brown";',
  '--font-heading': 'Aa Bb Cc — Heading sample',
};

export function TypographyEditorPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    typographies,
    typographyId,
    activeTypography,
    setTypographyId,
    createTypography,
    updateTypography,
    duplicateTypography,
    deleteTypography,
  } = useTheme();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const editable = !activeTypography.builtIn;

  const handleNew = () => {
    const fresh = createTypography(`Custom ${typographies.length}`, activeTypography);
    setTypographyId(fresh.id);
    toast({ title: t('typography.toast.created', { name: fresh.name }), type: 'success' });
  };

  const handleDuplicate = () => {
    const copy = duplicateTypography(activeTypography.id);
    if (copy === null) return;
    setTypographyId(copy.id);
    toast({ title: t('typography.toast.duplicated', { name: copy.name }), type: 'success' });
  };

  const handleDelete = () => {
    const name = activeTypography.name;
    deleteTypography(activeTypography.id);
    setConfirmDelete(false);
    toast({ title: t('typography.toast.deleted', { name }), type: 'success' });
  };

  const handleRename = (name: string) => {
    if (!editable) return;
    updateTypography(activeTypography.id, { name });
  };

  const handleFontChange = (key: FontTokenKey, value: string) => {
    if (!editable) return;
    updateTypography(activeTypography.id, { fonts: { [key]: value } });
  };

  const handleScale = (value: number) => {
    if (!editable) return;
    updateTypography(activeTypography.id, { scale: value });
  };

  const handleResetScale = () => {
    if (!editable) return;
    updateTypography(activeTypography.id, { scale: TYPOGRAPHY_SCALE_DEFAULT });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t('typography.editor.title')}</h1>
        <p className="text-sm text-foreground-muted">{t('typography.editor.subtitle')}</p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-foreground-muted">
              {t('typography.editor.activeConfig')}
            </label>
            <ConfigSelect configs={typographies} value={typographyId} onChange={setTypographyId} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FilePlus2 className="h-4 w-4" />}
              onClick={handleNew}
            >
              {t('typography.editor.new')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Copy className="h-4 w-4" />}
              onClick={handleDuplicate}
            >
              {t('typography.editor.duplicate')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              disabled={!editable}
              onClick={() => setConfirmDelete(true)}
            >
              {t('typography.editor.delete')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="typo-name" className="text-xs font-medium text-foreground-muted">
                {t('typography.editor.nameLabel')}
              </label>
              <Input
                id="typo-name"
                value={activeTypography.name}
                readOnly={!editable}
                onChange={(e) => handleRename(e.currentTarget.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              {activeTypography.builtIn ? (
                <Badge variant="neutral">{t('typography.editor.builtInBadge')}</Badge>
              ) : (
                <Badge variant="success">{t('typography.editor.customBadge')}</Badge>
              )}
            </div>
          </div>

          {!editable ? (
            <Alert variant="info" title={t('typography.editor.readOnlyTitle')}>
              {t('typography.editor.readOnlyBody')}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('typography.editor.scaleTitle')}</CardTitle>
          <CardDescription>{t('typography.editor.scaleSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="w-16 shrink-0 font-mono text-xs text-foreground-subtle">
              {Math.round(TYPOGRAPHY_SCALE_MIN * 100)}%
            </span>
            <Slider
              value={activeTypography.scale}
              min={TYPOGRAPHY_SCALE_MIN}
              max={TYPOGRAPHY_SCALE_MAX}
              step={0.01}
              onValueChange={handleScale}
              disabled={!editable}
              aria-label={t('typography.editor.scaleAria')}
              formatValue={(v) => `${Math.round(v * 100)}%`}
              className="flex-1"
            />
            <span className="w-16 shrink-0 text-right font-mono text-xs text-foreground-subtle">
              {Math.round(TYPOGRAPHY_SCALE_MAX * 100)}%
            </span>
            <span className="ml-2 w-14 shrink-0 text-right font-mono text-sm">
              {Math.round(activeTypography.scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={!editable}
              onClick={handleResetScale}
              leftIcon={<RefreshCcw className="h-3.5 w-3.5" />}
            >
              {t('typography.editor.scaleReset')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('typography.editor.familiesTitle')}</CardTitle>
          <CardDescription>{t('typography.editor.familiesSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {FONT_TOKEN_KEYS.map((key) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <label htmlFor={`font-${key}`} className="text-sm font-medium">
                    {FONT_ROLE_LABELS[key]}
                  </label>
                  <span className="font-mono text-[10px] text-foreground-subtle">{key}</span>
                </div>
                <Input
                  id={`font-${key}`}
                  value={activeTypography.fonts[key] ?? ''}
                  placeholder={t('typography.editor.familyPlaceholder')}
                  readOnly={!editable}
                  onChange={(e) => handleFontChange(key, e.currentTarget.value)}
                />
                <p
                  className="rounded-md border border-border bg-surface-muted/40 p-3 text-sm"
                  style={{
                    fontFamily: activeTypography.fonts[key] ?? `var(${key})`,
                    fontSize: key === '--font-heading' ? '1.25rem' : undefined,
                    fontWeight: key === '--font-heading' ? 600 : undefined,
                  }}
                >
                  {FONT_ROLE_PREVIEWS[key]}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('typography.preview.title')}</CardTitle>
          <CardDescription>{t('typography.preview.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Preview />
        </CardContent>
      </Card>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('typography.delete.title')}</DialogTitle>
            <DialogDescription>
              {t('typography.delete.body', { name: activeTypography.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t('typography.delete.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================================================ */

interface ConfigSelectProps {
  configs: ReadonlyArray<TypographyConfig>;
  value: string;
  onChange: (id: string) => void;
}

function ConfigSelect({ configs, value, onChange }: ConfigSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {configs.map((c) => {
        const isActive = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            aria-pressed={isActive}
            className={cn(
              'flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isActive
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-surface text-foreground-muted hover:bg-surface-muted hover:text-foreground',
            )}
          >
            <span
              aria-hidden="true"
              className="text-sm font-semibold"
              style={{ fontFamily: c.fonts['--font-heading'] ?? c.fonts['--font-sans'] }}
            >
              Aa
            </span>
            <span className="truncate">{c.name}</span>
            <span className="font-mono text-[10px] text-foreground-subtle">
              {Math.round(c.scale * 100)}%
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================ */

function Preview() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">{t('typography.preview.h1')}</h1>
        <h2 className="mt-3 text-2xl font-semibold">{t('typography.preview.h2')}</h2>
        <h3 className="mt-2 text-xl font-semibold">{t('typography.preview.h3')}</h3>
      </div>
      <p className="text-base">{t('typography.preview.body')}</p>
      <p className="text-sm text-foreground-muted">{t('typography.preview.small')}</p>
      <div className="flex flex-wrap gap-2">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <pre className="overflow-x-auto rounded-md border border-border bg-surface-muted p-3 font-mono text-sm">
        <code>{`function greet(name) {\n  return \`Hello, \${name}!\`;\n}`}</code>
      </pre>
    </div>
  );
}
