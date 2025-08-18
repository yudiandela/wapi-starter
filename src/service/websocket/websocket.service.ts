import * as WebSocket from 'ws';
import { Injectable } from '@nestjs/common';

import { BaileysService } from '../baileys/baileys.service';

let wsServer: WebSocket.Server;
const wsClients: Set<WebSocket> = new Set();

@Injectable()
export class WebsocketService {
  constructor(private baileysService: BaileysService) {}

  init() {
    this.initWebSocketServer();
  }

  private initWebSocketServer() {
    const wsPort = process.env.WS_PORT || 3001;
    wsServer = new WebSocket.Server({ port: Number(wsPort) });

    wsServer.on('connection', (ws: WebSocket) => {
      console.log('🔗 New WebSocket client connected');
      wsClients.add(ws);

      // Send initial status
      this.sendToClient(ws, {
        type: 'connection-status',
        status: 'connected',
      });

      ws.on('message', async (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('📨 WebSocket Received:', message);

          await this.handleWebSocketMessage(ws, message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          this.sendToClient(ws, {
            type: 'error',
            message: 'Invalid JSON format',
          });
        }
      });

      ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
        wsClients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        wsClients.delete(ws);
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async handleWebSocketMessage(ws: WebSocket, message: any) {
    const { type, sessionId } = message;

    switch (type) {
      case 'ping':
        this.sendToClient(ws, {
          type: 'ping',
          message: 'Pong',
          timestamp: Date.now(),
        });
        break;

      case 'connect':
        await this.baileysService.connect(sessionId);
        this.sendToClient(ws, {
          type: 'connect',
          message: 'Connected',
          timestamp: Date.now(),
        });
        break;

      case 'get-qr':
        if (sessionId) {
          setInterval(() => {
            const data = this.baileysService.getQr(sessionId);
            this.sendToClient(ws, {
              type: 'get-qr',
              timestamp: Date.now(),
              data: data || null,
            });
          }, 5000);
        }
        break;

      default:
        this.sendToClient(ws, {
          type: 'error',
          message: 'Unknown command type',
        });
    }
  }

  private sendToClient(ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  private broadcastToClients(data: any) {
    wsClients.forEach((client) => {
      this.sendToClient(client, data);
    });
  }

  // Method untuk mengirim data ke WebSocket client tertentu
  sendToSpecificClient(clientId: string, data: any) {
    // Implement client identification logic if needed
    this.broadcastToClients(data);
  }

  // Method untuk mendapatkan statistik WebSocket
  getWebSocketStats() {
    return wsClients;
  }
}
