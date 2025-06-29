import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;
  private isReady = false;
  private readonly fallbackDir = path.resolve('.cache/redis-fallback');
  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    if (!fs.existsSync(this.fallbackDir)) {
      fs.mkdirSync(this.fallbackDir, { recursive: true });
    }

    try {
      this.client = new Redis();
      const pong = await this.client.ping();
      if (pong === 'PONG') {
        this.isReady = true;
        this.logger.log('✅ Redis connected');
      } else {
        this.logger.warn('⚠️ Redis ping failed');
      }
    } catch (err) {
      this.logger.error('❌ Redis connection failed, fallback enabled.', err);
    }
  }

  isConnected(): boolean {
    return this.isReady;
  }

  async set(key: string, value: any, ttlSeconds = 3600) {
    if (!this.isReady) {
      return this.saveToFile(key, value);
    }

    try {
      const json = JSON.stringify(value);
      await this.client.set(key, json, 'EX', ttlSeconds);
    } catch (err) {
      this.logger.error(`❌ Redis set error for ${key}, fallback to file`, err);
      this.saveToFile(key, value);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isReady) {
      this.logger.warn(`⚠️ Redis not connected, get skipped for key ${key}`);
      return null;
    }

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      this.logger.error(`❌ Redis get error for ${key}`, err);
      return null;
    }
  }

  async del(key: string) {
    if (!this.isReady) {
      this.logger.warn(`⚠️ Redis not connected, del skipped for key ${key}`);
      return;
    }

    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.error(`❌ Redis del error for ${key}`, err);
    }
  }

  private saveToFile(key: string, value: any) {
    try {
      const filename = key.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fallbackDir = `${this.fallbackDir}/${value.id}`;

      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }

      const filepath = path.join(fallbackDir, `${filename}-${Date.now()}.json`);
      fs.writeFileSync(filepath, JSON.stringify(value, null, 2), 'utf-8');
      this.logger.warn(`📁 Data fallback saved to ${filepath}`);
    } catch (err) {
      this.logger.error(`❌ Failed to save fallback for ${key}`, err);
    }
  }
}
