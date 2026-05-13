import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Camera,
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  ImagePlus,
  RefreshCw,
  UploadCloud,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useControllableState } from '@/hooks/useControllableState';
import { useMergedRefs } from '@/hooks/useMergedRefs';
import { useFieldAriaProps } from '@/components/forms/FormField/FormFieldContext';
import { IconButton } from '@/components/primitives/IconButton';
import { Progress } from '@/components/feedback/Progress';
import { Spinner } from '@/components/primitives/Spinner';
import type {
  DropzoneFile,
  DropzoneLabels,
  DropzoneProps,
  DropzoneRejection,
  DropzoneRejectionReason,
} from './Dropzone.types';

const DEFAULT_LABELS: DropzoneLabels = {
  remove: (name) => `Remove ${name}`,
  retry: (name) => `Retry ${name}`,
  browse: 'Browse files',
  changeAvatar: 'Change',
  removeAvatar: 'Remove',
  filesAdded: (count) => `${count} file${count === 1 ? '' : 's'} added`,
  filesRejected: (count, reasons) =>
    `${count} file${count === 1 ? '' : 's'} rejected: ${reasons}`,
  reasonType: 'unsupported type',
  reasonSize: 'too large',
  reasonCount: 'too many files',
};

const rootStyles = cva(
  [
    'group relative box-border outline-none transition-colors',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' '),
  {
    variants: {
      variant: {
        card:
          'flex min-h-56 w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center',
        inline:
          'flex w-full flex-col items-start gap-3 rounded-md border-2 border-dashed p-4 sm:flex-row sm:items-center',
        compact:
          'flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed p-3 text-center',
        avatar:
          'flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed p-0',
      },
    },
    defaultVariants: { variant: 'card' },
  },
);

type RootVariants = VariantProps<typeof rootStyles>;

function getFileIcon(type: string): LucideIcon {
  if (type.startsWith('image/')) return FileImage;
  if (type.startsWith('video/')) return FileVideo;
  if (type.startsWith('audio/')) return FileAudio;
  if (
    type === 'text/csv' ||
    type.includes('spreadsheet') ||
    type.includes('excel')
  ) {
    return FileSpreadsheet;
  }
  if (
    type === 'application/zip' ||
    type === 'application/x-rar-compressed' ||
    type === 'application/x-7z-compressed' ||
    type === 'application/x-tar' ||
    type === 'application/gzip'
  ) {
    return FileArchive;
  }
  if (type === 'application/pdf') return FileText;
  if (type.startsWith('text/')) return FileText;
  return FileIcon;
}

