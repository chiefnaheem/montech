import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
  autoIndex: true,
  _id: true,
})
export class UserEntity {
  @Prop()
  firstName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  lastName: string;

  @Prop()
  age: number;

  @Prop()
  gender: string;

  @Prop([{ type: MoviesSchema, ref: MoviesEntity.name }])
  @Type(() => MoviesEntity)
  nextOfKin: MoviesEntity[];

  static async isValidPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    try {
      const result = await bcrypt.compare(password, hash);
      if (!result) {
        return false;
      }
      return true;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  static async hashPassword(pass: string): Promise<{ password; salt }> {
    try {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash(pass, salt);
      return { password, salt };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);
export type UserDocument = UserEntity & Document;
