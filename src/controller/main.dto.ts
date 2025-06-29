import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

class MessageImage {
  @ApiProperty({
    type: String,
    example: 'https://storage.com/image.jpeg',
  })
  url: string;
}

class MessageVideo {
  @ApiProperty({
    type: String,
    example: 'https://storage.com/video.mp4',
  })
  url: string;
}

class MessageAudio {
  @ApiProperty({
    type: String,
    example: 'https://storage.com/audio.mp3',
  })
  url: string;
}

class MessageDocument {
  @ApiProperty({
    type: String,
    example: 'https://storage.com/file.pdf',
  })
  url: string;

  @ApiProperty({ type: String, example: 'file.pdf' })
  name: string;

  @ApiProperty({ type: String, example: 'application/pdf' })
  mimetype: string;
}

class MessageContact {
  @ApiProperty({ type: String, example: 'Azickri' })
  name: string;

  @ApiProperty({ type: String, example: '62895385278590' })
  number: string;
}

class MessageLocation {
  @ApiProperty({ type: String, example: 'Jawa Barat' })
  name: string;

  @ApiProperty({ type: String, example: 'Indonesia, Jawa Barat' })
  address: string;

  @ApiProperty({ type: Number, example: -6.2071602 })
  latitude: number;

  @ApiProperty({ type: Number, example: 106.8494562 })
  longitude: number;
}

enum MessageType {
  text = 'text',
  image = 'image',
  video = 'video',
  audio = 'audio',
  document = 'document',
  contact = 'contact',
  location = 'location',
}

export class BodySendMessage {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, example: '62895385278590@s.whatsapp.net' })
  jid: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'text|image|video|audio|document|contact|location',
  })
  @IsEnum(MessageType, { each: true })
  type: MessageType;

  @ApiProperty({ type: String, required: false, example: 'Hello' })
  text?: string;

  @ApiProperty({ type: MessageImage, required: false })
  image?: MessageImage;

  @ApiProperty({ type: MessageVideo, required: false })
  video?: MessageVideo;

  @ApiProperty({ type: MessageAudio, required: false })
  audio?: MessageAudio;

  @ApiProperty({ type: MessageDocument, required: false })
  document?: MessageDocument;

  @ApiProperty({ type: MessageContact, required: false })
  contact?: MessageContact;

  @ApiProperty({ type: MessageLocation, required: false })
  location?: MessageLocation;
}

export class BodyConnect {
  @ApiProperty({
    type: String,
    example: '73d643e4-721f-473a-b9ad-64ab7a51b407',
  })
  id: string;
}

enum StatusType {
  text = 'text',
  image = 'image',
  video = 'video',
}

class StatusText {
  @ApiProperty({ type: String, example: 'Hello this is status' })
  text: string;

  @ApiProperty({ type: Number, example: 0 })
  font: number;

  @ApiProperty({ type: String, example: '#000000' })
  backgroundColor: string;
}

class StatusImage {
  @ApiProperty({
    type: String,
    example: 'https://storage.com/image.jpeg',
  })
  url: string;

  @ApiProperty({ type: String })
  caption: string;
}

class StatusVideo {
  @ApiProperty({
    type: String,
    example: 'https://storage.com/video.mp4',
  })
  url: string;

  @ApiProperty({ type: String })
  caption: string;
}

export class BodySendStatus {
  @IsNotEmpty()
  @ApiProperty({ type: String })
  @IsEnum(StatusType, { each: true })
  type: StatusType;

  @ApiProperty({ type: StatusText, required: false })
  text?: StatusText;

  @ApiProperty({ type: StatusImage, required: false })
  image?: StatusImage;

  @ApiProperty({ type: StatusVideo, required: false })
  video?: StatusVideo;
}
