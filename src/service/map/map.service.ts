import { Injectable } from '@nestjs/common';
import { Session } from '../baileys/baileys.type';
import { proto, WAMessage } from '@whiskeysockets/baileys';
import {
  Chat,
  ChatLastMessage,
  Message,
  MessageQuoted,
  MessageStatus,
  MessageType,
} from './map.type';
import { StringHelper } from 'src/helper/string.helper';
import { BaileysHelper } from 'src/helper/baileys.helper';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class MapService {
  constructor(private storageService: StorageService) {}

  async generateChat(session: Session, waMessage: WAMessage): Promise<Chat> {
    const lastMessage = this.generateLastMessage(session, waMessage);
    const chat: Chat = {
      id: StringHelper.random(20),
      isGroup: false,
      sender: { jid: waMessage.key.remoteJid || '', name: '', picture: '' },
      lastMessage,
    };

    try {
      const picture = await session.socket.profilePictureUrl(chat.sender.jid);
      chat.sender.picture = picture || '';
    } catch {
      // Do somethink when error...
    }

    if (chat.sender.jid.match('g.us')) {
      const group = await session.socket.groupMetadata(chat.sender.jid);
      chat.sender.name = group.subject || 'WhatsApp Group';
      chat.isGroup = true;
    } else {
      const contact = session.store.contacts[chat.sender.jid];
      chat.sender.name = StringHelper.serializedJid(chat.sender.jid);

      if (contact) {
        chat.sender.name =
          contact.name ||
          contact.verifiedName ||
          contact.notify ||
          waMessage.pushName ||
          StringHelper.serializedJid(chat.sender.jid);
      }
    }

    return chat;
  }

  async generateMessage(
    session: Session,
    waMessage: WAMessage,
  ): Promise<Message> {
    const message: Message = {
      chatId: '',
      messageId: waMessage.key.id || '',
      sender: {
        jid: waMessage.key.remoteJid || '',
        name: waMessage.pushName || '',
        picture: '',
      },
      type: MessageType.text,
      status: MessageStatus.unread,
      isFromMe: Boolean(waMessage.key.fromMe),
      text: '[UNHANDLED MESSAGE]',
      sendAt: new Date(Number(waMessage.messageTimestamp) * 1000),
    };

    const current = waMessage.message;
    if (current?.conversation) {
      message.type = MessageType.text;
      message.text = current.conversation;
    } else if (current?.extendedTextMessage) {
      message.type = MessageType.text;
      message.text = current.extendedTextMessage.text || '';

      const context = current.extendedTextMessage.contextInfo;
      if (context) {
        if (context.isForwarded) message.isForwarded = true;
        message.quoted = await this.generateQuoted(context!, session);
      }
    } else if (current?.imageMessage) {
      message.type = MessageType.image;
      message.text = current.imageMessage?.caption || '';
      message.image = {
        url: '',
        thumbnail: '',
        mimetype: current.imageMessage.mimetype || '',
      };

      const [file, fileThumbnail] = await Promise.all([
        BaileysHelper.saveFile(waMessage),
        BaileysHelper.saveThumbnail(
          message.messageId,
          current.imageMessage.jpegThumbnail!,
        ),
      ]);

      const [url, thumbnail] = await Promise.all([
        this.storageService.upload({
          name: file.name,
          path: file.path,
          mimetype: message.image.mimetype,
        }),
        this.storageService.upload({
          name: fileThumbnail.name,
          path: fileThumbnail.path,
          mimetype: 'image/jpeg',
        }),
      ]);

      message.image.url = url || '';
      message.image.thumbnail = thumbnail || '';

      const context = current.imageMessage.contextInfo;
      if (context) {
        if (context.isForwarded) message.isForwarded = true;
        message.quoted = await this.generateQuoted(context!, session);
      }
    } else if (current?.stickerMessage) {
      message.type = MessageType.sticker;
      message.text = '';
      message.sticker = {
        url: '',
        mimetype: current.stickerMessage.mimetype || '',
      };

      const file = await BaileysHelper.saveFile(waMessage);
      const url = await this.storageService.upload({
        name: file.name,
        path: file.path,
        mimetype: message.sticker.mimetype,
      });

      message.sticker.url = url || '';

      const context = current.stickerMessage.contextInfo;
      if (context) {
        if (context.isForwarded) message.isForwarded = true;
        message.quoted = await this.generateQuoted(context!, session);
      }
    } else if (current?.videoMessage) {
      message.type = MessageType.video;
      message.text = current.videoMessage.caption || '';
      message.video = {
        url: '',
        thumbnail: '',
        duration: current.videoMessage.seconds || 0,
        mimetype: current.videoMessage.mimetype || '',
      };

      const [file, fileThumbnail] = await Promise.all([
        BaileysHelper.saveFile(waMessage),
        BaileysHelper.saveThumbnail(
          message.messageId,
          current.videoMessage.jpegThumbnail!,
        ),
      ]);

      const [url, thumbnail] = await Promise.all([
        this.storageService.upload({
          name: file.name,
          path: file.path,
          mimetype: message.video.mimetype,
        }),
        this.storageService.upload({
          name: fileThumbnail.name,
          path: fileThumbnail.path,
          mimetype: 'image/jpeg',
        }),
      ]);

      message.video.url = url || '';
      message.video.thumbnail = thumbnail || '';

      const context = current.videoMessage.contextInfo;
      if (context) {
        if (context.isForwarded) message.isForwarded = true;
        message.quoted = await this.generateQuoted(context!, session);
      }
    } else if (current?.audioMessage) {
      message.type = MessageType.audio;
      message.text = '';
      message.audio = {
        url: '',
        duration: current.audioMessage.seconds || 0,
        mimetype: current.audioMessage.mimetype || '',
      };

      const file = await BaileysHelper.saveFile(waMessage);
      const url = await this.storageService.upload({
        name: file.name,
        path: file.path,
        mimetype: message.audio.mimetype,
      });

      message.audio.url = url || '';

      const context = current.audioMessage.contextInfo;
      if (context) {
        if (context.isForwarded) message.isForwarded = true;
        message.quoted = await this.generateQuoted(context!, session);
      }
    } else if (current?.documentMessage) {
      message.type = MessageType.document;
      message.text = current.documentMessage.caption || '';
      message.document = {
        url: '',
        name: current.documentMessage.fileName || '',
        size: Math.round(Number(current.documentMessage.fileLength) / 1000),
        mimetype: current.documentMessage.mimetype || '',
      };

      const file = await BaileysHelper.saveFile(waMessage);
      const url = await this.storageService.upload({
        name: file.name,
        path: file.path,
        mimetype: message.document.mimetype,
      });

      message.document.url = url || '';

      const context = current.documentMessage.contextInfo;
      if (context) {
        if (context.isForwarded) message.isForwarded = true;
        message.quoted = await this.generateQuoted(context!, session);
      }
    } else if (current?.documentWithCaptionMessage) {
      const doc = current.documentWithCaptionMessage.message!.documentMessage!;

      message.type = MessageType.document;
      message.text = doc?.caption || '';
      message.document = {
        url: '',
        name: doc.fileName || '',
        size: Math.round(Number(doc.fileLength) / 1000),
        mimetype: doc.mimetype || '',
      };

      const file = await BaileysHelper.saveFile(waMessage);
      const url = await this.storageService.upload({
        name: file.name,
        path: file.path,
        mimetype: message.document.mimetype,
      });

      message.document.url = url || '';

      const context = doc.contextInfo;
      if (context) {
        if (context.isForwarded) message.isForwarded = true;
        message.quoted = await this.generateQuoted(context!, session);
      }
    } else if (current?.locationMessage) {
      message.type = MessageType.location;
      message.text = '';
      message.location = {
        name: current.locationMessage.name || '',
        address: current.locationMessage.address || '',
        latitude: current.locationMessage.degreesLatitude || 0,
        longitude: current.locationMessage.degreesLongitude || 0,
        thumbnail: '',
      };

      const file = await BaileysHelper.saveThumbnail(
        message.messageId,
        current.locationMessage.jpegThumbnail!,
      );
      const url = await this.storageService.upload({
        name: file.name,
        path: file.path,
        mimetype: 'image/jpeg',
      });

      message.location.thumbnail = url || '';

      const context = current.locationMessage.contextInfo;
      if (context) {
        if (context.isForwarded) message.isForwarded = true;
        message.quoted = await this.generateQuoted(context!, session);
      }
    } else if (current?.contactMessage) {
      const phone = BaileysHelper.parseVCard(
        current.contactMessage.vcard || '',
      );

      message.type = MessageType.contact;
      message.text = '';
      message.contact = {
        name: current.contactMessage.displayName || '',
        phone: phone,
        picture: '',
      };

      if (phone) {
        try {
          const jid = `${phone}@s.whatsapp.net`;
          const picture = await session.socket.profilePictureUrl(jid, 'image');
          message.contact.picture = picture || '';
        } catch {
          //
        }
      }

      const context = current.contactMessage.contextInfo;
      if (context) {
        if (context.isForwarded) message.isForwarded = true;
        message.quoted = await this.generateQuoted(context!, session);
      }
    }

    return message;
  }

  private async generateQuoted(context: proto.IContextInfo, session: Session) {
    if (!context.quotedMessage) return;

    const quoted: MessageQuoted = {
      isFromMe: false,
      type: undefined,
      sender: {
        jid: context.participant || '',
        name: StringHelper.serializedJid(context.participant || ''),
        picture: '',
      },
      messageId: context.stanzaId || '',
      text: '',
    };

    const contact = session.store.contacts[quoted.sender.jid];
    if (contact) {
      quoted.sender.name =
        contact.name ||
        contact.verifiedName ||
        contact.notify ||
        StringHelper.serializedJid(quoted.sender.jid);
    }

    const jid = StringHelper.removePortNumber(session.socket.user?.id || '');
    if (jid == quoted.sender.jid) {
      quoted.isFromMe = true;
      quoted.sender.jid = jid;
      quoted.sender.name =
        session.socket.user?.name ||
        session.socket.user?.notify ||
        StringHelper.serializedJid(session.socket.user?.id || '');
    }

    const message = context.quotedMessage!;
    if (message.conversation) {
      quoted.type = MessageType.text;
      quoted.text = message.conversation || '';
    } else if (message.extendedTextMessage) {
      quoted.type = MessageType.text;
      quoted.text = message.extendedTextMessage.text || '';
    } else if (message.imageMessage) {
      quoted.type = MessageType.image;
      quoted.text = message.imageMessage.caption || '';
      quoted.image = {
        url: '',
        thumbnail: '',
        mimetype: message.imageMessage.mimetype || '',
      };

      const file = await BaileysHelper.saveThumbnail(
        quoted.messageId,
        message.imageMessage.jpegThumbnail!,
      );
      const url = await this.storageService.upload({
        name: file.name,
        path: file.path,
        mimetype: 'image/jpeg',
      });

      quoted.image.thumbnail = url || '';
    } else if (message.stickerMessage) {
      quoted.type = MessageType.sticker;
      quoted.text = '';
      quoted.sticker = {
        url: '',
        mimetype: message.stickerMessage.mimetype || '',
      };

      const file = await BaileysHelper.saveFile({
        key: {
          id: context.stanzaId,
          remoteJid: context.participant,
          fromMe: false,
        },
        message,
      });
      const url = await this.storageService.upload({
        name: file.name,
        path: file.path,
        mimetype: quoted.sticker.mimetype,
      });

      quoted.sticker.url = url || '';
    } else if (message.videoMessage) {
      quoted.type = MessageType.video;
      quoted.text = message.videoMessage.caption || '';
      quoted.video = {
        url: '',
        thumbnail: '',
        duration: message.videoMessage.seconds || 0,
        mimetype: message.videoMessage.mimetype || '',
      };

      const file = await BaileysHelper.saveThumbnail(
        quoted.messageId,
        message.videoMessage.jpegThumbnail!,
      );
      const url = await this.storageService.upload({
        name: file.name,
        path: file.path,
        mimetype: 'image/jpeg',
      });

      quoted.video.thumbnail = url || '';
    } else if (message.audioMessage) {
      quoted.type = MessageType.audio;
      quoted.text = '';
      quoted.audio = {
        url: '',
        duration: message.audioMessage.seconds || 0,
        mimetype: message.audioMessage.mimetype || '',
      };
    } else if (message.documentMessage) {
      quoted.type = MessageType.document;
      quoted.text = message.documentMessage.caption || '';
      quoted.document = {
        url: '',
        name: message.documentMessage.fileName || '',
        size: Number(message.documentMessage.fileLength) / 1000,
        mimetype: message.documentMessage.mimetype || '',
      };
    } else if (message.locationMessage) {
      quoted.type = MessageType.location;
      quoted.text = '';
      quoted.location = {
        name: message.locationMessage.name || '',
        address: message.locationMessage.address || '',
        latitude: message.locationMessage.degreesLatitude || 0,
        longitude: message.locationMessage.degreesLongitude || 0,
        thumbnail: '',
      };

      const file = await BaileysHelper.saveThumbnail(
        quoted.messageId,
        message.locationMessage.jpegThumbnail!,
      );
      const url = await this.storageService.upload({
        name: file.name,
        path: file.path,
        mimetype: 'image/jpeg',
      });

      quoted.location.thumbnail = url || '';
    } else if (message.contactMessage) {
      const phone = BaileysHelper.parseVCard(
        message.contactMessage.vcard || '',
      );

      quoted.type = MessageType.contact;
      quoted.text = '';
      quoted.contact = {
        name: message.contactMessage.displayName!,
        phone,
        picture: '',
      };

      if (phone) {
        try {
          const jid = `${phone}@s.whatsapp.net`;
          const picture = await session.socket.profilePictureUrl(jid, 'image');
          quoted.contact.picture = picture || '';
        } catch {
          //
        }
      }
    }

    if (quoted.type) return quoted;
  }

  private generateLastMessage(session: Session, waMessage: WAMessage) {
    const lastMessage: ChatLastMessage = {
      sender: {
        jid: waMessage.key.participant || waMessage.key.remoteJid || '',
        name: waMessage.pushName || '',
        picture: '',
      },
      isFromMe: Boolean(waMessage.key.fromMe),
      messageId: waMessage.key.id || '',
      type: MessageType.text,
      status: MessageStatus.unread,
      text: '',
      sendAt: new Date(Number(waMessage.messageTimestamp) * 1000),
    };

    const contact = session.store.contacts[lastMessage.sender.jid];
    if (contact) {
      lastMessage.sender.name =
        contact.name ||
        contact.verifiedName ||
        contact.notify ||
        waMessage.pushName ||
        StringHelper.serializedJid(lastMessage.sender.jid);
    }

    const message = waMessage.message!;
    if (message.conversation) {
      lastMessage.text = message.conversation;
    } else if (message.extendedTextMessage) {
      lastMessage.text = message.extendedTextMessage.text || '';
    } else if (message.imageMessage) {
      lastMessage.type = MessageType.image;
      lastMessage.text = message.imageMessage.caption || '';
    } else if (message.stickerMessage) {
      lastMessage.type = MessageType.sticker;
      lastMessage.text = '';
    } else if (message.videoMessage) {
      lastMessage.type = MessageType.video;
      lastMessage.text = message.videoMessage.caption || '';
    } else if (message.documentMessage) {
      lastMessage.type = MessageType.document;
      lastMessage.text = message.documentMessage.caption || '';
    } else if (message.documentWithCaptionMessage) {
      const document = message.documentWithCaptionMessage.message;
      lastMessage.type = MessageType.document;
      lastMessage.text = document?.documentMessage?.caption || '';
    } else if (message.locationMessage) {
      lastMessage.type = MessageType.location;
      lastMessage.text = '';
    } else if (message.contactMessage) {
      lastMessage.type = MessageType.contact;
      lastMessage.text = '';
    }

    return lastMessage;
  }
}
