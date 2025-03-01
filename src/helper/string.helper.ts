export class StringHelper {
  static serializedJid(value: string) {
    return value.split(':')[0].split('@')[0];
  }

  static removePortNumber(value: string) {
    return `${value.split(':')[0]}@s.whatsapp.net`;
  }

  static random(length: number) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let result = '';

    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
}
