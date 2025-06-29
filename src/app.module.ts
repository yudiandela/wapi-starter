import { Module } from '@nestjs/common';
import { MainController } from './controller/main.controller';
import { MainService } from './service/main/main.service';
import { BaileysService } from './service/baileys/baileys.service';
import { TypingService } from './service/message/typing.service';
import { MapService } from './service/map/map.service';
import { StorageService } from './service/storage/storage.service';
import { RedisService } from './service/redis/redis.service';

@Module({
  controllers: [MainController],
  providers: [
    MainService,
    BaileysService,
    TypingService,
    MapService,
    StorageService,
    RedisService,
  ],
})
export class AppModule {}
