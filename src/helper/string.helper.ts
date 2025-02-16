export class StringHelper {
  static serializedJid(value: string) {
    return value.split(':')[0].split('@')[0];
  }
}
