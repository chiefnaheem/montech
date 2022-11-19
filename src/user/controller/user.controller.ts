import { Controller, Get, Post, Param, Body, Req, Res } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { UserService } from '../service/user.service';


@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ){}

    //register
    @Post('register')
    async register(@Body() user: RegisterDto): Promise<any> {
        return this.userService.register(user);
    }

    //login
    @Post('login')
    async login(@Body('email') email: string, @Body('password') password: string): Promise<any> {
        return this.userService.login(email, password);
    }

    //get self(user) which is gotten by checking the user making request through the auth token
    @Get('self')
    async getSelf(@Req() req: any): Promise<any> {
        return this.userService.getSelf(req);
    }

    //add movie
    @Post('add-movie')
    async addMovie( @Req() req: any, @Body() movieId: number): Promise<any> {
        return this.userService.addMovie(req, movieId);
    }

}
