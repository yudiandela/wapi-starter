import { Module } from '@nestjs/common';
import { MainController } from './controller/main.controller';
import { MainService } from './service/main/main.service';
import { BaileysService } from './service/baileys/baileys.service';
import { TypingService } from './service/message/typing.service';
import { MapService } from './service/map/map.service';
import { StorageService } from './service/storage/storage.service';
import { RedisService } from './service/redis/redis.service';
import { FallbackService } from './service/fallback/fallback.service';
import { UploadCleanerService } from './service/upload-cleaner.service';
import { WebsocketService } from './service/websocket/websocket.service';

@Module({
  controllers: [MainController],
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
  ],
})
export class AppModule {}
