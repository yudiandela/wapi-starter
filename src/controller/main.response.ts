import { ApiResponseNoStatusOptions } from '@nestjs/swagger';

export const ResponseCheckSuccess: ApiResponseNoStatusOptions = {
  example: {
    message: 'Healthy!',
    response_time: '0.02ms',
    redis: 'connected',
  },
  description: 'Health check result',
};

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

export const ResponseGetStatusSuccess: ApiResponseNoStatusOptions = {
  example: {
    status: 'sent',
    jid: '62895385278590@s.whatsapp.net',
    text: 'Hello',
    sentAt: '2025-06-29T14:16:33.046Z',
  },
  description: 'Returns the status of the message sent.',
};

export const ResponseGetFallbackSuccess: ApiResponseNoStatusOptions = {
  example: {
    fallbacks: [
      {
        file: 'wapi_msg_1751218511893-b3e1mb-1751218511894.json',
        sizeKb: 0,
        createdAt: '2025-06-29T17:35:11.895Z',
      },
    ],
  },
  description: 'Returns the fallback list of the message sent.',
};
