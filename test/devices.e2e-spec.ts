import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from "@nestjs/platform-express"
import { createApp } from '../src/createApp'
import { UserInputModel } from '../src/SuperAdmin/api/models/UserInputModel';

describe('e2e-devices', () => {
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
        email: 'semyn03@mail.ru'
    }
    const secondCorrectUserInputData: UserInputModel = {
        login: 'justSeme1',
        password: '123123123',
        email: 'semyn013@mail.ru'
    }

    it('should create user for login', async () => {
        await request(httpServer)
            .post('/sa/users')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(correctUserInputData)
            .expect(HttpStatus.CREATED)

        const usersResponseData = await request(httpServer)
            .get('/sa/users')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(usersResponseData.body.items[0].email).toBe(correctUserInputData.email)
        expect(usersResponseData.body.items[0].login).toBe(correctUserInputData.login)
    })

    it('should create the second user for login', async () => {
        await request(httpServer)
            .post('/sa/users')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(secondCorrectUserInputData)
            .expect(HttpStatus.CREATED)

        const usersResponseData = await request(httpServer)
            .get('/sa/users')
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .expect(HttpStatus.OK)

        expect(usersResponseData.body.items[0].email).toBe(secondCorrectUserInputData.email)
        expect(usersResponseData.body.items[0].login).toBe(secondCorrectUserInputData.login)
    })

    let userRefreshToken
    it('should login for get refreshToken', async () => {
        const response = await request(httpServer)
            .post('/auth/login')
            .send({ loginOrEmail: correctUserInputData.email, password: correctUserInputData.password })
            .expect(HttpStatus.OK)

        userRefreshToken = response.header['set-cookie']
    })

    let secondUserRefreshToken
    it('should login for get the second refreshToken', async () => {
        const response = await request(httpServer)
            .post('/auth/login')
            .send({ loginOrEmail: secondCorrectUserInputData.email, password: secondCorrectUserInputData.password })
            .expect(HttpStatus.OK)

        secondUserRefreshToken = response.header['set-cookie']
    })

    it('shouldn\'t login with incorrect data', async () => {
        await request(httpServer)
            .post('/auth/login')
            .send({ loginOrEmail: 'notAEmail', password: 'notAPassword' })
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('shouldn\'t get response without refreshToken', async () => {
        await request(httpServer)
            .get('/security/devices')
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should get array with current session for user', async () => {
        const response = await request(httpServer)
            .get('/security/devices')
            .set('Cookie', userRefreshToken)
            .expect(HttpStatus.OK)

        expect(response.body[0].deviceId).toBeDefined;
        expect(response.body[0].ip).toBeDefined;
        expect(response.body[0].lastActiveDate).toBeDefined();
        expect(response.body[0].title).toBeDefined();
    })

    it('should login for create the second session', async () => {
        await request(httpServer)
            .post('/auth/login')
            .send({ loginOrEmail: correctUserInputData.email, password: correctUserInputData.password })
            .expect(HttpStatus.OK)
    })

    it('should login for create the third session', async () => {
        await request(httpServer)
            .post('/auth/login')
            .send({ loginOrEmail: correctUserInputData.email, password: correctUserInputData.password })
            .expect(HttpStatus.OK)
    })

    let secondSessionId
    it('should get array with three session for user', async () => {
        const response = await request(httpServer)
            .get('/security/devices')
            .set('Cookie', userRefreshToken)
            .expect(HttpStatus.OK)

        expect(response.body.length).toBe(3)
        secondSessionId = response.body[1].deviceId
    })

    it('shouldn\'t delete session by id if try to delete the deviceId of other user', async () => {
        await request(httpServer)
            .delete(`/security/devices/${secondSessionId}`)
            .set('Cookie', secondUserRefreshToken)
            .expect(HttpStatus.FORBIDDEN)

        const response = await request(httpServer)
            .get('/security/devices')
            .set('Cookie', userRefreshToken)
            .expect(HttpStatus.OK)

        expect(response.body.length).toBe(3)
    })

    it('should delete session by id', async () => {
        await request(httpServer)
            .delete(`/security/devices/${secondSessionId}`)
            .set('Cookie', userRefreshToken)
            .expect(HttpStatus.NO_CONTENT)

        const response = await request(httpServer)
            .get('/security/devices')
            .set('Cookie', userRefreshToken)
            .expect(HttpStatus.OK)

        expect(response.body.length).toBe(2)
    })

    it('shouldn\'t delete session by id if this is already deleted', async () => {
        const errorsMessagesResponse = await request(httpServer)
            .delete(`/security/devices/${secondSessionId}`)
            .set('Cookie', userRefreshToken)
            .expect(HttpStatus.NOT_FOUND)

        expect(errorsMessagesResponse.body.errorsMessages.length).toBe(1)
        expect(errorsMessagesResponse.body.errorsMessages[0].message).toBe('Device by deviceId paramether is not found')
        expect(errorsMessagesResponse.body.errorsMessages[0].field).toBe('deviceId')

        const response = await request(httpServer)
            .get('/security/devices')
            .set('Cookie', userRefreshToken)
            .expect(HttpStatus.OK)

        expect(response.body.length).toBe(2)
    })

    it('shouldn\'t delete sessions with incorrect refreshToken', async () => {
        await request(httpServer)
            .delete('/security/devices')
            .set('Cookie', 'incorrect')
            .expect(HttpStatus.UNAUTHORIZED)
    })

    it('should delete all sessions exclude current', async () => {
        await request(httpServer)
            .delete('/security/devices')
            .set('Cookie', userRefreshToken)
            .expect(HttpStatus.NO_CONTENT)

        const response = await request(httpServer)
            .get('/security/devices')
            .set('Cookie', userRefreshToken)
            .expect(HttpStatus.OK)

        expect(response.body.length).toBe(1)
    })
});
