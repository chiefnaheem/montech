import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { TokenService } from 'src/auth/service/token.service';
import { UserController } from './controller/user.controller';
import { MovieEntity, MovieSchema } from './schema/movies.schema';
import { UserEntity, UserSchema } from './schema/user.schema';
import { UserService } from './service/user.service';

@Module({
    imports: [
        MongooseModule.forFeatureAsync([
      {
        name: UserEntity.name,
        useFactory: () => {
          return UserSchema;
        },
      },
    ]),
     MongooseModule.forFeatureAsync([
      {
        name: MovieEntity.name,
        useFactory: () => {
          return MovieSchema;
        },
      },
    ]),
        AuthModule
    ],
    providers: [UserService],
    exports: [UserService],
    controllers: [UserController]
})
export class UserModule {}
