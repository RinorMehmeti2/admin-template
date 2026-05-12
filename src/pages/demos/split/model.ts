export interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body: string;
  unread: boolean;
  starred: boolean;
  receivedAt: string;
}
