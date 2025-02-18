import * as fs from 'fs';
import * as qrcode from 'qrcode';
import pino from 'pino';

import { Injectable } from '@nestjs/common';
import { Boom } from '@hapi/boom';
import { Contact, Group, GroupMember, Session } from './baileys.type';
import Socket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { StringHelper } from 'src/helper/string.helper';
import { ParamSendMessage, ParamSendStatus } from '../main/main.type';
import { BaileysHelper } from 'src/helper/baileys.helper';

let sessions: Session[] = [];

@Injectable()
export class BaileysService {
  init() {
    const folders = fs.readdirSync('sessions');
    folders.forEach((id) => void this.connect(id));
  }

  async connect(id: string) {
    const path = {
      session: `sessions/${id}`,
      store: `stores/${id}.json`,
    };

    const session = sessions.find((item) => item.id == id);
    if (session && !session.isConnected) return;

    const auth = await useMultiFileAuthState(path.session);
    const socket = Socket({
      browser: Browsers.windows('Desktop'),
      auth: auth.state,
      version: (await fetchLatestBaileysVersion()).version,
      logger: pino({ level: 'error' }),
      syncFullHistory: true,
    });

    const store = makeInMemoryStore({ socket });
    store.readFromFile(path.store);
    store.bind(socket.ev);

    const interval = setInterval(() => store.writeToFile(path.store), 10_000);
    const attempQr = { current: 0, max: 6, isNeedStop: false };

    sessions.push({
      id,
      socket,
      store,
      isConnected: false,
      interval,
    });

    socket.ev.on('creds.update', auth.saveCreds);
    socket.ev.on('connection.update', async (value) => {
      const { qr, connection, lastDisconnect } = value;

      if (qr) {
        attempQr.current += 1;
        if (attempQr.current == attempQr.max) {
          attempQr.isNeedStop = true;
          await this.disconnect(id);
        } else {
          const base64: string = await qrcode.toDataURL(qr);
          const index = sessions.findIndex((session) => session.id == id);
          sessions[index].qrcode = base64;
        }
      }

      if (connection == 'close') {
        const errorCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = errorCode != DisconnectReason.loggedOut;

        clearInterval(interval);
        sessions = sessions.filter((session) => session.id != id);

        if (shouldReconnect && !attempQr.isNeedStop) {
          await this.connect(id);
        }
      } else if (connection == 'open') {
        const index = sessions.findIndex((session) => session.id == id);
        sessions[index].isConnected = true;
        sessions[index].qrcode = undefined;

        attempQr.current = 0;
        attempQr.isNeedStop = false;
      }
    });

    socket.ev.on('messages.upsert', (value) => {
      console.log('event messages.upsert', value);
      // Handle incoming message here...
    });

    socket.ev.on('messages.update', (value) => {
      console.log('event messages.update', value);
      // Handle status update message here...
    });
  }

  async disconnect(id: string) {
    const session = sessions.find((session) => session.id == id);
    if (!session) return;

    const path = {
      session: `sessions/${id}`,
      store: `stores/${id}.json`,
    };

    clearInterval(session.interval);
    sessions = sessions.filter((session) => session.id != id);

    if (fs.existsSync(path.session)) {
      fs.rmSync(path.session, { recursive: true, force: true });
    }

    if (fs.existsSync(path.store)) {
      fs.rmSync(path.store);
    }

    try {
      await session.socket?.logout();
    } catch {
      // Handle error logout here..
    }
  }

  getSession(id: string) {
    return sessions.find((session) => session.id == id);
  }

  getQr(id: string) {
    const session = sessions.find((session) => session.id == id);
    return session?.qrcode || null;
  }

  getContact(id: string) {
    const session = sessions.find((session) => session.id == id);
    if (!session) {
      return { contacts: [] };
    }

    const contacts: Contact[] = [];

    for (const jid in session.store.contacts) {
      const contact = session.store.contacts[jid];
      const number = StringHelper.serializedJid(jid);
      const name = contact.name || contact.notify || number;

      contacts.push({ jid, name, number });
    }

    return { contacts };
  }

  async getGroup(id: string) {
    const session = sessions.find((session) => session.id == id);
    if (!session) {
      return { groups: [] };
    }

    const docs = await session.socket.groupFetchAllParticipating();
    const groups: Group[] = [];

    for (const jid in docs) {
      const group = docs[jid];

      const members: GroupMember[] = [];
      for (const member of group.participants) {
        const contact = session.store.contacts[member.id];
        const number = StringHelper.serializedJid(member.id);

        members.push({
          jid: member.id,
          name: contact.name || contact.notify || number,
          number,
          isAdmin: Boolean(member.admin),
        });
      }

      const owner = session.store.contacts[group.owner!];
      const ownerNumber = StringHelper.serializedJid(group.owner!);
      const ownerName = owner.name || owner.notify || ownerNumber;

      groups.push({
        jid,
        name: group.subject,
        description: group.desc || '',
        owner: ownerName,
        members,
        size: group.size || 0,
      });
    }

    return { groups };
  }

  async sendMessage(id: string, param: ParamSendMessage) {
    const session = sessions.find((session) => session.id == id);
    if (!session) {
      return { messageId: '' };
    }

    const proto = BaileysHelper.generateProtoSendMessage(param);
    const send = await session.socket.sendMessage(param.jid, proto);

    return { messageId: send?.key?.id || '' };
  }

  async sendStatus(id: string, param: ParamSendStatus) {
    const session = sessions.find((session) => session.id == id);
    if (!session) {
      return { statusId: '' };
    }

    const statusJidList = Object.values(session.store.contacts)
      .map((value) => value.id)
      .filter((id) => id.match('s.whatsapp.net'));

    const proto = BaileysHelper.generateProtoSendStatus(param);
    const send = await session.socket.sendMessage('status@broadcast', proto, {
      timestamp: new Date(),
      font: param.text?.font || 0,
      backgroundColor: param.text?.backgroundColor || '#000000',
      broadcast: true,
      statusJidList,
    });

    return { statusId: send?.key?.id || '' };
  }
}
