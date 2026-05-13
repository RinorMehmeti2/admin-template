import type { HTMLAttributes, ReactNode, Ref } from 'react';

export type DropzoneVariant = 'card' | 'inline' | 'compact' | 'avatar';

export type DropzoneFileStatus = 'queued' | 'uploading' | 'success' | 'error';

export interface DropzoneFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: DropzoneFileStatus;
  progress: number;
  errorMessage?: string;
  previewUrl?: string;
}

export type DropzoneRejectionReason = 'type' | 'size' | 'count';

export interface DropzoneRejection {
  file: File;
  reason: DropzoneRejectionReason;
}

export interface DropzoneLabels {
  remove: (name: string) => string;
  retry: (name: string) => string;
  browse: string;
  changeAvatar: string;
  removeAvatar: string;
  filesAdded: (count: number) => string;
  filesRejected: (count: number, reasons: string) => string;
  reasonType: string;
  reasonSize: string;
  reasonCount: string;
}

export interface DropzoneProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrop' | 'onChange'> {
  ref?: Ref<HTMLDivElement>;
  variant?: DropzoneVariant;
  files?: ReadonlyArray<DropzoneFile>;
  defaultFiles?: ReadonlyArray<DropzoneFile>;
  onFilesChange?: (files: ReadonlyArray<DropzoneFile>) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  isLoading?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  hint?: ReactNode;
  errorMessage?: ReactNode;
  onFilesRejected?: (rejections: ReadonlyArray<DropzoneRejection>) => void;
  labels?: Partial<DropzoneLabels>;
}
