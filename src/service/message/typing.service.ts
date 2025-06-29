import { Injectable } from '@nestjs/common';
import { ParamTyping } from './typing.type';

@Injectable()
export class TypingService {
  static async simulateTyping(
    socket: any,
    param: ParamTyping,
    options?: {
      enable?: boolean;
      baseSpeed?: number; // huruf per detik
      simulateReadDelay?: boolean;
    },
  ) {
    const config = {
      enable: true,
      baseSpeed: 6,
      simulateReadDelay: true,
      ...(options || {}),
    };

    if (!config.enable) return;

    const messageLength = param.text ? param.text.length : 0;
    const randomnessFactor = Math.random() * 0.4 + 0.8; // 0.8 - 1.2
    const estimatedTypingTime = Math.ceil(
      (messageLength / config.baseSpeed) * 1000 * randomnessFactor,
    );

    if (config.simulateReadDelay) {
      const readDelay = Math.floor(Math.random() * 1000) + 500; // 500–1500ms
      await new Promise((r) => setTimeout(r, readDelay));
    }

    await socket.sendPresenceUpdate('composing', param.jid);
    await new Promise((r) => setTimeout(r, estimatedTypingTime));
    await socket.sendPresenceUpdate('paused', param.jid);
  }
}
