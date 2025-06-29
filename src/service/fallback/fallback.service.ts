import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Fallback } from './fallback.type';

@Injectable()
export class FallbackService {
  private fallbackDir = path.resolve('.cache/redis-fallback');

  getFallback(id: string) {
    const fallbackDir = `${this.fallbackDir}/${id}`;

    if (!fs.existsSync(fallbackDir)) return [];

    const files = fs.readdirSync(fallbackDir);

    const fallbacks: Fallback[] = [];

    files.map((file) => {
      const stats = fs.statSync(path.join(fallbackDir, file));

      fallbacks.push({
        file,
        sizeKb: Math.round(stats.size / 1024),
        createdAt: stats.birthtime.toISOString(),
      });
    });

    return { fallbacks };
  }
}
