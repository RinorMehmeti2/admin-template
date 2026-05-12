export interface LogEntry {
  id: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  tags: ReadonlyArray<string>;
  createdAt: Date;
}
