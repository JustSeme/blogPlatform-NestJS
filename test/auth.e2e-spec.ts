import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"
import { createApp } from '../src/createApp'
import { LoginInputDTO } from '../src/auth/api/models/LoginInputDTO'
import { NewPasswordInputModel } from '../src/auth/api/models/NewPasswordInputModel';
import { UserInputModel } from '../src/SuperAdmin/api/models/UserInputModel';
import { UsersSQLRepository } from '../src/SuperAdmin/infrastructure/users-sql-repository';

describe('e2e-auth', () => {
    let app: NestExpressApplication;
    let httpServer;
    let usersRepository: UsersSQLRepository

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication()
        app = createApp(app)

        usersRepository = await app.resolve(UsersSQLRepository)

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
            .get(`/sa/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(response.body.totalCount === 1).toBe(true)
        expect(response.body.items[0].login).toEqual(correctUserInputData.login)
        expect(response.body.items[0].email).toEqual(correctUserInputData.email)

        createdUserId = response.body.items[0].id
    })

    it('resend confirmation code, shouldn\'t change confirmation code from usersRepository if email is incorrect', async () => {
        let user = await usersRepository.findUserDBModelById(createdUserId)
        const confirmationCode = user?.emailConfirmation.confirmationCode

        await request(httpServer)
            .post('/auth/registration-email-resending')
            .send({ email: 'incorrect email' })
            .expect(HttpStatus.BAD_REQUEST)

        user = await usersRepository.findUserDBModelById(createdUserId)
        const newConfirmationCode = user?.emailConfirmation.confirmationCode
        expect(confirmationCode === newConfirmationCode).toBe(true)
    })

    it('resend confirmation code, should change confirmation code from usersRepository', async () => {
        let user = await usersRepository.findUserDBModelById(createdUserId)
        const confirmationCode = user?.emailConfirmation.confirmationCode

        await request(httpServer)
            .post('/auth/registration-email-resending')
            .send({ email: user?.email })
            .expect(HttpStatus.NO_CONTENT)

        const updatedUser = await usersRepository.findUserDBModelById(createdUserId)
        const newConfirmationCode = updatedUser?.emailConfirmation.confirmationCode
        console.log(newConfirmationCode, confirmationCode, '1, 2');

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
        const user = await usersRepository.findUserDBModelById(createdUserId)
        confirmationCode = user?.emailConfirmation.confirmationCode

        await request(httpServer)
            .post('/auth/registration-confirmation')
            .send({ code: confirmationCode })
            .expect(HttpStatus.NO_CONTENT)
    })

    it('resend confirmation code, shouldn\'t change confirmation code from usersRepository if user is already confirmed', async () => {
        let user = await usersRepository.findUserDBModelById(createdUserId)
        const confirmationCode = user?.emailConfirmation.confirmationCode

        await request(httpServer)
            .post('/auth/registration-email-resending')
            .send({ email: user?.email })
            .expect(HttpStatus.BAD_REQUEST)

        user = await usersRepository.findUserDBModelById(createdUserId)
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

    it('shouldn\'t get user info, if accessToken is incorrect', async () => {
        await request(httpServer)
            .get('/auth/me')
            .send({ accessToken: 'incorrect' })
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should get user info, using accessToken', async () => {
        const response = await request(httpServer)
            .get('/auth/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(HttpStatus.OK)

        expect(response.body.email).toBe(correctUserInputData.email)
        expect(response.body.login).toBe(correctUserInputData.login)
    })

    it('shouldn\'t logout if refreshToken is incorrect, status 401', async () => {
        await request(httpServer)
            .post('/auth/logout')
            .set('Cookie', 'incorrectRefreshToken')
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('shouldn\'t refresh tokens, if refreshToken is incorrect', async () => {
        await request(httpServer)
            .post('/auth/refresh-token')
            .set('Cookie', 'incorrectRefreshToken')
            .expect(HttpStatus.UNAUTHORIZED)
    })

    let correctAccessToken
    let correctRefreshToken
    it('should refresh tokens, using refreshToken', async () => {
        const response = await request(httpServer)
            .post('/auth/refresh-token')
            .set('Cookie', refreshToken)
            .expect(HttpStatus.OK)

        correctAccessToken = response.body.accessToken
        correctRefreshToken = response.header['set-cookie']
    })

    it('shouldn\'t refresh tokens, if refreshToken is already updated(expired)', async () => {
        await request(httpServer)
            .post('/auth/refresh-token')
            .set('Cookie', refreshToken)
            .expect(HttpStatus.UNAUTHORIZED)
    })

    let userPasswordRecoveryCode
    it('should update passwordRecoveryCode for current user, status 204', async () => {
        await request(httpServer)
            .post('/auth/password-recovery')
            .send({ email: correctUserInputData.email })
            .expect(HttpStatus.NO_CONTENT)

        const user = await usersRepository.findUserDBModelById(createdUserId)
        userPasswordRecoveryCode = user?.passwordRecovery.confirmationCode
    })

    it('should throw 404 if email is invalid', async () => {
        await request(app.getHttpServer())
            .post('/password-recovery')
            .send({ email: 'invalid-email' })
            .expect(HttpStatus.NOT_FOUND)
    })

    it('shouldn\'t update user password if recoveryCode is incorrect', async () => {
        const newPasswordInputModel: NewPasswordInputModel = {
            newPassword: 'newPassword', // min 6 max 20
            recoveryCode: 'incorrect revcoveryCode'
        }

        let user = await usersRepository.findUserDBModelById(createdUserId)
        const oldUserPasswordHash = user?.passwordHash

        await request(httpServer)
            .post('/auth/new-password')
            .send(newPasswordInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        user = await usersRepository.findUserDBModelById(createdUserId)
        const newUserPasswordHash = user?.passwordHash

        expect(oldUserPasswordHash === newUserPasswordHash).toBe(true)
    })

    it('shouldn\'t update user password new password is incorrect', async () => {
        const newPasswordInputModel: NewPasswordInputModel = {
            newPassword: 'min6s', // min 6 max 20
            recoveryCode: userPasswordRecoveryCode
        }

        let user = await usersRepository.findUserDBModelById(createdUserId)
        const oldUserPasswordHash = user?.passwordHash

        await request(httpServer)
            .post('/auth/new-password')
            .send(newPasswordInputModel)
            .expect(HttpStatus.BAD_REQUEST)

        user = await usersRepository.findUserDBModelById(createdUserId)
        const newUserPasswordHash = user?.passwordHash

        expect(oldUserPasswordHash === newUserPasswordHash).toBe(true)
    })

    it('should update user password, using userPasswordRecoveryCode', async () => {
        const newPasswordInputModel: NewPasswordInputModel = {
            newPassword: 'newPassword', // min 6 max 20
            recoveryCode: userPasswordRecoveryCode
        }

        let user = await usersRepository.findUserDBModelById(createdUserId)
        const oldUserPasswordHash = user?.passwordHash

        await request(httpServer)
            .post('/auth/new-password')
            .send(newPasswordInputModel)
            .expect(HttpStatus.NO_CONTENT)

        user = await usersRepository.findUserDBModelById(createdUserId)
        const newUserPasswordHash = user?.passwordHash

        expect(oldUserPasswordHash === newUserPasswordHash).toBe(false)
    })

    it('shouldn\'t logout if refreshToken is expired, status 401', async () => {
        await request(httpServer)
            .post('/auth/logout')
            .set('Cookie', refreshToken)
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should refresh tokens for logout, using refreshToken', async () => {
        const response = await request(httpServer)
            .post('/auth/refresh-token')
            .set('Cookie', correctRefreshToken)
            .expect(HttpStatus.OK)

        correctAccessToken = response.body.accessToken
        correctRefreshToken = response.header['set-cookie']
    })

    it('should logout using refreshToken, status 204', async () => {
        await request(httpServer)
            .post('/auth/logout')
            .set('Cookie', correctRefreshToken)
            .expect(HttpStatus.NO_CONTENT)
    })
});
