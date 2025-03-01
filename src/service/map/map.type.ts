export enum MessageType {
  text = 'text',
  image = 'image',
  sticker = 'sticker',
  video = 'video',
  audio = 'audio',
  document = 'document',
  location = 'location',
  contact = 'contact',
}

export enum MessageStatus {
  sent = 'sent',
  unread = 'unread',
  read = 'read',
}

type MessageImage = {
  url: string;
  thumbnail: string;
  mimetype: string;
};

type MessageSticker = {
  url: string;
  mimetype: string;
};

type MessageVideo = {
  url: string;
  thumbnail: string;
  duration: number;
  mimetype: string;
};

type MessageAudio = {
  url: string;
  duration: number;
  mimetype: string;
};

type MessageDocument = {
  url: string;
  name: string;
  size: number;
  mimetype: string;
};

type MessageLocation = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  thumbnail: string;
};

type MessageContact = {
  name: string;
  phone: string;
  picture: string;
};

export type MessageQuoted = {
  isFromMe: boolean;
  type: MessageType | undefined;
  sender: Sender;
  messageId: string;
  text: string;
  image?: MessageImage;
  sticker?: MessageSticker;
  video?: MessageVideo;
  audio?: MessageAudio;
  document?: MessageDocument;
  location?: MessageLocation;
  contact?: MessageContact;
};

type Sender = {
  jid: string;
  name: string;
  picture: string;
};

export type ChatLastMessage = {
  sender: Sender;
  isFromMe: boolean;
  messageId: string;
  type: MessageType;
  status: MessageStatus;
  text: string;
  sendAt: Date;
};

export type Chat = {
  id: string;
  isGroup: boolean;
  sender: Sender;
  lastMessage: ChatLastMessage;
};

export type Message = {
  chatId: string;
  messageId: string;
  sender: Sender;
  type: MessageType;
  status: MessageStatus;
  isFromMe: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  isForwarded?: boolean;
  text: string;
  image?: MessageImage;
  sticker?: MessageSticker;
  video?: MessageVideo;
  audio?: MessageAudio;
  document?: MessageDocument;
  location?: MessageLocation;
  contact?: MessageContact;
  quoted?: MessageQuoted;
  sendAt: Date;
};
