import { IsString, IsOptional, IsNotEmpty, IsEmail, MinLength } from 'class-validator'

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @MinLength(5)
    password: string

    @IsOptional()
    @IsString()
    firstName: string

    @IsOptional()
    @IsString()
    lastName: string

    @IsOptional()
    @IsString()
    gender: string
}