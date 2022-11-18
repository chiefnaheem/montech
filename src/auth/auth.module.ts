import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { TokenService } from './service/token.service';

@Module({
  providers: [AuthService, TokenService],
  exports: [TokenService],
})
export class AuthModule {}
