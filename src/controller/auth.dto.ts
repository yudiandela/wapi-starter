import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'admin-master' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'AdminM4st3r' })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RegisterDto {
    @ApiProperty({ example: 'johndoe' })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    username: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'John Doe', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'john@example.com', required: false })
    @IsEmail()
    @IsOptional()
    email?: string;
}
