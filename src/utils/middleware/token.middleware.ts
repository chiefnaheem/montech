import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from 'src/auth/service/token.service';
import { TokenDto } from 'src/auth/dto/token.dto';
import { Types } from 'mongoose';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      throw new UnauthorizedException(
        'you must be logged in to access this route',
      );
    }
    const authorizationHeader = req.headers.authorization;
    const [bearer, token] = authorizationHeader.split(' ');
    if (bearer !== 'Bearer') {
      throw new NotFoundException('please provide a Bearer token');
    }

    if (!token) {
      throw new Notification('token not found');
    }
    const tokenData: TokenDto = await this.tokenService.verify(token);

    const userID = new Types.ObjectId(tokenData._id);
    req.user = userID

    res.locals.tokenData = tokenData;

    next();
  }
}