function matchesAccept(file: File, accept: string): boolean {
  const patterns = accept
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');
  if (patterns.length === 0) return true;
  const lowerName = file.name.toLowerCase();
  return patterns.some((p) => {
    if (p.startsWith('.')) return lowerName.endsWith(p.toLowerCase());
    if (p.endsWith('/*')) {
      const prefix = p.slice(0, -1);
      return file.type.startsWith(prefix);
    }
    return file.type === p;
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  const value = bytes / Math.pow(k, i);
  return `${i === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[i]}`;
}

function newId(): string {
  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID();
  }
  return `dz-${Math.random().toString(36).slice(2, 11)}-${Date.now().toString(36)}`;
}

function normalizeFile(f: File): DropzoneFile {
  const out: DropzoneFile = {
    id: newId(),
    file: f,
    name: f.name,
    size: f.size,
    type: f.type,
    status: 'queued',
    progress: 0,
  };
  if (
    f.type.startsWith('image/') &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function'
  ) {
    out.previewUrl = URL.createObjectURL(f);
  }
  return out;
}

function countReasons(
  rejections: ReadonlyArray<DropzoneRejection>,
  labels: DropzoneLabels,
): string {
  const counts: Record<DropzoneRejectionReason, number> = {
    type: 0,
    size: 0,
    count: 0,
  };
  for (const r of rejections) counts[r.reason] += 1;
  const parts: string[] = [];
  if (counts.type > 0) parts.push(`${counts.type} ${labels.reasonType}`);
  if (counts.size > 0) parts.push(`${counts.size} ${labels.reasonSize}`);
  if (counts.count > 0) parts.push(`${counts.count} ${labels.reasonCount}`);
  return parts.join(', ');
}

interface FileListProps {
  files: ReadonlyArray<DropzoneFile>;
  layout: 'grid' | 'list' | 'chips';
  disabled: boolean;
  labels: DropzoneLabels;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

function DropzoneFileList({
  files,
  layout,
  disabled,
  labels,
  onRemove,
  onRetry,
}: FileListProps) {
  if (files.length === 0) return null;
  const wrapper =
    layout === 'grid'
      ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
      : layout === 'chips'
        ? 'flex flex-row gap-2 overflow-x-auto pb-1'
        : 'flex flex-col gap-2';
  return (
    <ul className={cn('mt-3 w-full', wrapper)}>
      {files.map((f) => {
        const Icon = getFileIcon(f.type);
        const isError = f.status === 'error';
        const isUploading = f.status === 'uploading';
        const compactChip = layout === 'chips';
        return (
          <li
            key={f.id}
            className={cn(
              'flex items-center gap-3 rounded-md border border-border bg-surface-muted/40 p-2',
              compactChip ? 'shrink-0' : '',
              isError ? 'border-danger/40' : '',
            )}
          >
            {f.previewUrl !== undefined ? (
              <img
                src={f.previewUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-surface-elevated text-foreground-muted"
              >
                <Icon className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{f.name}</p>
              <p className="text-xs text-foreground-subtle">
                {formatBytes(f.size)}
                {f.status === 'success' ? ' · uploaded' : ''}
              </p>
              {isUploading ? (
                <Progress value={f.progress} size="sm" className="mt-1" />
              ) : null}
              {isError ? (
                <p className="mt-1 text-xs text-danger">
                  {f.errorMessage !== undefined && f.errorMessage !== ''
                    ? f.errorMessage
                    : 'Upload failed'}
                </p>
              ) : null}
            </div>
            {isError ? (
              <IconButton
                aria-label={labels.retry(f.name)}
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry(f.id);
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </IconButton>
            ) : null}
            <IconButton
              aria-label={labels.remove(f.name)}
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(f.id);
              }}
            >
              <X className="h-4 w-4" />
            </IconButton>
          </li>
        );
      })}
    </ul>
  );
}

export function Dropzone({
  ref,
  variant: variantProp,
  files,
  defaultFiles,
  onFilesChange,
  accept: acceptProp,
  multiple: multipleProp = true,
  maxFiles,
  maxSize,
  disabled = false,
  isLoading = false,
  label,
  description,
  hint,
  errorMessage,
  onFilesRejected,
  labels: labelsProp,
  className,
  id,
  'aria-label': ariaLabelProp,
  'aria-describedby': ariaDescribedByProp,
  'aria-labelledby': ariaLabelledByProp,
  ...rest
}: DropzoneProps) {
  const variant: RootVariants['variant'] = variantProp ?? 'card';
  const isAvatar = variant === 'avatar';
  const multiple = isAvatar ? false : multipleProp;
  const accept = acceptProp ?? (isAvatar ? 'image/*' : undefined);

  const labels: DropzoneLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labelsProp }),
    [labelsProp],
  );

  const [filesState, setFiles] = useControllableState<ReadonlyArray<DropzoneFile>>({
    value: files,
    defaultValue: defaultFiles ?? [],
    onChange: (next) => onFilesChange?.(next),
  });
  const filesArr = useMemo(() => filesState ?? [], [filesState]);

  const reactId = useId();
  const hintId = hint !== undefined ? `${reactId}-hint` : undefined;
  const labelId = label !== undefined ? `${reactId}-label` : undefined;
  const errorId =
    errorMessage !== undefined && errorMessage !== '' ? `${reactId}-error` : undefined;

  const fieldAria = useFieldAriaProps(
    {
      id,
      'aria-describedby': ariaDescribedByProp,
      'aria-labelledby': ariaLabelledByProp,
      'aria-invalid':
        errorMessage !== undefined && errorMessage !== '' ? true : undefined,
    },
    errorMessage !== undefined && errorMessage !== '',
  );

  const describedByParts = [
    fieldAria['aria-describedby'],
    hintId,
    errorId,
  ].filter((s): s is string => typeof s === 'string' && s.length > 0);
  const ariaDescribedBy =
    describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  // Compact + avatar variants don't render a visible <p id={labelId}>, so a
  // labelledby pointing at it would dangle. Fall back to aria-label for those.
  const labelRenderedAsText = variant === 'card' || variant === 'inline';
  const ariaLabelledBy = labelRenderedAsText
    ? (fieldAria['aria-labelledby'] ?? labelId)
    : fieldAria['aria-labelledby'];
  const fallbackAriaLabel =
    ariaLabelProp ??
    (typeof label === 'string' && label !== ''
      ? labelRenderedAsText
        ? undefined
        : label
      : 'File upload area');

  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(rootRef, ref);

  const dragCounterRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Transient zone-level error from last drop's rejections, auto-clear 5s.
  const [transientRejections, setTransientRejections] = useState<
    ReadonlyArray<DropzoneRejection> | null
  >(null);
  useEffect(() => {
    if (transientRejections === null) return;
    const t = window.setTimeout(() => setTransientRejections(null), 5000);
    return () => window.clearTimeout(t);
  }, [transientRejections]);

  // Live region announcement.
  const [liveMessage, setLiveMessage] = useState<{ text: string; key: number }>({
    text: '',
    key: 0,
  });

  // Object URL lifecycle: revoke when a file id leaves the list, and on unmount.
  const prevFilesRef = useRef<ReadonlyArray<DropzoneFile>>([]);
  useEffect(() => {
    const currentIds = new Set(filesArr.map((f) => f.id));
    for (const old of prevFilesRef.current) {
      if (
        !currentIds.has(old.id) &&
        typeof old.previewUrl === 'string' &&
        typeof URL !== 'undefined' &&
        typeof URL.revokeObjectURL === 'function'
      ) {
        URL.revokeObjectURL(old.previewUrl);
      }
    }
    prevFilesRef.current = filesArr;
  }, [filesArr]);
  useEffect(() => {
    return () => {
      for (const f of prevFilesRef.current) {
        if (
          typeof f.previewUrl === 'string' &&
          typeof URL !== 'undefined' &&
          typeof URL.revokeObjectURL === 'function'
        ) {
          URL.revokeObjectURL(f.previewUrl);
        }
      }
    };
  }, []);

  const openPicker = useCallback(() => {
    if (disabled || isLoading) return;
    inputRef.current?.click();
  }, [disabled, isLoading]);

  const handleFiles = useCallback(
    (incoming: ReadonlyArray<File>) => {
      const current = prevFilesRef.current;
      const accepted: DropzoneFile[] = [];
      const rejections: DropzoneRejection[] = [];

      const replaceList = !multiple;
      const existingCount = replaceList ? 0 : current.length;
      const cap = replaceList
        ? 1
        : maxFiles !== undefined
          ? Math.max(0, maxFiles - existingCount)
          : Number.POSITIVE_INFINITY;
      let seatsLeft = cap;

      for (const f of incoming) {
        if (accept !== undefined && accept !== '' && !matchesAccept(f, accept)) {
          rejections.push({ file: f, reason: 'type' });
          continue;
        }
        if (maxSize !== undefined && f.size > maxSize) {
          rejections.push({ file: f, reason: 'size' });
          continue;
        }
        if (seatsLeft <= 0) {
          rejections.push({ file: f, reason: 'count' });
          continue;
        }
        accepted.push(normalizeFile(f));
        seatsLeft -= 1;
        if (replaceList) break;
      }

      if (accepted.length > 0) {
        const nextList: ReadonlyArray<DropzoneFile> = replaceList
          ? accepted
          : [...current, ...accepted];
        setFiles(nextList);
      }

      if (rejections.length > 0) {
        onFilesRejected?.(rejections);
        setTransientRejections(rejections);
      }

      if (accepted.length > 0 || rejections.length > 0) {
        const parts: string[] = [];
        if (accepted.length > 0) parts.push(labels.filesAdded(accepted.length));
        if (rejections.length > 0) {
          parts.push(labels.filesRejected(rejections.length, countReasons(rejections, labels)));
        }
        setLiveMessage((prev) => ({ text: parts.join('. '), key: prev.key + 1 }));
      }
    },
    [accept, labels, maxFiles, maxSize, multiple, onFilesRejected, setFiles],
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list === null || list.length === 0) return;
    handleFiles(Array.from(list));
    // Reset so the same file can be re-selected later.
    e.target.value = '';
  };

  const onRootClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (disabled || isLoading) return;
    rest.onClick?.(e);
    if (e.defaultPrevented) return;
    // Programmatic input.click() bubbles back to root — short-circuit the loop.
    if (e.target === inputRef.current) return;
    openPicker();
  };

  const onRootKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    rest.onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (disabled || isLoading) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const onDragEnter = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isLoading) return;
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDragging(true);
  };

  const onDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer !== null) {
      try {
        e.dataTransfer.dropEffect = disabled || isLoading ? 'none' : 'copy';
      } catch {
        /* some browsers throw if read-only */
      }
    }
  };

  const onDragLeave = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) setIsDragging(false);
  };

  const onDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    if (disabled || isLoading) return;
    const list = e.dataTransfer?.files;
    if (list === undefined || list === null || list.length === 0) return;
    handleFiles(Array.from(list));
  };

  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((prev) => (prev ?? []).filter((f) => f.id !== fileId));
    },
    [setFiles],
  );

  const retryFile = useCallback(
    (fileId: string) => {
      setFiles((prev) =>
        (prev ?? []).map((f) => {
          if (f.id !== fileId) return f;
          const { errorMessage: _err, ...rest } = f;
          return { ...rest, status: 'queued' as const, progress: 0 };
        }),
      );
    },
    [setFiles],
  );

  const hasError =
    (errorMessage !== undefined && errorMessage !== '') ||
    transientRejections !== null ||
    fieldAria.hasError;

  const stateClasses = disabled
    ? 'opacity-60 cursor-not-allowed border-border bg-surface'
    : hasError
      ? 'border-danger bg-danger/5'
      : isDragging
        ? 'border-primary bg-primary/5'
        : 'border-border bg-surface hover:border-foreground-muted';

  const cursorClass = disabled || isLoading ? '' : 'cursor-pointer';

  const renderHiddenInput = () => (
    <input
      ref={inputRef}
      type="file"
      className="sr-only"
      aria-hidden="true"
      tabIndex={-1}
      accept={accept}
      multiple={multiple}
      disabled={disabled || isLoading}
      onChange={onInputChange}
    />
  );

  const renderLoadingOverlay = () =>
    isLoading ? (
      <span
        aria-hidden="true"
        className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-surface/60"
      >
        <Spinner size="md" />
      </span>
    ) : null;

  const renderLiveRegion = () => (
    <div className="sr-only" role="status" aria-live="polite" key={liveMessage.key}>
      {liveMessage.text}
    </div>
  );

  const rejectionInlineText =
    transientRejections !== null
      ? labels.filesRejected(transientRejections.length, countReasons(transientRejections, labels))
      : null;

  const rootCommon = {
    ref: mergedRef,
    role: 'button' as const,
    tabIndex: disabled ? -1 : 0,
    'aria-disabled': disabled ? true : undefined,
    'aria-label': fallbackAriaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': hasError ? (true as const) : undefined,
    'data-drag-active': isDragging ? 'true' : undefined,
    'data-error': hasError ? 'true' : undefined,
    'data-disabled': disabled ? 'true' : undefined,
    'data-print': 'hide' as const,
    onClick: onRootClick,
    onKeyDown: onRootKeyDown,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
  };

  if (variant === 'avatar') {
    const first = filesArr[0];
    const previewUrl = first?.previewUrl;
    const isUploadingAvatar = first?.status === 'uploading';
    return (
      <div className="inline-block">
        <div className="relative inline-block">
          <div
            {...rest}
            {...rootCommon}
            className={cn(
              rootStyles({ variant }),
              stateClasses,
              cursorClass,
              className,
            )}
            id={fieldAria.id}
          >
            {previewUrl !== undefined ? (
              <>
                <img
                  src={previewUrl}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
                {isUploadingAvatar ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/30"
                  >
                    <Spinner size="sm" />
                  </span>
                ) : null}
                {!disabled && !isLoading ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-foreground/45 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {labels.changeAvatar}
                  </span>
                ) : null}
              </>
            ) : (
              <Camera
                className="h-7 w-7 text-foreground-muted"
                aria-hidden="true"
              />
            )}
            {renderLoadingOverlay()}
          </div>
          {renderHiddenInput()}
          {first !== undefined && !disabled && !isLoading ? (
            <IconButton
              aria-label={labels.removeAvatar}
              variant="secondary"
              size="sm"
              className="absolute -right-1 -top-1 h-6 w-6 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                removeFile(first.id);
              }}
            >
              <X className="h-3 w-3" />
            </IconButton>
          ) : null}
        </div>
        {renderLiveRegion()}
        {hint !== undefined ? (
          <p id={hintId} className="mt-1 text-xs text-foreground-subtle">
            {hint}
          </p>
        ) : null}
        {(errorMessage !== undefined && errorMessage !== '') ||
        rejectionInlineText !== null ? (
          <p id={errorId} role="alert" className="mt-1 text-xs text-danger">
            {errorMessage !== undefined && errorMessage !== ''
              ? errorMessage
              : rejectionInlineText}
          </p>
        ) : null}
      </div>
    );
  }

  // card / inline / compact
  if (variant === 'compact') {
    const first = filesArr[0];
    const singleAndPresent = !multiple && first !== undefined;
    return (
      <div className="flex items-start gap-3">
        <div
          {...rest}
          {...rootCommon}
          className={cn(
            rootStyles({ variant }),
            stateClasses,
            cursorClass,
            className,
          )}
          id={fieldAria.id}
        >
          {singleAndPresent && first.previewUrl !== undefined ? (
            <img
              src={first.previewUrl}
              alt={first.name}
              className="h-full w-full rounded-md object-cover"
            />
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-foreground-muted" aria-hidden="true" />
              <span className="text-xs text-foreground-muted">
                {typeof label === 'string' && label !== '' ? label : 'Add file'}
              </span>
            </>
          )}
          {renderLoadingOverlay()}
        </div>
        {renderHiddenInput()}
        {multiple ? (
          <DropzoneFileList
            files={filesArr}
            layout="chips"
            disabled={disabled || isLoading}
            labels={labels}
            onRemove={removeFile}
            onRetry={retryFile}
          />
        ) : null}
        {renderLiveRegion()}
        {hint !== undefined ? (
          <p id={hintId} className="sr-only">
            {hint}
          </p>
        ) : null}
        {(errorMessage !== undefined && errorMessage !== '') ||
        rejectionInlineText !== null ? (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {errorMessage !== undefined && errorMessage !== ''
              ? errorMessage
              : rejectionInlineText}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        {...rest}
        {...rootCommon}
        className={cn(
          rootStyles({ variant }),
          stateClasses,
          cursorClass,
          className,
        )}
        id={fieldAria.id}
      >
        {variant === 'card' ? (
          <>
            <UploadCloud
              className="h-10 w-10 text-foreground-muted"
              aria-hidden="true"
            />
            <div className="space-y-1">
              {label !== undefined ? (
                <p id={labelId} className="text-sm font-medium text-foreground">
                  {label}
                </p>
              ) : null}
              {description !== undefined ? (
                <p className="text-sm text-foreground-muted">{description}</p>
              ) : null}
            </div>
            <span
              aria-hidden="true"
              className={cn(
                'inline-flex h-8 items-center justify-center rounded-md border border-border bg-transparent px-3 text-sm font-medium text-foreground transition-colors',
                disabled || isLoading ? '' : 'group-hover:bg-surface-muted',
              )}
            >
              {labels.browse}
            </span>
            {hint !== undefined ? (
              <p id={hintId} className="text-xs text-foreground-subtle">
                {hint}
              </p>
            ) : null}
            {rejectionInlineText !== null ||
            (errorMessage !== undefined && errorMessage !== '') ? (
              <p
                id={errorId}
                role="alert"
                className="text-xs text-danger"
              >
                {errorMessage !== undefined && errorMessage !== ''
                  ? errorMessage
                  : rejectionInlineText}
              </p>
            ) : null}
          </>
        ) : null}
        {variant === 'inline' ? (
          <>
            <UploadCloud
              className="h-6 w-6 shrink-0 text-foreground-muted"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1 text-left">
              {label !== undefined ? (
                <p id={labelId} className="text-sm font-medium text-foreground">
                  {label}
                </p>
              ) : null}
              {description !== undefined ? (
                <p className="truncate text-xs text-foreground-muted">{description}</p>
              ) : null}
              {hint !== undefined ? (
                <p id={hintId} className="truncate text-xs text-foreground-subtle">
                  {hint}
                </p>
              ) : null}
            </div>
            <span
              aria-hidden="true"
              className={cn(
                'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-border bg-transparent px-3 text-sm font-medium text-foreground transition-colors',
                disabled || isLoading ? '' : 'group-hover:bg-surface-muted',
              )}
            >
              {labels.browse}
            </span>
            {rejectionInlineText !== null ||
            (errorMessage !== undefined && errorMessage !== '') ? (
              <p
                id={errorId}
                role="alert"
                className="basis-full text-xs text-danger"
              >
                {errorMessage !== undefined && errorMessage !== ''
                  ? errorMessage
                  : rejectionInlineText}
              </p>
            ) : null}
          </>
        ) : null}
        {renderLoadingOverlay()}
      </div>
      {renderHiddenInput()}
      <DropzoneFileList
        files={filesArr}
        layout={variant === 'card' ? 'grid' : 'list'}
        disabled={disabled || isLoading}
        labels={labels}
        onRemove={removeFile}
        onRetry={retryFile}
      />
      {renderLiveRegion()}
    </div>
  );
}

