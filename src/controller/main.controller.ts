import { v4 as uuidv4 } from 'uuid';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MainGuard } from './main.guard';
import { MainService } from 'src/service/main/main.service';
import {
  ResponseConnectSuccess,
  ResponseContactSuccess,
  ResponseDisconnectSuccess,
  ResponseGroupSuccess,
  ResponseQRSuccess,
  ResponseSendMessageSuccess,
  ResponseSendStatusSuccess,
  ResponseSessionNotFound,
  ResponseGetStatusSuccess,
} from './main.response';
import { BodySendMessage, BodySendStatus, BodyConnect } from './main.dto';

@ApiTags('Main Controller')
@Controller()
export class MainController {
  constructor(private mainService: MainService) {}

  @Get('qr')
  @ApiHeader({ name: 'session-id' })
  @UseGuards(MainGuard)
  @ApiNotFoundResponse(ResponseSessionNotFound)
  @ApiOkResponse(ResponseQRSuccess)
  getQr(@Req() { sessionId }: { sessionId: string }) {
    return this.mainService.getQr(sessionId);
  }

  @Get('contact')
  @ApiHeader({ name: 'session-id' })
  @UseGuards(MainGuard)
  @ApiNotFoundResponse(ResponseSessionNotFound)
  @ApiOkResponse(ResponseContactSuccess)
  getContact(@Req() { sessionId }: { sessionId: string }) {
    return this.mainService.getContact(sessionId);
  }

  @Get('group')
  @ApiHeader({ name: 'session-id' })
  @UseGuards(MainGuard)
  @ApiNotFoundResponse(ResponseSessionNotFound)
  @ApiOkResponse(ResponseGroupSuccess)
  getGroup(@Req() { sessionId }: { sessionId: string }) {
    return this.mainService.getGroup(sessionId);
  }

  @Get('message/:id/status')
  @ApiHeader({ name: 'session-id' })
  @UseGuards(MainGuard)
  @ApiNotFoundResponse(ResponseSessionNotFound)
  @ApiOkResponse(ResponseGetStatusSuccess)
  getMessageStatus(@Req() { sessionId }: { sessionId: string }) {
    return this.mainService.get(sessionId);
  }

  @Get('message/fallback')
  @ApiHeader({ name: 'session-id' })
  @UseGuards(MainGuard)
  @ApiNotFoundResponse(ResponseSessionNotFound)
  @ApiOkResponse(ResponseGetStatusSuccess)
  getFallbackMessage(@Req() { sessionId }: { sessionId: string }) {
    return this.mainService.getFallback(sessionId);
  }

  @Post('connect')
  @ApiCreatedResponse(ResponseConnectSuccess)
  connect(@Body() body: BodyConnect) {
    const id = body?.id || uuidv4();
    return this.mainService.connect(id);
  }

  @Post('disconnect')
  @ApiHeader({ name: 'session-id' })
  @UseGuards(MainGuard)
  @ApiNotFoundResponse(ResponseSessionNotFound)
  @ApiCreatedResponse(ResponseDisconnectSuccess)
  disconnect(@Req() { sessionId }: { sessionId: string }) {
    return this.mainService.disconnect(sessionId);
  }

  @Post('message')
  @ApiHeader({ name: 'session-id' })
  @UseGuards(MainGuard)
  @ApiNotFoundResponse(ResponseSessionNotFound)
  @ApiCreatedResponse(ResponseSendMessageSuccess)
  sendMessage(
    @Body() body: BodySendMessage,
    @Req() { sessionId }: { sessionId: string },
  ) {
    return this.mainService.sendMessage(sessionId, body);
  }

  @Post('status')
  @ApiHeader({ name: 'session-id' })
  @UseGuards(MainGuard)
  @ApiNotFoundResponse(ResponseSessionNotFound)
  @ApiCreatedResponse(ResponseSendStatusSuccess)
  sendStatus(
    @Body() body: BodySendStatus,
    @Req() { sessionId }: { sessionId: string },
  ) {
    return this.mainService.sendStatus(sessionId, body);
  }
}
