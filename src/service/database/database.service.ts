import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Database = require('better-sqlite3');

export interface User {
    id: number;
    username: string;
    password: string;
    name: string | null;
    email: string | null;
    api_key: string;
    created_at: string;
    updated_at: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
    private db: any;
    private readonly logger = new Logger(DatabaseService.name);
    private readonly dbPath = path.resolve('data/wapi.db');
    private readonly migrationsPath = path.resolve('migrations');

    async onModuleInit() {
        await this.initialize();
    }

    private async initialize() {
        // Ensure data directory exists
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            this.logger.log(`📁 Created directory: ${dataDir}`);
        }

        // Initialize database
        this.db = new Database(this.dbPath);
        this.logger.log(`✅ Database connected: ${this.dbPath}`);

        // Run migrations
        await this.runMigrations();

        // Seed default user if needed
        await this.seedDefaultUser();
    }

    private async runMigrations() {
        if (!fs.existsSync(this.migrationsPath)) {
            this.logger.warn('⚠️ No migrations directory found');
            return;
        }

        const migrationFiles = fs
            .readdirSync(this.migrationsPath)
            .filter((file) => file.endsWith('.sql'))
            .sort();

        for (const file of migrationFiles) {
            const filePath = path.join(this.migrationsPath, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            try {
                this.db.exec(sql);
                this.logger.log(`✅ Migration applied: ${file}`);
            } catch (error) {
                // Ignore "table already exists" errors
                if (!error.message.includes('already exists')) {
                    this.logger.error(`❌ Migration failed: ${file}`, error);
                    throw error;
                }
            }
        }
    }

    private async seedDefaultUser() {
        const existingUser = this.findUserByUsername('admin-master');
        if (existingUser) {
            this.logger.log('👤 Default admin user already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash('AdminM4st3r', 10);
        const apiKey = `wapi_${uuidv4().replace(/-/g, '')}`;

        const stmt = this.db.prepare(`
      INSERT INTO users (username, password, name, email, api_key)
      VALUES (?, ?, ?, ?, ?)
    `);

        stmt.run('admin-master', hashedPassword, 'Administrator', 'admin@example.com', apiKey);
        this.logger.log('👤 Default admin user created: admin-master');
        this.logger.log(`🔑 API Key: ${apiKey}`);
    }

    // User methods
    findUserByUsername(username: string): User | undefined {
        const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
        return stmt.get(username) as User | undefined;
    }

    findUserByApiKey(apiKey: string): User | undefined {
        const stmt = this.db.prepare('SELECT * FROM users WHERE api_key = ?');
        return stmt.get(apiKey) as User | undefined;
    }

    findUserById(id: number): User | undefined {
        const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id) as User | undefined;
    }

    findUserByEmail(email: string): User | undefined {
        const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email) as User | undefined;
    }

    async createUser(data: {
        username: string;
        password: string;
        name?: string;
        email?: string;
    }): Promise<User> {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const apiKey = `wapi_${uuidv4().replace(/-/g, '')}`;

        const stmt = this.db.prepare(`
      INSERT INTO users (username, password, name, email, api_key)
      VALUES (?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            data.username,
            hashedPassword,
            data.name || null,
            data.email || null,
            apiKey,
        );

        return this.findUserById(result.lastInsertRowid as number)!;
    }

    async updateUserPassword(userId: number, newPassword: string): Promise<void> {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const stmt = this.db.prepare(`
      UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
        stmt.run(hashedPassword, userId);
    }

    regenerateApiKey(userId: number): string {
        const apiKey = `wapi_${uuidv4().replace(/-/g, '')}`;
        const stmt = this.db.prepare(`
      UPDATE users SET api_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
        stmt.run(apiKey, userId);
        return apiKey;
    }

    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    getDatabase(): any {
        return this.db;
    }
}
