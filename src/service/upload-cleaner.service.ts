import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as cron from 'node-cron';

@Injectable()
export class UploadCleanerService implements OnModuleInit {
  private readonly logger = new Logger(UploadCleanerService.name);
  private readonly uploadDir = path.resolve('media');
  private readonly maxDays = 7; // 7 hari
  private readonly maxAgeMs = this.maxDays * 24 * 60 * 60 * 1000;

  onModuleInit() {
    this.logger.log('🟢 UploadCleanerService started');

    // cron: setiap hari jam 01:00 WIB
    cron.schedule('0 1 * * *', () => {
      this.cleanOldFiles();
    });
  }

  cleanOldFiles() {
    this.logger.log('⚙️ Checking files...');

    if (!fs.existsSync(this.uploadDir)) return;

    const files = fs.readdirSync(this.uploadDir);
    const now = Date.now();
    let deleted = 0;

    for (const file of files) {
      const filePath = path.join(this.uploadDir, file);
      try {
        const stat = fs.statSync(filePath);
        const age = now - stat.mtimeMs;

        if (age > this.maxAgeMs) {
          fs.unlinkSync(filePath);
          this.logger.log(`🗑️ Deleted old file: ${file}`);
          deleted++;
        }
      } catch (err) {
        this.logger.warn(`⚠️ Failed to check/delete ${file}: ${err.message}`);
      }
    }

    if (deleted === 0) {
      this.logger.log('✅ No old files found.');
    }
  }
}
