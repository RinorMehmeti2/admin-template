import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropzone } from '@/components/forms/Dropzone';
import type { DropzoneFile, DropzoneLabels } from '@/components/forms/Dropzone';
import { Card } from '@/components/data-display/Card';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Input } from '@/components/forms/Input';
import { FormField } from '@/components/forms/FormField';
import { Label } from '@/components/forms/Label';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-foreground-muted">{description}</p>
      </header>
      <Card variant="outlined" className="p-6 sm:p-8">
        {children}
      </Card>
    </section>
  );
}

function useMockUploader(
  files: ReadonlyArray<DropzoneFile>,
  setFiles: (next: ReadonlyArray<DropzoneFile>) => void,
) {
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const cur = filesRef.current;
      let touched = false;
      const next = cur.map((f) => {
        if (f.status === 'queued') {
          touched = true;
          return { ...f, status: 'uploading' as const };
        }
        if (f.status === 'uploading') {
          touched = true;
          const inc = 10 + Math.random() * 14;
          const np = Math.min(100, f.progress + inc);
          if (np >= 100) {
            if (Math.random() < 0.2) {
              return {
                ...f,
                status: 'error' as const,
                progress: 100,
                errorMessage: 'Network timeout',
              };
            }
            return { ...f, status: 'success' as const, progress: 100 };
          }
          return { ...f, progress: np };
        }
        return f;
      });
      if (touched) setFiles(next);
    }, 350);
    return () => window.clearInterval(id);
  }, [setFiles]);
}

function useLabels(): DropzoneLabels {
  const { t } = useTranslation();
  return useMemo<DropzoneLabels>(
    () => ({
      browse: t('dropzone.label.browse'),
      changeAvatar: t('dropzone.label.changeAvatar'),
      removeAvatar: t('dropzone.label.removeAvatar'),
      remove: (name) => t('dropzone.label.remove', { name }),
      retry: (name) => t('dropzone.label.retry', { name }),
      filesAdded: (count) => t('dropzone.label.filesAdded', { count }),
      filesRejected: (count, reasons) => t('dropzone.label.filesRejected', { count, reasons }),
      reasonType: t('dropzone.label.reasonType'),
      reasonSize: t('dropzone.label.reasonSize'),
      reasonCount: t('dropzone.label.reasonCount'),
    }),
    [t],
  );
}

function CardDemo() {
  const { t } = useTranslation();
  const labels = useLabels();
  const [files, setFiles] = useState<ReadonlyArray<DropzoneFile>>([]);
  useMockUploader(files, setFiles);
  return (
    <Dropzone
      label={t('dropzone.config.any.label')}
      description={t('dropzone.config.any.description')}
      hint={t('dropzone.config.any.hint')}
      maxSize={10 * 1024 * 1024}
      maxFiles={8}
      files={files}
      onFilesChange={(next) => setFiles(next)}
      labels={labels}
    />
  );
}

function InlineDemo() {
  const { t } = useTranslation();
  const labels = useLabels();
  const [files, setFiles] = useState<ReadonlyArray<DropzoneFile>>([]);
  useMockUploader(files, setFiles);
  return (
    <Dropzone
      variant="inline"
      label={t('dropzone.config.csv.label')}
      description={t('dropzone.config.csv.description')}
      hint={t('dropzone.config.csv.hint')}
      accept=".csv,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      maxSize={5 * 1024 * 1024}
      files={files}
      onFilesChange={(next) => setFiles(next)}
      labels={labels}
    />
  );
}

function CompactDemo() {
  const { t } = useTranslation();
  const labels = useLabels();
  const [files, setFiles] = useState<ReadonlyArray<DropzoneFile>>([]);
  useMockUploader(files, setFiles);
  return (
    <Dropzone
      variant="compact"
      label={t('dropzone.config.image.label')}
      hint={t('dropzone.config.image.hint')}
      accept="image/*"
      maxFiles={6}
      files={files}
      onFilesChange={(next) => setFiles(next)}
      labels={labels}
    />
  );
}

