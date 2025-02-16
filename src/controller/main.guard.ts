import * as fs from 'fs';

import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { BaileysService } from 'src/service/baileys/baileys.service';

@Injectable()
export class MainGuard implements CanActivate {
  constructor(private baileysService: BaileysService) {}

  canActivate(context: ExecutionContext): boolean {
    const { headers } = context.switchToHttp().getRequest<Request>();
    const sessionId = String(headers['session-id']);

    const folderExists = fs.existsSync(`sessions/${sessionId}`);
    if (!folderExists) {
      throw new HttpException(
        {
          statusCode: 404,
          message: 'session folder not found, please connect again',
        },
        404,
      );
    }

    const sessionExists = this.baileysService.getSession(sessionId);
    if (!sessionExists) {
      throw new HttpException(
        {
          statusCode: 404,
          message: 'session variable not found, please connect again',
        },
        404,
      );
    }

    context.switchToHttp().getRequest().sessionId = sessionId;
    return true;
  }
}
