import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Download, FilePlus2, Trash2, Upload } from 'lucide-react';
import { useTheme, type ResolvedTheme } from '@/context/ThemeProvider';
import {
  exportPalette,
  importPalette as parseImportPalette,
  TOKEN_GROUPS,
  type ColorTokenKey,
  type Palette,
} from '@/lib/themeTokens';
import { Button } from '@/components/primitives/Button';
import { Badge } from '@/components/primitives/Badge';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { ColorPicker } from '@/components/forms/ColorPicker';
import { Alert } from '@/components/feedback/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/navigation/Tabs';
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

const TOKEN_LABELS: Record<ColorTokenKey, string> = {
  '--color-background': 'Background',
  '--color-surface': 'Surface',
  '--color-surface-muted': 'Surface muted',
  '--color-surface-elevated': 'Surface elevated',
  '--color-foreground': 'Foreground',
  '--color-foreground-muted': 'Foreground muted',
  '--color-foreground-subtle': 'Foreground subtle',
  '--color-border': 'Border',
  '--color-border-strong': 'Border strong',
  '--color-ring': 'Focus ring',
  '--color-primary': 'Primary',
  '--color-primary-foreground': 'Primary fg',
  '--color-secondary': 'Secondary',
  '--color-secondary-foreground': 'Secondary fg',
  '--color-success': 'Success',
  '--color-success-foreground': 'Success fg',
  '--color-warning': 'Warning',
  '--color-warning-foreground': 'Warning fg',
  '--color-danger': 'Danger',
  '--color-danger-foreground': 'Danger fg',
  '--color-info': 'Info',
  '--color-info-foreground': 'Info fg',
};

