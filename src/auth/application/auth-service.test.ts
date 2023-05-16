import {
    Test, TestingModule
} from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import {
    RegistrationUserCommand, RegistrationUserUseCase
} from './use-cases/registration-user.use-case'
import { UsersRepository } from '../../SuperAdmin/infrastructure/users-db-repository'
import { EmailManager } from '../../general/managers/emailManager'
import { BcryptAdapter } from '../../general/adapters/bcrypt.adapter'
import { User } from '../../SuperAdmin/domain/UsersSchema'
import { getModelToken } from '@nestjs/mongoose'
import { UserDTO } from '../../SuperAdmin/domain/UsersTypes'

describe('integration tests for auth use cases', () => {
    let useCase: RegistrationUserUseCase
    let bcryptAdapter: BcryptAdapter
    let emailManager: EmailManager

    const mockModel = {
        findOneAndUpdate: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        makeInstance: jest.fn(
            (login: string, email: string, passwordHash: string, isConfirmed: boolean) => {
                return new UserDTO(login, email, passwordHash, isConfirmed)
            }),
    }

    let mongoServer: MongoMemoryServer
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()

        const mongoURI = mongoServer.getUri()
        await mongoose.connect(mongoURI)
    })

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            providers: [
                RegistrationUserUseCase,
                UsersRepository,
                EmailManager,
                BcryptAdapter,
                {
                    provide: getModelToken(User.name),
                    useValue: mockModel,
                },
                {
                    provide: BcryptAdapter,
                    useValue: { generatePasswordHash: jest.fn().mockResolvedValue('hashed_password'), },
                },
                {
                    provide: UsersRepository,
                    useValue: { save: jest.fn(), },
                },
                {
                    provide: EmailManager,
                    useValue: { sendConfirmationCode: jest.fn(), },
                },
            ],
        }).compile()

        useCase = moduleRef.get<RegistrationUserUseCase>(RegistrationUserUseCase)
        bcryptAdapter = moduleRef.get<BcryptAdapter>(BcryptAdapter)
        emailManager = moduleRef.get<EmailManager>(EmailManager)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('registration user', () => {
        it('should create a new user with hashed password and send email confirmation code', async () => {
            const command = new RegistrationUserCommand('test_login', 'test_password', 'test_email')

            const result = await useCase.execute(command)

            expect(result).toBe(true)

            expect(mockModel.makeInstance).toHaveBeenCalledTimes(1)

            expect(bcryptAdapter.generatePasswordHash).toHaveBeenCalledWith(command.password, 10)

            expect(emailManager.sendConfirmationCode).toHaveBeenCalledTimes(1)
        })
    })
})
