import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"
import { createApp } from '../src/createApp'
import { UserInputModel } from '../src/auth/api/models/UserInputModel';
import { LoginInputDTO } from '../src/auth/api/models/LoginInputDTO'
import { UsersRepository } from '../src/auth/infrastructure/users-db-repository';

describe('e2e-auth', () => {
    let app: NestExpressApplication;
    let httpServer;
    let usersRepository: UsersRepository

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication()
        app = createApp(app)

        usersRepository = await app.resolve(UsersRepository)

        await app.init()

        httpServer = app.getHttpServer()
        await request(httpServer)
            .delete('/testing/all-data')
    });

    afterAll(async () => {
        //await app.close();
    });

    const correctUserInputData: UserInputModel = {
        login: 'justSeme',
        password: '123123123',
        email: 'semyn@mail.ru'
    }

    it('should registrate and create user', async () => {
        await request(httpServer)
            .post('/auth/registration')
            .send(correctUserInputData)
            .expect(HttpStatus.NO_CONTENT)
    })

    let createdUserId
    it('should return array with one created user', async () => {
        const response = await request(httpServer)
            .get(`/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(response.body.totalCount === 1).toBe(true)
        expect(response.body.items[0].login).toEqual(correctUserInputData.login)
        expect(response.body.items[0].email).toEqual(correctUserInputData.email)

        createdUserId = response.body.items[0].id
    })

    it('resend confirmation code, shouldn\'t change confirmation code from usersRepository if email is incorrect', async () => {
        let user = await usersRepository.findUserById(createdUserId)
        const confirmationCode = user?.emailConfirmation.confirmationCode

        await request(httpServer)
            .post('/auth/registration-email-resending')
            .send({ email: 'incorrect email' })
            .expect(HttpStatus.BAD_REQUEST)

        user = await usersRepository.findUserById(createdUserId)
        const newConfirmationCode = user?.emailConfirmation.confirmationCode
        expect(confirmationCode === newConfirmationCode).toBe(true)
    })

    it('resend confirmation code, should change confirmation code from usersRepository', async () => {
        let user = await usersRepository.findUserById(createdUserId)
        const confirmationCode = user?.emailConfirmation.confirmationCode

        await request(httpServer)
            .post('/auth/registration-email-resending')
            .send({ email: user?.email })
            .expect(HttpStatus.NO_CONTENT)

        user = await usersRepository.findUserById(createdUserId)
        const newConfirmationCode = user?.emailConfirmation.confirmationCode
        expect(confirmationCode === newConfirmationCode).toBe(false)
    })


    it('shouldn\'t confirm email if confirmationCode is incorrect', async () => {
        await request(httpServer)
            .post('/auth/registration-confirmation')
            .send({ code: 'incorrect confirmation code' })
            .expect(HttpStatus.BAD_REQUEST)
    })

    let confirmationCode
    it('should confirm email, using confirmationCode from usersRepository', async () => {
        const user = await usersRepository.findUserById(createdUserId)
        confirmationCode = user?.emailConfirmation.confirmationCode

        await request(httpServer)
            .post('/auth/registration-confirmation')
            .send({ code: confirmationCode })
            .expect(HttpStatus.NO_CONTENT)
    })

    it('resend confirmation code, shouldn\'t change confirmation code from usersRepository if user is already confirmed', async () => {
        let user = await usersRepository.findUserById(createdUserId)
        const confirmationCode = user?.emailConfirmation.confirmationCode

        await request(httpServer)
            .post('/auth/registration-email-resending')
            .send({ email: user?.email })
            .expect(HttpStatus.BAD_REQUEST)

        user = await usersRepository.findUserById(createdUserId)
        const newConfirmationCode = user?.emailConfirmation.confirmationCode
        expect(confirmationCode === newConfirmationCode).toBe(true)
    })

    it('shouldn\'t confirm email if this user was been confirmed', async () => {
        await request(httpServer)
            .post('/auth/registration-confirmation')
            .send({ code: confirmationCode })
            .expect(HttpStatus.BAD_REQUEST)
    })

    it('shouldn\'t login, status 401, incorrect logs', async () => {
        const loginInputData = new LoginInputDTO('notAEmail', 'notAPassword')

        await request(httpServer)
            .post('/auth/login')
            .send(loginInputData)
            .expect(HttpStatus.UNAUTHORIZED)
    })

    let accessToken
    let refreshToken
    it('should login, status 200, getting accessToken, refreshToken', async () => {
        const loginInputData = new LoginInputDTO(correctUserInputData.email, correctUserInputData.password)

        const response = await request(httpServer)
            .post('/auth/login')
            .send(loginInputData)
            .expect(HttpStatus.OK)

        accessToken = response.body.accessToken
        refreshToken = response.header['set-cookie']
    })

    it('shouldn\'t logout if refreshToken is incorrect, status 401', async () => {
        await request(httpServer)
            .post('/auth/logout')
            .set('Cookie', 'incorrectRefreshToken')
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should logout using refreshToken, status 204', async () => {
        await request(httpServer)
            .post('/auth/logout')
            .set('Cookie', refreshToken)
            .expect(HttpStatus.NO_CONTENT)
    })
});
