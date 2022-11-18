import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({_id: true, timestamps: true, autoIndex: true})

export class MovieEntity {
    @Prop()
    title: string;
    
    @Prop()
    id: number;
    
    @Prop()
    release_date: string;
    
    @Prop()
    rating: number;
    
    @Prop()
    imdb_id: string;
    
    @Prop()
    video: boolean;
}

export const MovieSchema = SchemaFactory.createForClass(MovieEntity);
export type MovieDocument = MovieEntity & Document;