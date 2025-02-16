import { AnyMessageContent } from '@whiskeysockets/baileys';
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
}
