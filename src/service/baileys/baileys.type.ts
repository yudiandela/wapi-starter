import { WASocket, type makeInMemoryStore } from '@whiskeysockets/baileys';

export type Session = {
  id: string;
  socket: WASocket;
  store: ReturnType<typeof makeInMemoryStore>;
  qrcode?: string;
  isConnected: boolean;
  interval: NodeJS.Timeout | undefined;
};

export type Contact = {
  jid: string;
  name: string;
  number: string;
};

export type GroupMember = {
  jid: string;
  name: string;
  number: string;
  isAdmin: boolean;
};

export type Group = {
  jid: string;
  name: string;
  description: string;
  owner: string;
  members: GroupMember[];
  size: number;
};
