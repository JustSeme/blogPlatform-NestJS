import {
    Test, TestingModule
} from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import {
    RegistrationUserCommand, RegistrationUserUseCase
} from './use-cases/registration-user.use-case'
import { EmailManager } from '../../general/managers/emailManager'
import { BcryptAdapter } from '../../general/adapters/bcrypt.adapter'
import {
    ConfirmEmailCommand, ConfirmEmailUseCase
} from './use-cases/confirm-email.use-case'
import { AppModule } from '../../app.module'
import { AppService } from '../../app.service'
import { AuthRepository } from '../infrastructure/rawSQL/auth-sql-repository'

describe('integration tests for auth use cases', () => {
    let registrationUserUseCase: RegistrationUserUseCase
    let confirmEmailUseCase: ConfirmEmailUseCase
    let bcryptAdapter: BcryptAdapter
    let emailManager: EmailManager
    let authRepository: AuthRepository
    let appService: AppService


    let mongoServer: MongoMemoryServer

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()

        const mongoURI = mongoServer.getUri()
        await mongoose.connect(mongoURI)
    })

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
            .overrideProvider(EmailManager)
            .useValue({ sendConfirmationCode: jest.fn() })
            .overrideProvider(BcryptAdapter)
            .useValue({ generatePasswordHash: jest.fn(() => 'hashedPassword') })
            .compile()

        registrationUserUseCase = moduleRef.get<RegistrationUserUseCase>(RegistrationUserUseCase)
        confirmEmailUseCase = moduleRef.get<ConfirmEmailUseCase>(ConfirmEmailUseCase)
        bcryptAdapter = moduleRef.get<BcryptAdapter>(BcryptAdapter)
        emailManager = moduleRef.get<EmailManager>(EmailManager)
        authRepository = moduleRef.get<AuthRepository>(AuthRepository)
        appService = moduleRef.get<AppService>(AppService)

        await appService.deleteTestingData()
    })

    afterAll(async () => {
        jest.clearAllMocks()
        await mongoose.disconnect()
        mongoServer.stop()
    })

    describe('registration user', () => {
        it('should create a new user with hashed password and send email confirmation code', async () => {
            const command = new RegistrationUserCommand('test_login', 'test_password', 'test_email')

            const result = await registrationUserUseCase.execute(command)

            expect(result).toBe(true)

            const user = await authRepository.findUserWithEmailConfirmationByEmail(command.email)

            expect(user.login).toEqual(command.login)
            expect(user.email).toEqual(command.email)

            const userConfirmationCode = user.emailConfirmationCode

            expect(bcryptAdapter.generatePasswordHash).toHaveBeenCalledWith(command.password, 10)

            expect(emailManager.sendConfirmationCode).toHaveBeenCalledWith(command.email, command.login, userConfirmationCode)

            expect(user.isConfirmed).toBe(false)
        })
    })

    describe('confirm email', () => {

        it('should return false for incorrect confirmation code', async () => {
            const command = new ConfirmEmailCommand('incorrectConfirmationCode')

            const result = await confirmEmailUseCase.execute(command)

            expect(result).toBe(false)
        })
    })
})
