import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"
import { createApp } from '../src/createApp'
import { UserInputModel } from '../src/auth/api/models/UserInputModel';
import { LoginInputDTO } from '../src/auth/api/models/LoginInputDTO'

describe('test-auth', () => {
    let app: NestExpressApplication;
    let httpServer;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication()
        app = createApp(app)
        // app.useGlobalPipes()

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

    it('should return array with one created user', async () => {
        const response = await request(httpServer)
            .get(`/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(response.body.totalCount === 1).toBe(true)
        expect(response.body.items[0].login).toEqual(correctUserInputData.login)
        expect(response.body.items[0].email).toEqual(correctUserInputData.email)
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
