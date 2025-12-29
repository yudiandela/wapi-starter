import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService, User } from '../database/database.service';

export interface JwtPayload {
    sub: number;
    username: string;
    iat?: number;
    exp?: number;
}

export interface LoginResult {
    success: boolean;
    message: string;
    data?: {
        user: {
            id: number;
            username: string;
            name: string | null;
            email: string | null;
        };
        token: string;
        api_key: string;
    };
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly jwtService: JwtService,
    ) { }

    async login(username: string, password: string): Promise<LoginResult> {
        const user = this.databaseService.findUserByUsername(username);

        if (!user) {
            this.logger.warn(`Login failed: User not found - ${username}`);
            return {
                success: false,
                message: 'Invalid username or password',
            };
        }

        const isPasswordValid = await this.databaseService.validatePassword(password, user.password);

        if (!isPasswordValid) {
            this.logger.warn(`Login failed: Invalid password - ${username}`);
            return {
                success: false,
                message: 'Invalid username or password',
            };
        }

        const payload: JwtPayload = {
            sub: user.id,
            username: user.username,
        };

        const token = this.jwtService.sign(payload);

        this.logger.log(`Login successful: ${username}`);

        return {
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                },
                token,
                api_key: user.api_key,
            },
        };
    }

    async register(data: {
        username: string;
        password: string;
        name?: string;
        email?: string;
    }): Promise<LoginResult> {
        // Check if username already exists
        const existingUser = this.databaseService.findUserByUsername(data.username);
        if (existingUser) {
            return {
                success: false,
                message: 'Username already exists',
            };
        }

        // Check if email already exists
        if (data.email) {
            const existingEmail = this.databaseService.findUserByEmail(data.email);
            if (existingEmail) {
                return {
                    success: false,
                    message: 'Email already exists',
                };
            }
        }

        const user = await this.databaseService.createUser(data);

        const payload: JwtPayload = {
            sub: user.id,
            username: user.username,
        };

        const token = this.jwtService.sign(payload);

        this.logger.log(`User registered: ${data.username}`);

        return {
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                },
                token,
                api_key: user.api_key,
            },
        };
    }

    validateToken(token: string): JwtPayload | null {
        try {
            return this.jwtService.verify<JwtPayload>(token);
        } catch {
            return null;
        }
    }

    getUserFromToken(token: string): User | undefined {
        const payload = this.validateToken(token);
        if (!payload) return undefined;
        return this.databaseService.findUserById(payload.sub);
    }

    getUserFromApiKey(apiKey: string): User | undefined {
        return this.databaseService.findUserByApiKey(apiKey);
    }

    regenerateApiKey(userId: number): string {
        return this.databaseService.regenerateApiKey(userId);
    }
}