function AvatarDemo() {
  const { t } = useTranslation();
  const labels = useLabels();
  const [files, setFiles] = useState<ReadonlyArray<DropzoneFile>>([]);
  useMockUploader(files, setFiles);
  const nameId = 'dz-profile-name';
  const roleId = 'dz-profile-role';
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="flex flex-col items-center gap-2">
        <Dropzone
          variant="avatar"
          label={t('dropzone.config.avatar.label')}
          hint={t('dropzone.config.avatar.hint')}
          maxSize={2 * 1024 * 1024}
          files={files}
          onFilesChange={(next) => setFiles(next)}
          labels={labels}
        />
      </div>
      <form className="flex w-full max-w-sm flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <FormField label={t('dropzone.profile.name')} id={nameId}>
          <Input placeholder={t('dropzone.profile.namePlaceholder')} />
        </FormField>
        <FormField label={t('dropzone.profile.role')} id={roleId}>
          <Input placeholder={t('dropzone.profile.rolePlaceholder')} />
        </FormField>
        <Button type="submit" className="self-start">
          {t('dropzone.profile.save')}
        </Button>
      </form>
    </div>
  );
}

const CASE_KEYS = [
  'dropzone.cases.dragDrop',
  'dropzone.cases.click',
  'dropzone.cases.keyboard',
  'dropzone.cases.mime',
  'dropzone.cases.size',
  'dropzone.cases.count',
  'dropzone.cases.multi',
  'dropzone.cases.single',
  'dropzone.cases.preview',
  'dropzone.cases.progress',
  'dropzone.cases.errorRetry',
  'dropzone.cases.disabled',
  'dropzone.cases.loading',
  'dropzone.cases.controlled',
  'dropzone.cases.formField',
  'dropzone.cases.locale',
  'dropzone.cases.theme',
  'dropzone.cases.print',
] as const;

function CasesCovered() {
  const { t } = useTranslation();
  return (
    <Card variant="outlined" className="space-y-3 p-4 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-foreground-subtle">
        {t('dropzone.cases.title')}
      </p>
      <ul className="flex flex-wrap gap-2">
        {CASE_KEYS.map((key) => (
          <li key={key}>
            <Badge variant="neutral" size="sm">
              {t(key)}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function DropzonePage() {
  const { t } = useTranslation();
  // Stable label hook above also covers the disabled / loading / error demos.
  const labels = useLabels();
  // Suppress unused-Label-import lint by using it where useful.
  const noOp = useCallback(() => undefined, []);
  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t('dropzone.page.title')}</h1>
        <p className="text-foreground-muted">{t('dropzone.page.subtitle')}</p>
      </header>

      <CasesCovered />

      <Section
        title={t('dropzone.section.card.title')}
        description={t('dropzone.section.card.description')}
      >
        <CardDemo />
      </Section>

      <Section
        title={t('dropzone.section.inline.title')}
        description={t('dropzone.section.inline.description')}
      >
        <InlineDemo />
      </Section>

      <Section
        title={t('dropzone.section.compact.title')}
        description={t('dropzone.section.compact.description')}
      >
        <CompactDemo />
      </Section>

      <Section
        title={t('dropzone.section.avatar.title')}
        description={t('dropzone.section.avatar.description')}
      >
        <AvatarDemo />
      </Section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card variant="outlined" className="space-y-3 p-6">
          <Label>{t('dropzone.cases.disabled')}</Label>
          <Dropzone
            variant="inline"
            label={t('dropzone.config.any.label')}
            hint={t('dropzone.config.any.hint')}
            disabled
            labels={labels}
            onFilesChange={noOp}
          />
        </Card>
        <Card variant="outlined" className="space-y-3 p-6">
          <Label>{t('dropzone.cases.loading')}</Label>
          <Dropzone
            variant="inline"
            label={t('dropzone.config.any.label')}
            hint={t('dropzone.config.any.hint')}
            isLoading
            labels={labels}
            onFilesChange={noOp}
          />
        </Card>
      </section>
    </div>
  );
}
