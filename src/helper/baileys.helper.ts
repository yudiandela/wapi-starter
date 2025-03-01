import * as fs from 'fs';

import {
  AnyMessageContent,
  downloadMediaMessage,
  WAMessage,
} from '@whiskeysockets/baileys';
import { ParamSendMessage, ParamSendStatus } from 'src/service/main/main.type';

export class BaileysHelper {
  static generateProtoSendMessage(param: ParamSendMessage): AnyMessageContent {
    if (param.type == 'image') {
      return {
        image: { url: param.image!.url },
        caption: param.text,
      };
    } else if (param.type == 'video') {
      return {
        video: { url: param.video!.url },
        caption: param.text,
      };
    } else if (param.type == 'audio') {
      return {
        audio: { url: param.audio!.url },
      };
    } else if (param.type == 'document') {
      return {
        document: { url: param.document!.url },
        fileName: param.document!.name,
        mimetype: param.document!.mimetype,
      };
    } else if (param.type == 'contact') {
      return {
        contacts: {
          displayName: param.contact!.name,
          contacts: [
            {
              displayName: param.contact!.name,
              vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${param.contact!.name};;;\nFN:${param.contact!.name}\nTEL;type=CELL;waid=${param.contact!.number}:+${param.contact!.number}\nEND:VCARD`,
            },
          ],
        },
      };
    } else if (param.type == 'location') {
      return {
        location: {
          degreesLatitude: param.location!.latitude,
          degreesLongitude: param.location!.longitude,
          name: param.location!.name,
          address: param.location!.address,
        },
      };
    }

    return { text: param.text! };
  }

  static generateProtoSendStatus(param: ParamSendStatus): AnyMessageContent {
    if (param.type == 'image') {
      return {
        image: { url: param.image!.url },
        caption: param.image!.caption,
      };
    } else if (param.type == 'video') {
      return {
        video: { url: param.video!.url },
        caption: param.video!.caption,
      };
    }

    return { text: param.text!.text };
  }

  static generateExtention(filename: string): string {
    try {
      const split = filename.split('.');
      return split[split.length - 1].toLowerCase();
    } catch {
      return '';
    }
  }

  static parseVCard(vcard: string): string {
    const waidRegex = /waid=(\d+)/;
    const waidMatch = vcard.match(waidRegex);
    if (waidMatch && waidMatch[1]) {
      return waidMatch[1];
    }

    const telRegex = /TEL.*?:([+\d\s-]+)/;
    const telMatch = vcard.match(telRegex);
    if (telMatch && telMatch[1]) {
      return telMatch[1].replace(/\s|-/g, '');
    }

    return '';
  }

  static async saveFile(
    waMessage: WAMessage,
  ): Promise<{ path: string; name: string }> {
    const message = waMessage.message!;

    let extention = '';

    if (message.imageMessage) {
      extention = 'jpg';
    } else if (message.stickerMessage) {
      extention = 'jpg';
    } else if (message.videoMessage) {
      extention = 'mp4';
    } else if (message.audioMessage) {
      extention = 'mp3';
    } else if (message.documentMessage) {
      extention = this.generateExtention(message.documentMessage.fileName!);
    } else if (message.documentWithCaptionMessage) {
      const doc = message.documentWithCaptionMessage.message!;
      extention = this.generateExtention(doc.documentMessage!.fileName!);
    }

    const filename = `${waMessage.key.id}.${extention}`;
    const filepath = `media/${filename}`;

    const filestream = fs.createWriteStream(filepath);

    try {
      const stream = await downloadMediaMessage(waMessage, 'stream', {});
      return new Promise((resolve) => {
        stream
          .pipe(filestream)
          .on('finish', () => resolve({ name: filename, path: filepath }))
          .on('error', () => resolve({ name: '', path: '' }));
      });
    } catch {
      fs.unlink(filepath, (err) => err);
      return { name: '', path: '' };
    }
  }

  static async saveThumbnail(
    id: string,
    data: Uint8Array,
  ): Promise<{ path: string; name: string }> {
    const filename = `${id}_THUMBNAIL.jpg`;
    const filepath = `media/${filename}`;

    try {
      await fs.promises.writeFile(filepath, Buffer.from(data));
      return { name: filename, path: filepath };
    } catch {
      fs.unlink(filepath, (err) => err);
      return { name: '', path: '' };
    }
  }
}
