import {
    CanActivate,
    ExecutionContext,
    HttpException,
    Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/service/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        // Check for JWT token in Authorization header
        const authHeader = request.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const user = this.authService.getUserFromToken(token);

            if (user) {
                (request as any).user = user;
                return true;
            }
        }

        // Check for API key in x-api-key header
        const apiKey = request.headers['x-api-key'] as string;
        if (apiKey) {
            const user = this.authService.getUserFromApiKey(apiKey);

            if (user) {
                (request as any).user = user;
                return true;
            }
        }

        throw new HttpException(
            {
                statusCode: 401,
                message: 'Unauthorized. Please provide valid token or API key.',
            },
            401,
        );
    }
}
