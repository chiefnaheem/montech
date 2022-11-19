import { Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  NotImplementedException,
  BadGatewayException,
  ServiceUnavailableException,
  NotAcceptableException,
  ConflictException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { UserDocument, UserEntity } from '../schema/user.schema';
import { Request } from 'express'
import { MovieDocument, MovieEntity } from '../schema/movies.schema';
import { RegisterDto } from '../dto/register.dto';
import { TokenService } from 'src/auth/service/token.service';
import * as bcrypt from 'bcrypt'
@Injectable()
export class UserService {
    private readonly httpService: HttpService;
     constructor (
        @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(MovieEntity.name)
    private readonly movieModel: Model<MovieDocument>,
    private readonly tokenService: TokenService,
     ){
        this.httpService = new HttpService()
     }

    //register
    async register(user: RegisterDto): Promise<UserEntity> {
        try {

        const { email } = user;
        const userExists = await this.userModel.findOne
        ({
            email,
        });
        if (userExists) {
            throw new ConflictException('user already exists');
        }

        const createdUser = new this.userModel({
            ...user,
            password: await bcrypt.hash(user.password, 10)
        });
        return createdUser.save();
    }
    catch(err){
        throw new InternalServerErrorException(err.message)
    }

    }

    //login
    async login(email: string, password: string): Promise<any> {
        try {
            const user = await this.userModel.findOne({
                email,
            });
            if (!user) {
                throw new NotFoundException('user not found');
            }
            const isMatch = await UserEntity.isValidPassword(password, user.password);
            if (!isMatch) {
                throw new UnauthorizedException('invalid credentials');
            }
            const token = await this.tokenService.generateTokens(user);
            return token;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async addMovie(req: Request, movieId: number): Promise<UserDocument> {
        try{
            //get movie data from external api
            const { data } = await this.httpService.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.API_KEY}`).toPromise();

            //create movie
            const createdMovie = new this.movieModel({
                id: data.id,
                title: data.title,
                overview: data.overview,
                poster_path: data.poster_path,
                release_date: data.release_date,
                vote_average: data.vote_average,
                vote_count: data.vote_count,
            });
            //we want to check the user making request and then add the createdMovie to it
            const user: UserDocument = await this.userModel.findById(req.user);
            if (!user) {
                throw new NotFoundException('user not found');
            }
            //if movie already exists for the user, throw conflict error
            const movieExists = user.movies.find(movie => movie.id == movieId);
            if (movieExists) {
                throw new ConflictException('movie already exists');
            }

            //add movie to user
            user.movies.push(createdMovie);
            //save user
            await user.save();
            return user;
        }
        catch(error){
            throw new BadGatewayException(error.message);
        }
    }

    //get self
    async getSelf(req: Request): Promise<UserDocument> {
        try{
            const user: UserDocument = await this.userModel.findById(req.user);
            if (!user) {
                throw new NotFoundException('user not found');
            }
            return user;
        }
        catch(error){
            throw new InternalServerErrorException(error.message);
        }
    }

    //we want to be able to delete movie by a user
    async deleteMovie(req: Request, movie_id: number): Promise<string> {
        try{
            const user = await this.userModel.findById(req.user);
            if (!user) {
                throw new NotFoundException('user not found');
            }
            //delete movie from user
            user.movies = user.movies.filter(movie => movie.id !== movie_id);
            //save user
            await user.save();
            return 'movie successfully deleted';
        }
        catch(error){
            throw new BadGatewayException(error);
        }
    }

    //we want to be able to add rating to a movie by user
    async addRating(req: Request, movie_id: number, rating: number): Promise<MovieEntity> {
        try{
            const user = await this.userModel.findById(req.user);
            if (!user) {
                throw new NotFoundException('user not found');
            }

            const movieExists = user.movies.find(movie => movie.id == movie_id);
            
            if (!movieExists) {
                throw new NotFoundException('movie not found here');
            }
            user.movies = user.movies.map(movie => {
                if(movie.id == movie_id){
                    movie.rating = rating;
                }
                
                return movie;
            }
            );
            //save user
            await user.save();
            //we want to return the movie with its new rating
            const movie = user.movies.find(movie => movie.id == movie_id);
            
            return movie;
        }
        catch(error){
            throw new InternalServerErrorException(error.message);
        }
    }

    //get all movies for user
    async getAllMovies(req: Request): Promise<MovieEntity[]> {
        try{
            const user = await this.userModel.findById(req.user);
            if (!user) {
                throw new NotFoundException('user not found');
            }
            return user.movies;
        }
        catch(error){
            throw new InternalServerErrorException(error.message);
        }
    }
            
     //get single movie
     async getSingleMovie(req: Request, movie_id: number): Promise<MovieEntity> {
        try{
            const user = await this.userModel.findById(req.user);
            if (!user) {
                throw new NotFoundException('user not found');
            }
            const movie = user.movies.find(movie => movie.id == movie_id);
            if (!movie) {
                throw new NotFoundException('movie not found');
            }
            return movie;
        }
        catch(error){
            throw new InternalServerErrorException(error.message);
        }
        }      
}
