import { ApiResponseNoStatusOptions } from '@nestjs/swagger';

export const ResponseSessionNotFound: ApiResponseNoStatusOptions = {
  example: {
    statusCode: 404,
    message: 'session ${folder|variable} not found, please connect again',
  },
  description:
    'This error usually appears because the session folder or variable does not exist.',
};

export const ResponseQRSuccess: ApiResponseNoStatusOptions = {
  example: {
    qrcode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARQAAAEUCAYAAAD...',
  },
  description:
    'Base64 QRCode string that can be converted into Image form to connect WhatsApp',
};

export const ResponseContactSuccess: ApiResponseNoStatusOptions = {
  example: {
    contacts: [
      {
        jid: '62895385278590@s.whatsapp.net',
        name: 'Azickri',
        number: '62895385278590',
      },
    ],
  },
  description:
    'The results of store.contacts that have been adjusted or remapped according to needs.',
};

export const ResponseGroupSuccess: ApiResponseNoStatusOptions = {
  example: {
    groups: [
      {
        jid: '120363397732576749@g.us',
        name: 'GGWP',
        description: 'This is description okay?',
        owner: 'Shika',
        members: [
          {
            jid: '62895385278590@s.whatsapp.net',
            name: 'Azickri',
            number: '62895385278590',
            isAdmin: false,
          },
        ],
        size: 1,
      },
    ],
  },
  description:
    'The result of socket.groupFetchAllParticipating has been adjusted or remapped according to needs.',
};

export const ResponseConnectSuccess: ApiResponseNoStatusOptions = {
  example: {
    id: 'fc053a68-2d03-419f-91b8-d97c204c5496',
  },
  description: 'Generates a ID for other APIs as a Session ID Header.',
};

export const ResponseDisconnectSuccess: ApiResponseNoStatusOptions = {
  description: 'Return of Promise with void response',
};

export const ResponseSendMessageSuccess: ApiResponseNoStatusOptions = {
  example: {
    messageId: '7B6F2DE16C1AF17D58C5B',
  },
  description:
    'Generate MessageID from WhatsApp as a sign that the message was successfully sent.',
};

export const ResponseSendStatusSuccess: ApiResponseNoStatusOptions = {
  example: {
    statusId: '3EB036B94F146A72BCF081',
  },
  description:
    'Generate StatusID from WhatsApp as a sign that the status was successfully sent.',
};
