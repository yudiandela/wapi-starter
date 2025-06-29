import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;
  private isReady = false;

  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    this.client = new Redis(); // default localhost:6379

    try {
      const pong = await this.client.ping();
      if (pong === 'PONG') {
        this.isReady = true;
        this.logger.log('✅ Redis connected successfully');
      } else {
        this.logger.error('❌ Redis ping failed');
      }
    } catch (err) {
      this.logger.error('❌ Failed to connect to Redis', err);
    }
  }

  private ensureConnected() {
    if (!this.isReady) {
      throw new Error('Redis is not connected');
    }
  }

  async set(key: string, value: any, ttlSeconds = 3600) {
    this.ensureConnected();
    const json = JSON.stringify(value);
    await this.client.set(key, json, 'EX', ttlSeconds);
  }

  async get<T = any>(key: string): Promise<T | null> {
    this.ensureConnected();
    const data = await this.client.get(`wapi:msg:${key}`);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string) {
    this.ensureConnected();
    return this.client.del(key);
  }

  async ping(): Promise<boolean> {
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  isConnected(): boolean {
    return this.isReady;
  }
}
