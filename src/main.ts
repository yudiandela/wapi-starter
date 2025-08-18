import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { BaileysService } from './service/baileys/baileys.service';
import { WebsocketService } from './service/websocket/websocket.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'warn', 'error', 'debug'],
  });

  // Create required directories
  const requiredDirs = ['sessions', 'stores', 'media'];
  requiredDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  // Initialize Bailey service with WebSocket support
  const baileysService = app.get(BaileysService);
  baileysService.init();

  const websocketService = app.get(WebsocketService);
  websocketService.init();

  if (process.env.INIT_SWAGGER == 'true') {
    const config = new DocumentBuilder()
      .setTitle(process.env.APP_NAME || 'WAPI - Web API Starter')
      .setDescription(
        'WAPI is a WhatsApp API template that uses the @whiskeysockets/baileys package to be used as a Base API. This repository can be further developed by other developers for more customizable functions. The Base Repository currently uses NestJS for API and Swagger for Open API. Dont forget to visit http://github.com/azickri. Ciauuu ✨✨✨',
      )
      .setVersion('1.0')
      .build();

    const document = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('documentation', app, document, {
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
      },
    });
  }

  app.enableCors();
  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('urlencoded', { limit: '10mb', extended: true });
  app.useGlobalPipes(new ValidationPipe());
  app.use((req: Request, response: Response, next: NextFunction) => {
    console.log(new Date(), '', req.method, '', req.path, '', response);
    next();
  });

  const port = process.env.APP_PORT || 3000;
  const wsPort = process.env.WS_PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Application Server running on http://localhost:${port}`);
  console.log(`🔌 WebSocket Server running on ws://localhost:${wsPort}`);
}

void bootstrap();
