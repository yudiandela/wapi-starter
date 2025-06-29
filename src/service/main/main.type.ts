export type ParamSendMessage = {
  jid: string;
  type: string;
  text?: string;
  image?: { url: string };
  video?: { url: string };
  audio?: { url: string };
  document?: { url: string; name: string; mimetype: string };
  contact?: { name: string; number: string };
  location?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  typing?: boolean;
};

export type ParamSendStatus = {
  type: string;
  text?: {
    text: string;
    font: number;
    backgroundColor: string;
  };
  image?: { url: string; caption: string };
  video?: { url: string; caption: string };
};