export function ThemeEditorPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    palettes,
    paletteId,
    activePalette,
    setPaletteId,
    createPalette,
    updatePalette,
    duplicatePalette,
    deletePalette,
    importPalette: addPalette,
    resolvedTheme,
  } = useTheme();

  const [mode, setMode] = useState<ResolvedTheme>(resolvedTheme);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const editable = !activePalette.builtIn;

  const handleNew = () => {
    const fresh = createPalette(`Custom ${palettes.length}`, activePalette);
    setPaletteId(fresh.id);
    toast({ title: t('theme.toast.created', { name: fresh.name }), type: 'success' });
  };

  const handleDuplicate = () => {
    const copy = duplicatePalette(activePalette.id);
    if (copy === null) return;
    setPaletteId(copy.id);
    toast({ title: t('theme.toast.duplicated', { name: copy.name }), type: 'success' });
  };

  const handleDelete = () => {
    const name = activePalette.name;
    deletePalette(activePalette.id);
    setConfirmDelete(false);
    toast({ title: t('theme.toast.deleted', { name }), type: 'success' });
  };

  const handleExport = async () => {
    const text = exportPalette(activePalette);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard !== undefined) {
        await navigator.clipboard.writeText(text);
        toast({ title: t('theme.toast.exported'), type: 'success' });
        return;
      }
    } catch {
      // fall through to dialog fallback
    }
    setImportText(text);
    setImportOpen(true);
    setImportError(null);
  };

  const handleImport = () => {
    const parsed = parseImportPalette(importText);
    if (parsed === null) {
      setImportError(t('theme.import.invalid'));
      return;
    }
    const fresh = addPalette(parsed);
    setPaletteId(fresh.id);
    setImportOpen(false);
    setImportText('');
    setImportError(null);
    toast({ title: t('theme.toast.imported', { name: fresh.name }), type: 'success' });
  };

  const handleRename = (name: string) => {
    if (!editable) return;
    updatePalette(activePalette.id, { name });
  };

  const handleTokenChange = (key: ColorTokenKey, value: string) => {
    if (!editable) return;
    updatePalette(activePalette.id, { [mode]: { [key]: value } });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('theme.editor.title')}</h1>
          <p className="text-sm text-foreground-muted">{t('theme.editor.subtitle')}</p>
        </div>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-foreground-muted">
              {t('theme.editor.activePalette')}
            </label>
            <PaletteSelect
              palettes={palettes}
              value={paletteId}
              onChange={setPaletteId}
              currentMode={resolvedTheme}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<FilePlus2 className="h-4 w-4" />} onClick={handleNew}>
              {t('theme.editor.new')}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Copy className="h-4 w-4" />} onClick={handleDuplicate}>
              {t('theme.editor.duplicate')}
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={() => void handleExport()}>
              {t('theme.editor.export')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="h-4 w-4" />}
              onClick={() => {
                setImportText('');
                setImportError(null);
                setImportOpen(true);
              }}
            >
              {t('theme.editor.import')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              disabled={!editable}
              onClick={() => setConfirmDelete(true)}
            >
              {t('theme.editor.delete')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="palette-name" className="text-xs font-medium text-foreground-muted">
                {t('theme.editor.nameLabel')}
              </label>
              <Input
                id="palette-name"
                value={activePalette.name}
                readOnly={!editable}
                onChange={(e) => handleRename(e.currentTarget.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              {activePalette.builtIn ? (
                <Badge variant="neutral">{t('theme.editor.builtInBadge')}</Badge>
              ) : (
                <Badge variant="success">{t('theme.editor.customBadge')}</Badge>
              )}
            </div>
          </div>

          {!editable ? (
            <Alert variant="info" title={t('theme.editor.readOnlyTitle')}>
              {t('theme.editor.readOnlyBody')}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Tabs value={mode} onValueChange={(v) => setMode(v as ResolvedTheme)} variant="segmented">
        <TabsList aria-label={t('theme.editor.modeTabs')}>
          <TabsTrigger value="light">{t('theme.mode.light')}</TabsTrigger>
          <TabsTrigger value="dark">{t('theme.mode.dark')}</TabsTrigger>
        </TabsList>

        <TabsContent value="light" className="mt-4">
          <TokenGrid palette={activePalette} mode="light" editable={editable} onChange={handleTokenChange} />
        </TabsContent>
        <TabsContent value="dark" className="mt-4">
          <TokenGrid palette={activePalette} mode="dark" editable={editable} onChange={handleTokenChange} />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{t('theme.preview.title')}</CardTitle>
          <CardDescription>{t('theme.preview.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Preview />
        </CardContent>
      </Card>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('theme.import.title')}</DialogTitle>
            <DialogDescription>{t('theme.import.subtitle')}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.currentTarget.value)}
            rows={10}
            aria-label={t('theme.import.textareaAria')}
            className="font-mono text-xs"
          />
          {importError !== null ? (
            <p className="mt-2 text-sm text-danger" role="alert">
              {importError}
            </p>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleImport}>{t('theme.import.submit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('theme.delete.title')}</DialogTitle>
            <DialogDescription>
              {t('theme.delete.body', { name: activePalette.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t('theme.delete.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================================================ */

interface PaletteSelectProps {
  palettes: ReadonlyArray<Palette>;
  value: string;
  onChange: (id: string) => void;
  currentMode: ResolvedTheme;
}

function PaletteSelect({ palettes, value, onChange, currentMode }: PaletteSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {palettes.map((p) => {
        const isActive = p.id === value;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
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
              className="inline-block h-3 w-3 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: p[currentMode]['--color-primary'] }}
            />
            <span className="truncate">{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================ */

interface TokenGridProps {
  palette: Palette;
  mode: ResolvedTheme;
  editable: boolean;
  onChange: (key: ColorTokenKey, value: string) => void;
}

function TokenGrid({ palette, mode, editable, onChange }: TokenGridProps) {
  const { t } = useTranslation();
  const tokens = palette[mode];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TOKEN_GROUPS.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle className="text-sm">{t(group.labelKey)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {group.keys.map((key) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm">{TOKEN_LABELS[key]}</span>
                  <span className="truncate font-mono text-[10px] text-foreground-subtle">{key}</span>
                </div>
                <ColorPicker
                  value={tokens[key]}
                  onValueChange={(v) => onChange(key, v)}
                  disabled={!editable}
                  format="hex"
                  aria-label={`${TOKEN_LABELS[key]} (${mode})`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ============================================================ */

function Preview() {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">{t('theme.preview.buttons')}</p>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
        </div>
        <Input placeholder={t('theme.preview.inputPlaceholder')} />
      </div>
      <div className="space-y-3">
        <Alert variant="info" title={t('theme.preview.alertInfoTitle')}>
          {t('theme.preview.alertInfoBody')}
        </Alert>
        <Alert variant="success" title={t('theme.preview.alertSuccessTitle')}>
          {t('theme.preview.alertSuccessBody')}
        </Alert>
        <Alert variant="warning" title={t('theme.preview.alertWarningTitle')}>
          {t('theme.preview.alertWarningBody')}
        </Alert>
        <Alert variant="danger" title={t('theme.preview.alertDangerTitle')}>
          {t('theme.preview.alertDangerBody')}
        </Alert>
      </div>
    </div>
  );
}

