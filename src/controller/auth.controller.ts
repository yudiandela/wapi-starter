import { Body, Controller, Get, Post, Req, UseGuards, HttpException } from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiBearerAuth,
    ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from 'src/service/auth/auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthGuard } from './auth.guard';
import { User } from 'src/service/database/database.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @ApiCreatedResponse({
        description: 'Login successful',
        schema: {
            example: {
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: 1,
                        username: 'admin-master',
                        name: 'Administrator',
                        email: 'admin@example.com',
                    },
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    api_key: 'wapi_abc123...',
                },
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid credentials',
        schema: {
            example: {
                success: false,
                message: 'Invalid username or password',
            },
        },
    })
    async login(@Body() body: LoginDto) {
        const result = await this.authService.login(body.username, body.password);

        if (!result.success) {
            throw new HttpException(result, 401);
        }

        return result;
    }

    @Post('register')
    @ApiCreatedResponse({
        description: 'Registration successful',
        schema: {
            example: {
                success: true,
                message: 'Registration successful',
                data: {
                    user: {
                        id: 2,
                        username: 'johndoe',
                        name: 'John Doe',
                        email: 'john@example.com',
                    },
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    api_key: 'wapi_xyz789...',
                },
            },
        },
    })
    async register(@Body() body: RegisterDto) {
        const result = await this.authService.register(body);

        if (!result.success) {
            throw new HttpException(result, 400);
        }

        return result;
    }

    @Get('me')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiHeader({ name: 'x-api-key', required: false, description: 'API Key for authentication' })
    @ApiOkResponse({
        description: 'Current user info',
        schema: {
            example: {
                id: 1,
                username: 'admin-master',
                name: 'Administrator',
                email: 'admin@example.com',
                api_key: 'wapi_abc123...',
                created_at: '2025-12-30T00:00:00.000Z',
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized',
    })
    me(@Req() req: Request & { user: User }) {
        const { password, ...userWithoutPassword } = req.user;
        return userWithoutPassword;
    }

    @Post('regenerate-api-key')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiHeader({ name: 'x-api-key', required: false, description: 'API Key for authentication' })
    @ApiCreatedResponse({
        description: 'New API key generated',
        schema: {
            example: {
                success: true,
                message: 'API key regenerated successfully',
                data: {
                    api_key: 'wapi_newkey123...',
                },
            },
        },
    })
    regenerateApiKey(@Req() req: Request & { user: User }) {
        const newApiKey = this.authService.regenerateApiKey(req.user.id);
        return {
            success: true,
            message: 'API key regenerated successfully',
            data: {
                api_key: newApiKey,
            },
        };
    }
}
