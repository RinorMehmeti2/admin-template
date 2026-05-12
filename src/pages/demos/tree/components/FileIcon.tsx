import { File, FileCode, FileText, Folder, FolderOpen } from 'lucide-react';
import type { FileMeta } from '../model';

export function FileIcon({ kind, isExpanded }: { kind: FileMeta['kind']; isExpanded: boolean }) {
  if (kind === 'folder') {
    return isExpanded ? (
      <FolderOpen className="h-4 w-4 text-warning" />
    ) : (
      <Folder className="h-4 w-4 text-warning" />
    );
  }
  if (kind === 'tsx' || kind === 'ts') return <FileCode className="h-4 w-4 text-info" />;
  if (kind === 'md') return <FileText className="h-4 w-4 text-foreground-muted" />;
  if (kind === 'css') return <FileCode className="h-4 w-4 text-success" />;
  return <File className="h-4 w-4 text-foreground-muted" />;
}
