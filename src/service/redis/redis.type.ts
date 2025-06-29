export type RedisMessageStatus = {
  status: 'pending' | 'sent' | 'failed';
  jid: string;
  text?: string;
  sentAt?: string;
  error?: string;
};
