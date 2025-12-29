import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MainController } from './controller/main.controller';
import { AuthController } from './controller/auth.controller';
import { MainService } from './service/main/main.service';
import { BaileysService } from './service/baileys/baileys.service';
import { TypingService } from './service/message/typing.service';
import { MapService } from './service/map/map.service';
import { StorageService } from './service/storage/storage.service';
import { RedisService } from './service/redis/redis.service';
import { FallbackService } from './service/fallback/fallback.service';
import { UploadCleanerService } from './service/upload-cleaner.service';
import { WebsocketService } from './service/websocket/websocket.service';
import { DatabaseService } from './service/database/database.service';
import { AuthService } from './service/auth/auth.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'wapi-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [MainController, AuthController],
  providers: [
    MainService,
    BaileysService,
    WebsocketService,
    TypingService,
    MapService,
    StorageService,
    RedisService,
    FallbackService,
    UploadCleanerService,
    DatabaseService,
    AuthService,
  ],
})
export class AppModule { }
