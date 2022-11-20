import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../service/user.service';
import { v4 } from 'uuid'

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  const mockUserService = {
    register: jest.fn(dto => {
        return {
            _id: v4(),
            ...dto
        }
    }),
    login: jest.fn(dto => {
        return {
            token: v4()
        }
    })
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).overrideProvider(UserService).useValue(mockUserService).compile();

    userController = app.get<UserController>(UserController);
    
    });
    it('should register user', () => {
        const user = {
            firstName: 'test',
            lastName: 'test',
            email: 'test@test.com',
            password: 'test1234',
            gender: 'male'
        }
        expect(userController.register(user)).toEqual({
            _id: expect.any(String),
            firstName: user.firstName,
            lastName: user.lastName
        })
        expect(mockUserService.register).toHaveBeenCalled()
    })

    it('should login user', () => {
        const user = {
            email: "test@test.com",
            password: 'test1234'
        }
        expect(userController.login(user.email, user.password).toEqual({
            token: v4()
        }))
    })

  
});