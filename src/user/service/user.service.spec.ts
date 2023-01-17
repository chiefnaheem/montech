import { ConflictException, HttpService, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { TokenService } from "src/auth/service/token.service";
import { MovieDocument } from "../schema/movies.schema";
import { UserDocument, UserEntity } from "../schema/user.schema";
import { UserService } from "./user.service";

describe('UserService', () => {
    let service: UserService;
    let userModel;
    let movieModel;
    let httpService;
    let tokenService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getModelToken(UserEntity.name),
                    useValue: {
                        findOne: jest.fn(),
                        findById: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: getModelToken(MovieEntity.name),
                    useValue: {
                        save: jest.fn(),
                    },
                },
                {
                    provide: HttpService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: TokenService,
                    useValue: {
                        generateTokens: jest.fn(),
                    },
                },
                {
                    provide: 'bcrypt',
                    useValue: {
                        hash: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userModel = module.get<Model<UserDocument>>(getModelToken(UserEntity.name));
        movieModel = module.get<Model<MovieDocument>>(getModelToken(MovieEntity.name));
        httpService = module.get<HttpService>(HttpService);
        tokenService = module.get<TokenService>(TokenService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const user = { email: 'test@test.com', password: 'password' };
            userModel.findOne.mockReturnValue(null);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password');
const result = await service.register(user);
expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
expect(userModel.save).toHaveBeenCalledWith({
email: 'test@test.com',
password: 'hashed_password',
});
expect(result).toEqual({ _id: '1', email: 'test@test.com', movies: [] });
});
    it('should throw a conflict exception if user already exists', async () => {
        const user = { email: 'test@test.com', password: 'password' };
        userModel.findOne.mockReturnValue({ _id: '1', email: 'test@test.com', movies: [] });
        try {
            await service.register(user);
        } catch (error) {
            expect(error).toBeInstanceOf(ConflictException);
            expect(error.message).toEqual('user already exists');
        }
    });

    it('should throw an internal server error exception if an error occurs', async () => {
        const user = { email: 'test@test.com', password: 'password' };
        userModel.findOne.mockImplementation(() => { throw new Error('test error') });
        try {
            await service.register
(user);
} catch (error) {
expect(error).toBeInstanceOf(InternalServerErrorException);
expect(error.message).toEqual('test error');
}
});
});

describe('login', () => {
    it('should login a user', async () => {
        const email = 'test@test.com';
        const password = 'password';
        const user = { _id: '1', email: 'test@test.com', password: 'hashed_password' };
        userModel.findOne.mockReturnValue(user);
        jest.spyOn(UserEntity, 'isValidPassword').mockReturnValue(true);
        tokenService.generateTokens.mockResolvedValue('token');
        const result = await service.login(email, password);
        expect(userModel.findOne).toHaveBeenCalledWith({ email });
        expect(UserEntity.isValidPassword).toHaveBeenCalledWith(password, 'hashed_password');
        expect(tokenService.generateTokens).toHaveBeenCalledWith(user);
        expect(result).toEqual('token');
    });

    it('should throw a not found exception if user is not found', async () => {
        const email = 'test@test.com';
        const password = 'password';
        userModel.findOne.mockReturnValue(null);
        try {
            await service.login(email, password);
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
            expect(error.message).toEqual('user not found');
        }
    });

    it('should throw an unauthorized exception if invalid credentials', async () => {
        const email = 'test@test.com';
        const password = 'password';
        const user = { _id: '1', email: 'test@test.com', password: 'hashed_password' };
        userModel.findOne.mockReturnValue(user);
        jest.spyOn(UserEntity, 'isValidPassword').
mockReturnValue(false);
try {
await service.login(email, password);
} catch (error) {
expect(error).toBeInstanceOf(UnauthorizedException);
expect(error.message).toEqual('invalid credentials');
}
});
it('should throw an internal server error exception if an error occurs', async () => {
        const email = 'test@test.com';
        const password = 'password';
        userModel.findOne.mockImplementation(() => { throw new Error('test error') });
        try {
            await service.login(email, password);
        } catch (error) {
            expect(error).toBeInstanceOf(InternalServerErrorException);
            expect(error.message).toEqual('test error');
        }
    });
});


describe('addMovie', () => {
    it('should add a movie to a user', async () => {
        const req = { user: '1' };
        const movieId = 123;
        const user = { _id: '1', email: 'test@test.com', movies: [] };
        userModel.findById.mockReturnValue(user);
        httpService.get.mockResolvedValue({ data: { id: 123, title: 'Test Movie' } });
        const result = await service.addMovie(req, movieId);
        expect(httpService.get).toHaveBeenCalledWith(`https://api.themoviedb.org/3/movie/123?api_key=${process.env.API_KEY}`);
        expect(userModel.findById).toHaveBeenCalledWith('1');
        expect(userModel.save).toHaveBeenCalled();
        expect(result).toEqual({ _id: '1', email: 'test@test.com', movies: [{ id: 123, title: 'Test Movie' }] });
    });

    it('should throw a not found exception if user is not found', async () => {
        const req = { user: '1' };
        const movieId = 123;
        userModel.findById.mockReturnValue(null);
        try {
            await service.addMovie(req, movieId);
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
            expect(error.message).toEqual('user not found');
        }
    });
    it('should throw a conflict exception if movie already exists for user', async () => {
        const req = { user: '1' };
        const movieId = 123;
        const user = { _id: '1', email: 'test@test.com', movies: [{ id: 123, title: 'Test Movie' }] };
        userModel.findById.mockReturnValue(user);
        try {
            await service.addMovie(req, movieId);
        } catch (error) {
            expect(error).toBeInstanceOf(ConflictException);
            expect(error.message).toEqual('movie already exists
});