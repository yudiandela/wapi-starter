import { Module } from '@nestjs/common';
import { MainController } from './controller/main.controller';
import { MainService } from './service/main/main.service';
import { BaileysService } from './service/baileys/baileys.service';

@Module({
  controllers: [MainController],
  providers: [MainService, BaileysService],
})
export class AppModule {}
