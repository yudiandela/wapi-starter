import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;
  private isReady = false;

  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    try {
      this.client = new Redis();

      const pong = await this.client.ping();
      if (pong === 'PONG') {
        this.isReady = true;
        this.logger.log('✅ Redis connected');
      } else {
        this.logger.warn('⚠️ Redis ping failed. Continuing without Redis.');
      }
    } catch (err) {
      this.logger.error(
        '❌ Redis connection failed. App will continue without Redis.',
        err,
      );
    }
  }

  isConnected(): boolean {
    return this.isReady;
  }

  async set(key: string, value: any, ttlSeconds = 3600) {
    if (!this.isReady) {
      this.logger.warn(
        `Skipping Redis set for key ${key}: Redis not connected`,
      );
      return;
    }

    try {
      const json = JSON.stringify(value);
      await this.client.set(key, json, 'EX', ttlSeconds);
    } catch (err) {
      this.logger.error(`❌ Redis set error for key ${key}`, err);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isReady) {
      this.logger.warn(
        `Skipping Redis get for key ${key}: Redis not connected`,
      );
      return null;
    }

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      this.logger.error(`❌ Redis get error for key ${key}`, err);
      return null;
    }
  }

  async del(key: string) {
    if (!this.isReady) {
      this.logger.warn(
        `Skipping Redis del for key ${key}: Redis not connected`,
      );
      return;
    }

    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.error(`❌ Redis del error for key ${key}`, err);
    }
  }

  async ping(): Promise<boolean> {
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}
