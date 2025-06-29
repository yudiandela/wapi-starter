import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(); // sesuaikan jika pakai password/host lain
  }

  async set(key: string, value: any, ttlSeconds = 3600) {
    const json = JSON.stringify(value);
    await this.client.set(key, json, 'EX', ttlSeconds);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  del(key: string) {
    return this.client.del(key);
  }
}
